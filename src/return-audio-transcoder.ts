import { RtpSplitter } from './rtp-splitter'
import { FfmpegProcess, FfmpegProcessOptions } from './ffmpeg-process'
import { createCryptoLine } from './srtp'
import { reservePorts } from './ports'
import { PrepareStreamRequest } from 'homebridge'
import { getSsrc } from './rtp'

export class ReturnAudioTranscoder {
  public readonly returnRtpSplitter = new RtpSplitter()
  public readonly ffmpegProcess = new FfmpegProcess({
    ffmpegArgs: [
      '-hide_banner',
      '-protocol_whitelist',
      'pipe,udp,rtp,file,crypto',
      '-f',
      'sdp',
      '-acodec',
      'libfdk_aac',
      '-i',
      'pipe:',
      '-map',
      '0:0',
      ...this.options.outputArgs,
    ],
    ...this.options,
  })
  public readonly reservedPortsPromise = reservePorts({ count: 2 })

  constructor(
    private options: {
      outputArgs: (string | number)[]
      prepareStreamRequest: PrepareStreamRequest
      incomingAudioOptions: {
        ssrc: number
        rtcpPort: number
      }
    } & Omit<FfmpegProcessOptions, 'ffmpegArgs'>
  ) {}

  async start() {
    const [rtpPort, rtcpPort] = await this.reservedPortsPromise,
      {
        targetAddress,
        addressVersion,
        audio: { srtp_key: srtpKey, srtp_salt: srtpSalt },
      } = this.options.prepareStreamRequest,
      {
        ssrc: incomingAudioSsrc,
        rtcpPort: incomingAudioRtcpPort,
      } = this.options.incomingAudioOptions

    this.ffmpegProcess.writeStdin(
      // This SDP was generated using ffmpeg, and describes the type of packets we expect to receive from HomeKit.
      [
        'v=0',
        'o=- 0 0 IN IP4 127.0.0.1',
        's=Talk',
        `c=IN ${addressVersion
          .replace('v', '')
          .toUpperCase()} ${targetAddress}`,
        't=0 0',
        'a=tool:libavformat 58.38.100',
        `m=audio ${rtpPort} RTP/AVP 110`,
        'b=AS:24',
        'a=rtpmap:110 MPEG4-GENERIC/16000/1',
        'a=fmtp:110 profile-level-id=1;mode=AAC-hbr;sizelength=13;indexlength=3;indexdeltalength=3; config=F8F0212C00BC00',
        createCryptoLine({
          srtpKey,
          srtpSalt,
        }),
      ].join('\n')
    )

    this.returnRtpSplitter.addMessageHandler(({ isRtpMessage, message }) => {
      // This splitter will receive all audio-related packets from HomeKit.
      // This includes RTP + RTCP for return audio, as well as RTCP for incoming audio
      if (!isRtpMessage && getSsrc(message) === incomingAudioSsrc) {
        return {
          port: incomingAudioRtcpPort,
        }
      }

      return {
        port: isRtpMessage ? rtpPort : rtcpPort,
      }
    })

    // this is the port that needs to be passed to homebridge as audio.port
    return this.returnRtpSplitter.portPromise
  }

  stop() {
    this.ffmpegProcess.stop()
    this.returnRtpSplitter.close()
  }
}
