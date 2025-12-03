import { Downloader } from './components/Downloader'
import './App.css'

function App() {
  return (
    <div className="village-container">
      <div className="hills"></div>
      
      <div className="village-sign">
        <h1>Ye Olde Tunesmith</h1>
        <p>Est. 2024</p>
      </div>

      <Downloader />
      
    </div>
  )
}

export default App
