 
import './App.css'
import Dashboard from './pages/Dashboard'
import DailyLearn from './pages/DailyLearn'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Signup from './components/Signup'
import Signin from './components/Signin';
import Accounts from './components/Accounts';
import OCRReceiptScanner from './components/OCRReceiptScanner';
import ChatBot from './components/ChatBot';

const App = () => {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/dashboard' element={< Dashboard />} />
        <Route path='/daily-learn' element={< DailyLearn />} />
        <Route path="/signup" element={<Signup />} />
       <Route path="/signin" element={<Signin />} />
        <Route path="*" element={<Navigate to="/signin" replace />} />
        <Route path='/accounts' element={<Accounts/>}/>
      </Routes>
    
    </BrowserRouter>
  )
}

export default App
