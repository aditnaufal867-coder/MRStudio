import { useLadderStore } from '../store/ladderStore'

const elements = [
  { type: 'NO', label: 'NO Contact', icon: 'fa-toggle-on' },
  { type: 'NC', label: 'NC Contact', icon: 'fa-toggle-off' },
  { type: 'COIL', label: 'Coil', icon: 'fa-circle-o' },
  { type: 'TIMER', label: 'Timer', icon: 'fa-clock-o' },
  { type: 'COUNTER', label: 'Counter', icon: 'fa-calculator' },
  { type: 'HLINE', label: 'Horizontal', icon: 'fa-arrows-h' },
  { type: 'VLINE', label: 'Vertical', icon: 'fa-arrows-v' },
]

export function SidebarPalette() {
  const addElement = useLadderStore((s) => s.addElement)

  return (
    <div className="sidebar-form" style={{ padding: 10 }}>
      <h4 style={{ margin: '10px 0' }}>Palette</h4>
      {elements.map((el) => (
        <div key={el.type} className="palette-item" onClick={() => addElement(el.type as any)}>
          <span><i className={`fa ${el.icon}`} /> {el.label}</span>
          <i className="fa fa-plus" />
        </div>
      ))}
    </div>
  )
}
