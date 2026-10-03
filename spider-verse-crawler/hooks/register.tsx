import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

const frame = atom({ plugin: 'spider-verse-crawler', key: 'frame' } as const, null)

const TRACK = 64
const TICK_MS = 110
const TOTAL_FRAMES = 4 * TRACK // two round trips
const GLITCH = ['magenta', 'cyan', 'red', 'magenta', 'yellow']

// Two leg poses, same width so the spider doesn't wobble sideways.
const POSES = [
  [' ╲╲ ╱╲ ╱╱ ', '╱ ╲(◉‿◉)╱ ╲', ' ╱ ╱▓▓╲ ╲ '],
  ['╲  ╲╱╲╱  ╱', ' ╲ (◉‿◉) ╱ ', '╱ ╱ ▓▓ ╲ ╲'],
]

const position = (f: number) => {
  const t = f % (2 * TRACK)
  return t < TRACK ? t : 2 * TRACK - t
}

let timer: { cancel: () => void } | undefined

function play($) {
  timer?.cancel()
  update($, frame, () => 0)
  timer = $.clock.every(TICK_MS, () => {
    update($, frame, f => {
      if (f === null) return null
      if (f + 1 >= TOTAL_FRAMES) return null
      return f + 1
    })
  })
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'spider', description: 'Make the Spider-Verse spider crawl again' })
    play($)
    return next(e)
  })

  on('command.run', { name: 'spider' }, async ($, e, next) => {
    play($)
    return { text: 'Thwip! 🕷️' }
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const f = await read($, frame)
    if (f === null || e.props.hasSurvey) return next(e)

    const { Box, Text } = $.ui.resolve(e)
    const x = position(f)
    const pose = POSES[Math.floor(f / 2) % 2]
    // Spider-Verse chromatic glitch: colour flickers, with an occasional stutter.
    const color = GLITCH[(f * 7 + Math.floor(f / 5)) % GLITCH.length]
    const stutter = f % 13 === 0 ? ' ' : ''

    return (
      <Box flexDirection="column">
        {pose.map((row, i) => (
          <Text key={`l${i}`}>
            <Text dimColor>{' '.repeat(x)}</Text>
            <Text color={color} bold>{stutter + row}</Text>
          </Text>
        ))}
      </Box>
    )
  })
}
