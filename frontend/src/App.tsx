import './App.css'
import { SidebarPalette } from './components/SidebarPalette'
import { CanvasPanel } from './components/CanvasPanel'
import { PropertiesPanel } from './components/PropertiesPanel'
import { SimulationPanel } from './components/SimulationPanel'

function App() {
  return (
    <div className="wrapper">
      <header className="main-header">
        <a href="#" className="logo">
          <span className="logo-mini"><b>LD</b></span>
          <span className="logo-lg"><b>PLC</b> Ladder</span>
        </a>
        <nav className="navbar navbar-static-top" role="navigation">
          <a href="#" className="sidebar-toggle" data-toggle="push-menu" role="button">
            <span className="sr-only">Toggle navigation</span>
          </a>
          <div className="navbar-custom-menu">
            <ul className="nav navbar-nav">
              <li>
                <a href="#"><i className="fa fa-upload" /> Upload</a>
              </li>
              <li>
                <a href="#"><i className="fa fa-code" /> Generate</a>
              </li>
            </ul>
          </div>
        </nav>
      </header>

      <aside className="main-sidebar">
        <section className="sidebar">
          <SidebarPalette />
        </section>
      </aside>

      <div className="content-wrapper">
        <section className="content-header">
          <h1>Ladder Designer</h1>
        </section>
        <section className="content">
          <div className="row">
            <div className="col-md-8">
              <CanvasPanel />
              <SimulationPanel />
            </div>
            <div className="col-md-4">
              <PropertiesPanel />
            </div>
          </div>
        </section>
      </div>

      <footer className="main-footer" style={{ textAlign: 'center' }}>
        <strong>PLC Ladder Designer</strong>
      </footer>
    </div>
  )
}

export default App
