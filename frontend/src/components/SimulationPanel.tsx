import { useEffect, useMemo, useState } from 'react'
import { usePlcSimStore } from '../store/plcSimStore'

export function SimulationPanel() {
  const { inputs, bits, timers, counters, toggleInput, step, running, setRunning } = usePlcSimStore()
  const [newInput, setNewInput] = useState('I0.0')
  const inputAddrs = useMemo(() => Object.keys(inputs).sort(), [inputs])
  const outputAddrs = useMemo(() => Object.keys(bits).filter(k => k.startsWith('Q')).sort(), [bits])
  const memAddrs = useMemo(() => Object.keys(bits).filter(k => k.startsWith('M')).sort(), [bits])

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => step(50), 50)
    return () => clearInterval(id)
  }, [running, step])

  return (
    <div className="box">
      <div className="box-header with-border">
        <h3 className="box-title">Simulation</h3>
        <div className="box-tools pull-right">
          <div className="btn-group">
            <button className={"btn btn-default btn-sm"} onClick={() => step(10)}>Step 10ms</button>
            <button className={"btn btn-primary btn-sm"} onClick={() => setRunning(!running)}>{running ? 'Stop' : 'Run'}</button>
          </div>
        </div>
      </div>
      <div className="box-body row">
        <div className="col-sm-4">
          <h4>Inputs</h4>
          <div className="input-group" style={{ marginBottom: 8 }}>
            <input className="form-control" value={newInput} onChange={(e) => setNewInput(e.target.value)} placeholder="I0.0" />
            <span className="input-group-btn"><button className="btn btn-default" onClick={() => { if (newInput.trim()) { usePlcSimStore.setState((s) => ({ inputs: { ...s.inputs, [newInput.trim()]: s.inputs[newInput.trim()] ?? false } })) } }}>Add</button></span>
          </div>
          {inputAddrs.map((addr) => (
            <div key={addr} className="checkbox">
              <label>
                <input type="checkbox" checked={!!inputs[addr]} onChange={() => toggleInput(addr)} /> {addr}
              </label>
            </div>
          ))}
        </div>
        <div className="col-sm-4">
          <h4>Outputs (Q)</h4>
          {outputAddrs.length === 0 && <em>No outputs yet</em>}
          {outputAddrs.map((addr) => (
            <div key={addr}><span className={`label ${bits[addr] ? 'label-success' : 'label-default'}`}>{addr}: {String(bits[addr])}</span></div>
          ))}
          <h4 style={{ marginTop: 12 }}>Memory (M)</h4>
          {memAddrs.map((addr) => (
            <div key={addr}><span className={`label ${bits[addr] ? 'label-info' : 'label-default'}`}>{addr}: {String(bits[addr])}</span></div>
          ))}
        </div>
        <div className="col-sm-4">
          <h4>Timers (T)</h4>
          {Object.entries(timers).map(([addr, t]) => (
            <div key={addr}><span className={`label ${t.q ? 'label-warning' : 'label-default'}`}>{addr}: Q={String(t.q)} acc={Math.round(t.accMs)}ms</span></div>
          ))}
          <h4 style={{ marginTop: 12 }}>Counters (C)</h4>
          {Object.entries(counters).map(([addr, c]) => (
            <div key={addr}><span className={`label ${c.q ? 'label-danger' : 'label-default'}`}>{addr}: Q={String(c.q)} CV={c.cv}</span></div>
          ))}
        </div>
      </div>
    </div>
  )
}
