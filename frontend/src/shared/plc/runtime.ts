import type { LadderElement } from '../../store/ladderStore'
import type { PlcBitMap, TimerState, CounterState, TimerFunc, CounterFunc } from './types'

export interface PlcState {
  inputs: PlcBitMap
  bits: PlcBitMap
  timers: Record<string, TimerState>
  counters: Record<string, CounterState>
}

export interface TickResult {
  nextBits: PlcBitMap
  nextTimers: Record<string, TimerState>
  nextCounters: Record<string, CounterState>
  poweredById: Set<string>
}

type Dir = 'left' | 'right' | 'up' | 'down'
interface Ports { left: boolean; right: boolean; up: boolean; down: boolean }

function keyOf(x: number, y: number): string { return `${x},${y}` }

function readBit(address: string | undefined, state: PlcState): boolean {
  if (!address) return false
  const prefix = address[0]?.toUpperCase()
  if (prefix === 'I') return !!state.inputs[address]
  if (prefix === 'Q' || prefix === 'M') return !!state.bits[address]
  if (prefix === 'T') return !!state.timers[address]?.q
  if (prefix === 'C') return !!state.counters[address]?.q
  return !!state.bits[address]
}

function getPorts(el: LadderElement, state: PlcState): Ports {
  switch (el.type) {
    case 'HLINE':
      return { left: true, right: true, up: false, down: false }
    case 'VLINE':
      return { left: false, right: false, up: true, down: true }
    case 'NO': {
      const closed = readBit(el.address, state)
      return { left: true, right: closed, up: false, down: false }
    }
    case 'NC': {
      const closed = !readBit(el.address, state)
      return { left: true, right: closed, up: false, down: false }
    }
    case 'COIL':
    case 'TIMER':
    case 'COUNTER':
      return { left: true, right: false, up: false, down: false }
    default:
      return { left: false, right: false, up: false, down: false }
  }
}

export function computePowered(elements: LadderElement[], state: PlcState): Set<string> {
  const posToEl = new Map<string, LadderElement>()
  for (const el of elements) posToEl.set(keyOf(el.x, el.y), el)

  const visited = new Set<string>()
  const queue: Array<{ x: number; y: number }> = []

  // seeds: any cell at x==1 that allows left connection (implicit left rail)
  for (const el of elements) {
    if (el.x === 1) {
      const p = getPorts(el, state)
      if (p.left) queue.push({ x: el.x, y: el.y })
    }
  }

  function neighborCoords(x: number, y: number, dir: Dir): { nx: number; ny: number } {
    if (dir === 'left') return { nx: x - 1, ny: y }
    if (dir === 'right') return { nx: x + 1, ny: y }
    if (dir === 'up') return { nx: x, ny: y - 1 }
    return { nx: x, ny: y + 1 }
  }

  const allDirs: Dir[] = ['left', 'right', 'up', 'down']

  while (queue.length) {
    const { x, y } = queue.shift()!
    const key = keyOf(x, y)
    if (visited.has(key)) continue
    const el = posToEl.get(key)
    if (!el) continue
    visited.add(key)

    const ports = getPorts(el, state)

    for (const dir of allDirs) {
      if (!ports[dir]) continue
      const { nx, ny } = neighborCoords(x, y, dir)
      const nKey = keyOf(nx, ny)
      const nEl = posToEl.get(nKey)
      if (!nEl) continue
      const nPorts = getPorts(nEl, state)
      // Opposite port must be open on neighbor
      if (dir === 'left' && nPorts.right) queue.push({ x: nx, y: ny })
      else if (dir === 'right' && nPorts.left) queue.push({ x: nx, y: ny })
      else if (dir === 'up' && nPorts.down) queue.push({ x: nx, y: ny })
      else if (dir === 'down' && nPorts.up) queue.push({ x: nx, y: ny })
    }
  }

  return visited
}

function normalizeCoilAddress(address: string | undefined): string | null {
  if (!address) return null
  return address
}

function getTimerFunc(el: LadderElement): TimerFunc {
  return (el.func as TimerFunc) === 'TOF' ? 'TOF' : 'TON'
}

function getCounterFunc(el: LadderElement): CounterFunc {
  return (el.func as CounterFunc) === 'CTD' ? 'CTD' : 'CTU'
}

export function tickPlc(elements: LadderElement[], prev: PlcState, dtMs: number): TickResult {
  const powered = computePowered(elements, prev)

  const nextBits: PlcBitMap = { ...prev.bits }
  const nextTimers: Record<string, TimerState> = { ...prev.timers }
  const nextCounters: Record<string, CounterState> = { ...prev.counters }

  // First, update Timers and Counters based on power
  for (const el of elements) {
    if (el.type === 'TIMER') {
      const addr = normalizeCoilAddress(el.address)
      if (!addr) continue
      const func = getTimerFunc(el)
      const presetMs = Number(el.params?.presetMs ?? 1000)
      const isPowered = powered.has(`${el.x},${el.y}`)
      const prevState: TimerState = nextTimers[addr] ?? { q: false, accMs: 0 }
      const state: TimerState = { ...prevState }
      if (func === 'TON') {
        if (isPowered) {
          state.accMs = Math.min(presetMs, state.accMs + dtMs)
          state.q = state.accMs >= presetMs
        } else {
          state.accMs = 0
          state.q = false
        }
      } else {
        // TOF
        if (isPowered) {
          state.q = true
          state.accMs = 0
        } else {
          state.accMs = Math.min(presetMs, state.accMs + dtMs)
          state.q = state.accMs < presetMs
        }
      }
      nextTimers[addr] = state
    }
    if (el.type === 'COUNTER') {
      const addr = normalizeCoilAddress(el.address)
      if (!addr) continue
      const func = getCounterFunc(el)
      const preset = Number(el.params?.preset ?? 10)
      const isPowered = powered.has(`${el.x},${el.y}`)
      const prevState: CounterState = nextCounters[addr] ?? { q: false, cv: func === 'CTD' ? preset : 0, lastIn: false }
      const state: CounterState = { ...prevState }
      if (isPowered && !prevState.lastIn) {
        if (func === 'CTU') {
          state.cv = state.cv + 1
          state.q = state.cv >= preset
        } else {
          // CTD
          state.cv = Math.max(0, state.cv - 1)
          state.q = state.cv <= 0
        }
      }
      state.lastIn = isPowered
      nextCounters[addr] = state
    }
  }

  // Then, apply coils
  for (const el of elements) {
    if (el.type !== 'COIL') continue
    const addr = normalizeCoilAddress(el.address)
    if (!addr) continue
    const isPowered = powered.has(`${el.x},${el.y}`)
    const func = (el.func || '').toUpperCase()
    if (func === 'SET') {
      if (isPowered) nextBits[addr] = true
    } else if (func === 'RST' || func === 'RESET') {
      if (isPowered) nextBits[addr] = false
    } else {
      nextBits[addr] = isPowered
    }
  }

  return { nextBits, nextTimers, nextCounters, poweredById: new Set(Array.from(powered)) }
}
