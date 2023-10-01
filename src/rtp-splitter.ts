import { createSocket, RemoteInfo } from 'dgram'
import { bindToPort } from './ports'
import { fromEvent, merge, ReplaySubject } from 'rxjs'
import { map, share, takeUntil } from 'rxjs/operators'
import { getPayloadType, isRtpMessagePayloadType } from './rtp'

export interface SocketTarget {
  port: number
  address?: string
}

export interface RtpMessageDescription {
  isRtpMessage: boolean
  payloadType: number
  info: RemoteInfo
  message: Buffer
}

export type RtpMessageHandler = (
  description: RtpMessageDescription,
) => SocketTarget | null

export class RtpSplitter {
  public readonly socket = createSocket('udp4')
  public readonly portPromise = bindToPort(this.socket)
  private onClose = new ReplaySubject<any>()
  public readonly onMessage = fromEvent<[Buffer, RemoteInfo]>(
    this.socket,
    'message',
  ).pipe(
    map(([message, info]) => {
      const payloadType = getPayloadType(message)

      return {
        message,
        info,
        isRtpMessage: isRtpMessagePayloadType(payloadType),
        payloadType,
      }
    }),
    takeUntil(this.onClose),
    share(),
  )

  constructor(messageHandler?: RtpMessageHandler) {
    if (messageHandler) {
      this.addMessageHandler(messageHandler)
    }

    merge(fromEvent(this.socket, 'close'), fromEvent(this.socket, 'error'))
      .pipe(takeUntil(this.onClose))
      .subscribe(() => {
        this.cleanUp()
      })
  }

  addMessageHandler(handler: RtpMessageHandler) {
    this.onMessage.subscribe((description) => {
      const forwardingTarget = handler(description)

      if (forwardingTarget) {
        this.send(description.message, forwardingTarget)
      }
    })
  }

  async send(message: Buffer, sendTo: SocketTarget) {
    await this.portPromise

    if (this.closed) {
      // If we send a message on a closed socket, it will throw an ERR_SOCKET_DGRAM_NOT_RUNNING error
      return
    }

    this.socket.send(message, sendTo.port, sendTo.address || '127.0.0.1')
  }

  private cleanedUp = false
  private cleanUp() {
    this.closed = true

    if (this.cleanedUp) {
      return
    }

    this.cleanedUp = true
    this.onClose.next(null)
  }

  private closed = false
  close() {
    if (this.closed) {
      return
    }

    this.socket.close()
    this.cleanUp()
  }
}
