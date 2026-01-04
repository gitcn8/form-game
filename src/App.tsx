import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/Home'
import LoginPage from './pages/Login'
import GamePage from './pages/Game'
import TestAuthPage from './pages/TestAuth'
import SetupGuidePage from './pages/SetupGuide'
import Test3DPage from './pages/Test3D'
import Test3DGamePage from './pages/Test3DGame'
import TestMinimalPage from './pages/TestMinimal'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/test" element={<TestAuthPage />} />
        <Route path="/test3d" element={<Test3DPage />} />
        <Route path="/farm3d" element={<Test3DGamePage />} />
        <Route path="/testminimal" element={<TestMinimalPage />} />
        <Route path="/setup" element={<SetupGuidePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
