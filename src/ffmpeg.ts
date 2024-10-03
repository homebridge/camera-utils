import { execa } from 'execa'
import ffmpegForHomebridgePath from 'ffmpeg-for-homebridge'

export const defaultFfmpegPath: string = ffmpegForHomebridgePath || 'ffmpeg'

export async function doesFfmpegSupportCodec(
  codec: string,
  ffmpegPath = defaultFfmpegPath,
): Promise<boolean> {
  try {
    const { stdout } = await execa(ffmpegPath, ['-codecs'])
    return stdout.includes(codec)
  } catch (error) {
    throw new Error(`FFmpeg not found at path: ${ffmpegPath}, error: ${error}`)
  }
}

export async function isFfmpegInstalled(ffmpegPath = defaultFfmpegPath) {
  try {
    await execa(ffmpegPath, ['-codecs'])
    return true
  } catch (_) {
    return false
  }
}
