import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Dashboard from './pages/Dashboard'
import DailyLearn from './pages/DailyLearn'

function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path='/auth/signin' element={< Signin />} />/ */}
        <Route path='/dashboard' element={< Dashboard />} />
        <Route path='/daily-learn' element={< DailyLearn />} />
      </Routes>
    
    </BrowserRouter>
  )
}

export default App
