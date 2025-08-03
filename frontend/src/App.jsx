import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Signup from './components/Signup'
import Signin from './components/Signin';

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/signup" element={<Signup />} />
      <Route path="/signin" element={<Signin />} />
      <Route path="*" element={<Navigate to="/signin" replace />} />
    </Routes>
  </BrowserRouter>
);

export default App;
