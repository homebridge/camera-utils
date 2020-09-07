import os from 'os'
import { networkInterfaceDefault } from 'systeminformation'

// NOTE: This is used to get the default ip address seen from outside the device.
// This _was_ needed to set the `address` field for hap camera streams, but the address is automatically determined after homebridge 1.1.3
// Keeping this here for backwards compatibility for now.  All camera plugins will eventually drop support for <1.1.3 and this can be removed
export async function getDefaultIpAddress(preferIpv6 = false) {
  const interfaces = os.networkInterfaces(),
    defaultInterfaceName = await networkInterfaceDefault(),
    defaultInterface = interfaces[defaultInterfaceName],
    externalInfo = defaultInterface?.filter((info) => !info.internal),
    preferredFamily = preferIpv6 ? 'IPv6' : 'IPv4',
    addressInfo =
      externalInfo?.find((info) => info.family === preferredFamily) ||
      externalInfo?.[0]

  if (!addressInfo) {
    throw new Error('Unable to get default network address')
  }

  return addressInfo.address
}
