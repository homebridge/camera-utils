import getPort from 'get-port'
import { Socket } from 'dgram'
import { AddressInfo } from 'net'

let reservedPorts: number[] = []
export function releasePorts(ports: number[]) {
  reservedPorts = reservedPorts.filter((p) => !ports.includes(p))
}

// Need to reserve ports in sequence because ffmpeg uses the next port up by default.  If it's taken, ffmpeg will error
export async function reservePorts({
  count = 1,
  attemptNumber = 0,
}: {
  count?: number
  attemptNumber?: number
} = {}): Promise<number[]> {
  if (attemptNumber > 100) {
    throw new Error('Failed to reserve ports after 100 tries')
  }

  const port = await getPort(),
    ports = [port],
    tryAgain = () => {
      return reservePorts({
        count,
        attemptNumber: attemptNumber + 1,
      })
    }

  if (reservedPorts.includes(port)) {
    // this avoids race conditions where we can reserve the same port twice
    return tryAgain()
  }

  for (let i = 1; i < count; i++) {
    const targetConsecutivePort = port + i,
      openPort = await getPort({ port: targetConsecutivePort })

    if (openPort !== targetConsecutivePort) {
      // can't reserve next port, bail and get another set
      return tryAgain()
    }

    ports.push(openPort)
  }

  if (ports.some((p) => reservedPorts.includes(p))) {
    return tryAgain()
  }

  reservedPorts.push(...ports)
  return ports
}

export function bindToPort(socket: Socket) {
  return new Promise<number>((resolve, reject) => {
    socket.on('error', reject)

    // 0 means select a random open port
    socket.bind(0, () => {
      const { port } = socket.address() as AddressInfo

      reservedPorts.push(port)
      socket.once('close', () => releasePorts([port]))
      resolve(port)
    })
  })
}
