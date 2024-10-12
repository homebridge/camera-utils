import type { Buffer } from 'node:buffer'
import type { FfmpegProcessOptions } from './ffmpeg-process.js'
import { FfmpegProcess } from './ffmpeg-process.js'
import { reservePorts } from './ports.js'
import { getSsrc } from './rtp.js'
import { RtpSplitter } from './rtp-splitter.js'
import { createCryptoLine } from './srtp.js'

interface Source {
  srtp_key: Buffer
  srtp_salt: Buffer
}

interface PrepareStreamRequest {
  targetAddress: string
  addressVersion: 'ipv4' | 'ipv6'
  audio: Source
}

interface StartStreamRequest {
  audio: {
    codec: 'OPUS' | 'AAC_eld' | string
    channel: number
    sample_rate: number
    pt: number
  }
}

const defaultStartStreamReqeuest: StartStreamRequest = {
  audio: {
    codec: 'AAC_eld',
    channel: 1,
    sample_rate: 16,
    pt: 110,
  },
}

export class ReturnAudioTranscoder {
  public readonly returnRtpSplitter
  private startStreamRequest

  public readonly ffmpegProcess

  constructor(
    private options: {
      outputArgs: (string | number)[]
      prepareStreamRequest: PrepareStreamRequest
      incomingAudioOptions: {
        ssrc: number
        rtcpPort: number
      }
      returnAudioSplitter?: RtpSplitter
      startStreamRequest?: StartStreamRequest
    } & Omit<FfmpegProcessOptions, 'ffmpegArgs'>,
  ) {
    this.startStreamRequest = this.options.startStreamRequest || defaultStartStreamReqeuest

    this.ffmpegProcess = new FfmpegProcess({
      ffmpegArgs: [
        '-hide_banner',
        '-protocol_whitelist',
        'pipe,udp,rtp,file,crypto',
        '-f',
        'sdp',
        '-acodec',
        this.startStreamRequest.audio.codec === 'OPUS' ? 'libopus' : 'libfdk_aac',
        '-i',
        'pipe:',
        '-map',
        '0:0',
        ...this.options.outputArgs,
      ],
      ...this.options,
    })

    // allow return audio splitter to be passed in if you want to create one in the prepare stream phase, and create the transcoder in the stream request phase
    this.returnRtpSplitter = options.returnAudioSplitter || new RtpSplitter()
  }

  public readonly reservedPortsPromise = reservePorts({ count: 2 })

  // Removed duplicate constructor

  async start() {
    const [rtpPort, rtcpPort] = await this.reservedPortsPromise
    const {
      targetAddress,
      addressVersion,
      audio: { srtp_key: srtpKey, srtp_salt: srtpSalt },
    } = this.options.prepareStreamRequest
    const { ssrc: incomingAudioSsrc, rtcpPort: incomingAudioRtcpPort }
      = this.options.incomingAudioOptions
    const {
      codec,
      sample_rate,
      channel,
      pt: packetType,
    } = this.startStreamRequest.audio

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
        `m=audio ${rtpPort} RTP/AVP ${packetType}`,
        'b=AS:24',
        ...(codec === 'OPUS'
          ? [
              `a=rtpmap:${packetType} opus/${sample_rate}000/${channel}`,
              `a=fmtp:${packetType} minptime=10;useinbandfec=1`,
            ]
          : [
              `a=rtpmap:${packetType} MPEG4-GENERIC/${sample_rate}000/${channel}`,
              `a=fmtp:${packetType} profile-level-id=1;mode=AAC-hbr;sizelength=13;indexlength=3;indexdeltalength=3; config=F8F0212C00BC00`,
            ]),
        createCryptoLine({
          srtpKey,
          srtpSalt,
        }),
      ].join('\n'),
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
