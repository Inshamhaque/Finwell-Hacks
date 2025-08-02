import { BrowserRouter as Router,Routes,Route } from "react-router-dom"
import Signup from "./components/Signup"

function App() {

  return (
    <Router>
      <Routes>
        <Route element={<Signup/>} path="/"/>
      </Routes>
    </Router>
  )
}

export default App
