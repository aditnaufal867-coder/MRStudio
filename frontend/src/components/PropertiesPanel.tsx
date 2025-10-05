import { useMemo } from 'react'
import { useLadderStore } from '../store/ladderStore'

export function PropertiesPanel() {
  const { elements, selectedId, updateSelected, removeSelected, moveSelected } = useLadderStore()

  const selected = useMemo(() => elements.find((e) => e.id === selectedId) || null, [elements, selectedId])

  if (!selected) {
    return (
      <div className="box properties-panel">
        <div className="box-header with-border">
          <h3 className="box-title">Properties</h3>
        </div>
        <div className="box-body">
          <em>No element selected</em>
        </div>
      </div>
    )
  }

  function updateField(key: 'address' | 'func', value: string) {
    updateSelected({ [key]: value } as any)
  }

  function updateParam(key: string, value: string | number) {
    updateSelected({ params: { ...(selected!.params || {}), [key]: value } })
  }

  return (
    <div className="box properties-panel">
      <div className="box-header with-border">
        <h3 className="box-title">Properties</h3>
        <div className="box-tools pull-right">
          <button className="btn btn-danger btn-xs" onClick={removeSelected}><i className="fa fa-trash" /> Delete</button>
        </div>
      </div>
      <div className="box-body">
        <div>
          <label>Type</label>
          <input className="form-control" disabled value={selected.type} />
        </div>
        <div>
          <label>Address</label>
          <input className="form-control" value={selected.address || ''} onChange={(e) => updateField('address', e.target.value)} placeholder="e.g. I0.0 / Q0.0 / M0.0" />
        </div>
        <div>
          <label>Function</label>
          <input className="form-control" value={selected.func || ''} onChange={(e) => updateField('func', e.target.value)} placeholder="optional function name" />
        </div>

        {selected.type === 'TIMER' && (
          <div>
            <label>Preset (ms)</label>
            <input type="number" className="form-control" value={(selected.params?.presetMs as number) || 1000}
              onChange={(e) => updateParam('presetMs', Number(e.target.value))} />
          </div>
        )}

        {selected.type === 'COUNTER' && (
          <div>
            <label>Preset (count)</label>
            <input type="number" className="form-control" value={(selected.params?.preset as number) || 10}
              onChange={(e) => updateParam('preset', Number(e.target.value))} />
          </div>
        )}

        <div style={{ marginTop: 12 }}>
          <div className="btn-group">
            <button className="btn btn-default" title="Left" onClick={() => moveSelected(-1, 0)}><i className="fa fa-arrow-left" /></button>
            <button className="btn btn-default" title="Right" onClick={() => moveSelected(1, 0)}><i className="fa fa-arrow-right" /></button>
            <button className="btn btn-default" title="Up" onClick={() => moveSelected(0, -1)}><i className="fa fa-arrow-up" /></button>
            <button className="btn btn-default" title="Down" onClick={() => moveSelected(0, 1)}><i className="fa fa-arrow-down" /></button>
          </div>
        </div>
      </div>
    </div>
  )
}
