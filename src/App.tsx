import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/Home'
import LoginPage from './pages/Login'
import GamePage from './pages/Game'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/game" element={<GamePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
