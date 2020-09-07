import {
  decodeSrtpOptions,
  generateSrtpOptions,
  encodeSrtpOptions,
} from '../src'

describe('SRTP Utils', () => {
  describe('decodeSrtpOptions', () => {
    it('should decode an srtp crypto string', () => {
      const input = 'NqC4Z0iABIbW2WLZHK4VGAdtjdsemf7qf9/odBa8',
        decoded = decodeSrtpOptions(input)

      expect(decoded).toEqual({
        srtpKey: Buffer.from('36a0b86748800486d6d962d91cae1518', 'hex'),
        srtpSalt: Buffer.from('076d8ddb1e99feea7fdfe87416bc', 'hex'),
      })
    })
  })

  describe('encodeSrtpOptions', () => {
    it('should decode an srtp crypto string', () => {
      const input = 'DRhwQ59h1cODtqGEmpomv3XvRfkH/nIHV/y1RVff',
        srtpOptions = decodeSrtpOptions(input)

      expect(encodeSrtpOptions(srtpOptions)).toEqual(input)
    })
  })

  describe('generateSrtpOptions', () => {
    it('should generate valid options', () => {
      const { srtpKey, srtpSalt } = generateSrtpOptions()

      expect(srtpKey.length).toEqual(16)
      expect(srtpSalt.length).toEqual(14)
    })

    it('should be able to be encoded/decode from base64', () => {
      const options = generateSrtpOptions(),
        srtpValue = encodeSrtpOptions(options),
        decodedOptions = decodeSrtpOptions(srtpValue)

      expect(decodedOptions).toEqual(options)
    })
  })
})
