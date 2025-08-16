import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import AddExpense from './AddExpense';
import Reports from './Reports';
import Goals from './Goals';

function App(){
  return(
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-expense" element={<AddExpense />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/goals" element={<Goals />} />
      </Routes>
    </Router>
  );
}

export default App;
