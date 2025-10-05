import { create } from 'zustand'

export type LadderElementType = 'NO' | 'NC' | 'COIL' | 'TIMER' | 'COUNTER' | 'HLINE' | 'VLINE'

export interface LadderElement {
  id: string
  type: LadderElementType
  x: number
  y: number
  address?: string
  func?: string
  params?: Record<string, string | number>
}

interface LadderState {
  elements: LadderElement[]
  selectedId: string | null
  gridSize: number
  addElement: (type: LadderElementType) => void
  selectElement: (id: string | null) => void
  updateSelected: (partial: Partial<LadderElement>) => void
  moveSelected: (dx: number, dy: number) => void
  setPosition: (id: string, x: number, y: number) => void
  removeSelected: () => void
  clear: () => void
}

function generateId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

export const useLadderStore = create<LadderState>((set) => ({
  elements: [],
  selectedId: null,
  gridSize: 24,

  addElement: (type) =>
    set((state) => {
      const lastY = state.elements.length > 0 ? Math.max(...state.elements.map((e) => e.y)) : -1
      const newEl: LadderElement = {
        id: generateId(type.toLowerCase()),
        type,
        x: 1,
        y: lastY + 2,
        address: undefined,
        func: undefined,
        params: {},
      }
      return { elements: [...state.elements, newEl], selectedId: newEl.id }
    }),

  selectElement: (id) => set({ selectedId: id }),

  updateSelected: (partial) =>
    set((state) => {
      if (!state.selectedId) return state
      return {
        elements: state.elements.map((e) => (e.id === state.selectedId ? { ...e, ...partial } : e)),
      }
    }),

  moveSelected: (dx, dy) =>
    set((state) => {
      if (!state.selectedId) return state
      return {
        elements: state.elements.map((e) =>
          e.id === state.selectedId ? { ...e, x: Math.max(0, e.x + dx), y: Math.max(0, e.y + dy) } : e,
        ),
      }
    }),

  setPosition: (id, x, y) =>
    set((state) => ({
      elements: state.elements.map((e) => (e.id === id ? { ...e, x: Math.max(0, x), y: Math.max(0, y) } : e)),
    })),

  removeSelected: () =>
    set((state) => ({ elements: state.elements.filter((e) => e.id !== state.selectedId), selectedId: null })),

  clear: () => set({ elements: [], selectedId: null }),
}))
