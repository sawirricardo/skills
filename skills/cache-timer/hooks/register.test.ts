import { expect, mock, test } from 'claude-code/testing'

const usage = { input_tokens: 1, output_tokens: 1, cache_read_input_tokens: 100, cache_creation_input_tokens: 0, model: 'claude-opus-5-5' }

async function step($: any, agentId?: string) {
  const s = $.turn.step({ turnId: 't', index: 0, model: 'claude-opus-5-5', messageCount: 1, agentId })
  for await (const _ of s) void _
  return s.result
}

test('counts down from the last main-thread request', { options: { ttl: '5m', warnSeconds: 60 } }, async ($, on) => {
  const clock = mock.clock(on, { now: 1_000_000 })
  const statuses: (string | undefined)[] = []
  const toasts: string[] = []
  on('ui.status', ($, e) => { statuses.push(e.text); return { value: undefined } as never })
  on('ui.toast', ($, e) => { toasts.push(e.text); return { value: undefined } as never })
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('turn.step', async function* () {
    return { turnId: 't', index: 0, answer: '', toolUses: [], stopReason: 'end_turn' as const, usage }
  })

  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  expect(statuses.at(-1)).toBe('⚪ cache: -')

  await step($)
  expect(statuses.at(-1)).toBe('🟢 cache: 5:00')

  await clock.advance(250_000)
  expect(statuses.at(-1)).toBe('🟡 cache: 0:50 left')
  expect(toasts).toEqual(['Prompt cache expires in 1:00'])

  // a subagent request does not refresh the main thread's cache
  await step($, 'agent-1')
  await clock.advance(1_000)
  expect(statuses.at(-1)).toBe('🟡 cache: 0:49 left')

  await clock.advance(60_000)
  expect(statuses.at(-1)).toBe('🔴 cache: cold')

  await step($)
  expect(statuses.at(-1)).toBe('🟢 cache: 5:00')
})
