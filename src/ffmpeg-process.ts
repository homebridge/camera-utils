import { Subject } from 'rxjs'
import { spawn } from 'child_process'
import { defaultFfmpegPath } from './ffmpeg'

const noop = () => null,
  onGlobalProcessStopped = new Subject()

// register a single event listener, rather than listener per ffmpeg process
// this helps avoid a warning for hitting too many listeners
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
  startedCallback?: () => unknown
}

export class FfmpegProcess {
  private ff = spawn(
    this.options.ffmpegPath || defaultFfmpegPath,
    this.options.ffmpegArgs.map((x) => x.toString()),
  )
  private processSubscription = onGlobalProcessStopped.subscribe(() => {
    this.stop()
  })
  private started = false
  private stopped = false
  private exited = false

  constructor(public readonly options: FfmpegProcessOptions) {
    const { logger, logLabel } = options,
      logError = logger?.error || noop,
      logInfo = logger?.info || noop,
      logPrefix = logLabel ? `${logLabel}: ` : ''

    this.ff.stderr.on('data', (data: any) => {
      if (!this.started) {
        this.started = true
        options.startedCallback?.()
      }

      logInfo(logPrefix + data)
    })

    this.ff.stdin.on('error', (error) => {
      if (!error.message.includes('EPIPE')) {
        logError(logPrefix + error.message)
      }
    })

    this.ff.on('exit', (code, signal) => {
      this.exited = true
      this.options.exitCallback?.(code, signal)

      if (!code || code === 255) {
        logInfo(logPrefix + 'stopped gracefully')
      } else {
        logError(logPrefix + `exited with code ${code} and signal ${signal}`)
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

    this.ff.stderr.pause()
    this.ff.stdout.pause()

    if (!this.exited) {
      this.ff.kill()
    }
  }

  writeStdin(input: string) {
    if (this.stopped) {
      return
    }

    this.ff.stdin.write(input)
    this.ff.stdin.end()
  }
}
