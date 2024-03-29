import { doesFfmpegSupportCodec, isFfmpegInstalled } from '../src'

describe('Ffmpeg Utils', () => {
  describe('isFfmpegInstalled', () => {
    it('should return true using default path from ffmpeg-for-homebridge', async () => {
      expect(await isFfmpegInstalled()).toEqual(true)
    })

    it('should return false if given a bad path to ffmpeg', async () => {
      expect(await isFfmpegInstalled('some_bad_path')).toEqual(false)
    })
  })

  describe('doesFfmpegSupportCodec', () => {
    it('should return true for a supported codec', async () => {
      expect(await doesFfmpegSupportCodec('opus')).toEqual(true)
    })

    it('should return false for a supported codec', async () => {
      expect(await doesFfmpegSupportCodec('unknown_codec')).toEqual(false)
    })

    it('should throw if given a bad path to ffmpeg', async () => {
      await expect(
        doesFfmpegSupportCodec('opus', 'bad_ffmpeg_path'),
      ).rejects.toThrowError()
    })
  })
})
