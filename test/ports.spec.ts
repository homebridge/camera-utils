import { createSocket } from 'node:dgram'
import { describe, it, expect } from 'vitest';
import { reservePorts } from '../src/index.js'

function expectPortToBeOpen(port: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const socket = createSocket('udp4')
    socket.once('error', reject)

    socket.bind(port, () => {
      socket.close()
      resolve()
    })
  })
}

describe('port Utils', () => {
  it('should be able to reserve a single port', async () => {
    const ports = await reservePorts()

    expect(ports).toHaveLength(1)
    await expectPortToBeOpen(ports[0])
  })

  it('should be able to reserve multiple ports', async () => {
    const ports = await reservePorts({ count: 3 })

    expect(ports).toHaveLength(3)
    await expectPortToBeOpen(ports[0])

    for (let i = 1; i < ports.length; i++) {
      expect(ports[i]).toEqual(ports[i - 1] + 1)
      await expectPortToBeOpen(ports[i])
    }
  })
})
