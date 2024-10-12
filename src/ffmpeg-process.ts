import { spawn } from 'node:child_process'
import process from 'node:process'
import { Subject } from 'rxjs'

import { defaultFfmpegPath } from './ffmpeg.js'

const noop = () => null
const onGlobalProcessStopped = new Subject()

// Register a single event listener, rather than listener per ffmpeg process
// This helps avoid a warning for hitting too many listeners
process.on('exit', () => onGlobalProcessStopped.next(null))

export interface FfmpegProcessOptions {
  ffmpegPath?: string
  ffmpegArgs: (string | number)[]
  logger?: {
    error: (log: string) => unknown
    info: (log: string) => unknown
  }
  logLabel?: string
  exitCallback?: (code: number | null, signal: string | null) => unknown
  stdoutCallback?: (data: any) => unknown
  startedCallback?: () => unknown
}

export class FfmpegProcess {
  private ff: ReturnType<typeof spawn>

  private processSubscription = onGlobalProcessStopped.subscribe(() => {
    this.stop()
  })

  private started = false
  private stopped = false
  private exited = false

  constructor(public readonly options: FfmpegProcessOptions) {
    this.ff = spawn(
      this.options.ffmpegPath || defaultFfmpegPath,
      this.options.ffmpegArgs.map(x => x.toString()),
    )

    const { logger, logLabel } = options
    const logError = logger?.error || noop
    const logInfo = logger?.info || noop
    const logPrefix = logLabel ? `${logLabel}: ` : ''

    if (options.stdoutCallback && this.ff.stdout) {
      const { stdoutCallback } = options
      this.ff.stdout.on('data', (data: any) => {
        stdoutCallback(data)
      })
    }

    this.ff.stderr?.on('data', (data: any) => {
      if (!this.started) {
        this.started = true
        options.startedCallback?.()
      }

      logInfo(logPrefix + data)
    })

    this.ff.stdin?.on('error', (error) => {
      if (!error.message.includes('EPIPE')) {
        logError(logPrefix + error.message)
      }
    })

    this.ff.on('exit', (code, signal) => {
      this.exited = true
      this.options.exitCallback?.(code, signal)

      if (!code || code === 255) {
        logInfo(`${logPrefix}stopped gracefully`)
      } else {
        logError(`${logPrefix}exited with code ${code} and signal ${signal}`)
      }
      this.stop()
    })
  }

  stop() {
    if (this.stopped) {
      return
    }
    this.stopped = true
    this.processSubscription.unsubscribe()

    this.ff.stderr?.pause()
    this.ff.stdout?.pause()

    if (!this.exited) {
      this.ff.kill()
    }
  }

  writeStdin(input: string) {
    if (this.stopped) {
      return
    }

    if (this.ff.stdin) {
      this.ff.stdin.write(input)
    }
    if (this.ff.stdin) {
      this.ff.stdin.end()
    }
  }
}
