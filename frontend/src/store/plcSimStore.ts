import { create } from 'zustand'
import { useLadderStore } from './ladderStore'
import { tickPlc } from '../shared/plc/runtime'
import type { PlcState } from '../shared/plc/runtime'

interface PlcSimState extends PlcState {
  running: boolean
  setInput: (addr: string, value: boolean) => void
  toggleInput: (addr: string) => void
  step: (dtMs: number) => void
  reset: () => void
  setRunning: (v: boolean) => void
}

export const usePlcSimStore = create<PlcSimState>((set) => ({
  inputs: {},
  bits: {},
  timers: {},
  counters: {},
  running: false,

  setInput: (addr, value) => set((s) => ({ inputs: { ...s.inputs, [addr]: value } })),
  toggleInput: (addr) => set((s) => ({ inputs: { ...s.inputs, [addr]: !s.inputs[addr] } })),

  step: (dtMs) => set((s) => {
    const elements = useLadderStore.getState().elements
    const res = tickPlc(elements, s, dtMs)
    return {
      bits: res.nextBits,
      timers: res.nextTimers,
      counters: res.nextCounters,
    }
  }),

  reset: () => set({ bits: {}, timers: {}, counters: {} }),
  setRunning: (v) => set({ running: v }),
}))
