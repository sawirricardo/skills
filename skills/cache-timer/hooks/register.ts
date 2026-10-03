import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { CacheMark } from '../types'

const last = atom({ plugin: 'cache-timer', key: 'last' } as const, null as CacheMark | null)
const warned = atom({ plugin: 'cache-timer', key: 'warned' } as const, false)

function fmt(ms: number) {
  const s = Math.ceil(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const ss = String(s % 60).padStart(2, '0')
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`
}

async function tick($: EngineInterface, ttlMs: number, warnMs: number) {
  const mark = await read($, last)
  if (!mark) return $.ui.status('cache: -')
  const left = mark.at + ttlMs - (await $.clock.now())
  if (left <= 0) return $.ui.status('cache: cold')
  if (left <= warnMs) {
    if (!(await read($, warned))) {
      await update($, warned, () => true)
      $.ui.toast(`Prompt cache expires in ${fmt(left)}`)
    }
    return $.ui.status(`cache: ${fmt(left)} left!`)
  }
  $.ui.status(`cache: ${fmt(left)}`)
}

export const register: Register = (on, options) => {
  const ttlMs = options.ttl === '5m' ? 5 * 60_000 : 60 * 60_000
  const warnMs = Number(options.warnSeconds ?? 120) * 1000

  on('session.start', async ($, e, next) => {
    $.clock.every(1000, () => void tick($, ttlMs, warnMs))
    await tick($, ttlMs, warnMs)
    return next(e)
  })

  // Each main-thread model request reads/writes the cache and resets its TTL.
  on('turn.step', async function* ($, e, next) {
    const startedAt = await $.clock.now()
    const r = yield* next(e)
    if (e.agentId === undefined && r.usage) {
      await update($, last, () => ({ at: startedAt, model: r.usage!.model }))
      await update($, warned, () => false)
      await tick($, ttlMs, warnMs)
    }
    return r
  })

  on('session.end', async ($, e, next) => {
    if (e.reason === 'clear') {
      await update($, last, () => null)
      await tick($, ttlMs, warnMs)
    }
    return next(e)
  })
}
