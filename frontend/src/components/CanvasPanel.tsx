import { useEffect, useMemo, useRef, useState } from 'react'
import { useLadderStore } from '../store/ladderStore'
import type { LadderElement } from '../store/ladderStore'

function ElementBox({ element, gridSize, onMouseDown, selected }: {
  element: LadderElement
  gridSize: number
  onMouseDown: (e: React.MouseEvent, id: string) => void
  selected: boolean
}) {
  const left = element.x * gridSize
  const top = element.y * gridSize

  return (
    <div
      onMouseDown={(e) => onMouseDown(e, element.id)}
      style={{
        position: 'absolute',
        left,
        top,
        minWidth: 80,
        padding: '6px 8px',
        border: selected ? '2px solid #3c8dbc' : '1px solid #bbb',
        background: '#fff',
        borderRadius: 4,
        cursor: 'move',
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
        userSelect: 'none',
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{element.type}</div>
      <div style={{ fontSize: 12, color: '#666' }}>{element.address || 'addr: -'}</div>
    </div>
  )
}

export function CanvasPanel() {
  const { elements, gridSize, selectElement, selectedId, setPosition } = useLadderStore()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [dragInfo, setDragInfo] = useState<{
    id: string
    startX: number
    startY: number
    originX: number
    originY: number
  } | null>(null)

  const elementsById = useMemo(() =>
    Object.fromEntries(elements.map((e) => [e.id, e] as const)), [elements])

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!dragInfo) return
      const { id, startX, startY, originX, originY } = dragInfo
      const dx = Math.round((e.clientX - startX) / gridSize)
      const dy = Math.round((e.clientY - startY) / gridSize)
      const nx = Math.max(0, originX + dx)
      const ny = Math.max(0, originY + dy)
      setPosition(id, nx, ny)
    }
    function onMouseUp() {
      if (dragInfo) setDragInfo(null)
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [dragInfo, gridSize, setPosition])

  function handleMouseDown(e: React.MouseEvent, id: string) {
    e.preventDefault()
    selectElement(id)
    const el = elementsById[id]
    setDragInfo({ id, startX: e.clientX, startY: e.clientY, originX: el.x, originY: el.y })
  }

  return (
    <div className="box">
      <div className="box-header with-border">
        <h3 className="box-title">Canvas</h3>
      </div>
      <div className="box-body">
        <div ref={containerRef} className="ladder-canvas">
          {elements.map((el) => (
            <ElementBox
              key={el.id}
              element={el}
              gridSize={gridSize}
              onMouseDown={handleMouseDown}
              selected={el.id === selectedId}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
