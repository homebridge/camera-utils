import { reservePorts } from '../src'
// import { createSocket } from 'dgram'

// function exportPortToBeOpen(port: number) {
//   return new Promise(async (resolve, reject) => {
//     const socket = createSocket('udp4')
//     socket.once('error', reject)
//
//     await socket.bind(port, () => {
//       socket.close()
//       resolve()
//     })
//     // TODO: reject on error
//   })
// }

describe('Port Utils', () => {
  it('should be able to reserve a single port', async () => {
    const ports = await reservePorts()

    expect(ports).toHaveLength(1)
    // exportPortToBeOpen(ports[0])
  })

  it('should be able to reserve multiple port', async () => {
    const ports = await reservePorts({ count: 3 })

    expect(ports).toHaveLength(3)
    // exportPortToBeOpen(ports[0])

    for (let i = 1; i < ports.length; i++) {
      expect(ports[i]).toEqual(ports[i - 1] + 1)
      // exportPortToBeOpen(ports[i])
    }
  })
})
