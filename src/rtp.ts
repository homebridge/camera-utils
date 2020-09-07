export function getPayloadType(message: Buffer) {
  return message.readUInt8(1) & 0x7f
}

export function isRtpMessagePayloadType(payloadType: number) {
  return payloadType > 90 || payloadType === 0
}

export function getSsrc(message: Buffer) {
  try {
    const payloadType = getPayloadType(message),
      isRtp = isRtpMessagePayloadType(payloadType)
    return message.readUInt32BE(isRtp ? 8 : 4)
  } catch (_) {
    return null
  }
}
