export type PlcBitMap = Record<string, boolean>

export type TimerFunc = 'TON' | 'TOF'
export type CounterFunc = 'CTU' | 'CTD'

export interface TimerState {
  q: boolean
  accMs: number
}

export interface CounterState {
  q: boolean
  cv: number
  lastIn: boolean
}
