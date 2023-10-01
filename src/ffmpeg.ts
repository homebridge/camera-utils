import execa from 'execa'
import ffmpegForHomebridgePath from 'ffmpeg-for-homebridge'

export const defaultFfmpegPath: string = ffmpegForHomebridgePath || 'ffmpeg'

export async function doesFfmpegSupportCodec(
  codec: string,
  ffmpegPath = defaultFfmpegPath,
) {
  const output = await execa(ffmpegPath, ['-codecs'])
  return output.stdout.includes(codec)
}

export async function isFfmpegInstalled(ffmpegPath = defaultFfmpegPath) {
  try {
    await execa(ffmpegPath, ['-codecs'])
    return true
  } catch (_) {
    return false
  }
}
