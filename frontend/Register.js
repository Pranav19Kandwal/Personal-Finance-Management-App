import './Login.css';
import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function Register(){
  const [form, setForm] = useState({ username: '', password: '' });
  const navigate = useNavigate();
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async e => {
    e.preventDefault();
    try{
      await axios.post('http://localhost:5000/api/auth/register', form);
      alert('Registration Successful !!!');
      navigate('/');
    }
    catch(err){
      alert('Registration failed: ' + err.response.data.message);
    }
  };

  return(
    <div className='login-container'>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input name="username" placeholder="Username" onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
        <button type="submit">Register</button>
      </form>
      <p>Already have an account? <Link to="/">Login</Link></p>
    </div>
  );
}

export default Register;
