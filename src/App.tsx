import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Test3DGamePage from './pages/Test3DGame'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Test3DGamePage />} />
        <Route path="/farm3d" element={<Test3DGamePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
