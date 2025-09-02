import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import OAuth from '../components/OAuth';
import config from '../../config';

export default function SignUp() {

  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(
      {
        ...formData,
        [e.target.id] : e.target.value,
      }
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Add form validation
    if (!formData.username || !formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Password validation
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch(`${config.API_HOST}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', 
        },
        body: JSON.stringify(formData),
      });

      // Check if the response is ok
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Something went wrong!');
      }

      const data = await res.json();
      setLoading(false);
      navigate('/signin');
    } catch (error) {
      setLoading(false); 
      setError(error.message);
    }
  }

  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl text-center font-semibold my-7'>
        Sign Up
      </h1>
      <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
        <input type="text" placeholder='username' className='border p-3 rounded-lg' id="username" onChange={handleChange}/>
        <input type="email" placeholder='email' className='border p-3 rounded-lg' id="email" onChange={handleChange}/>
        <input type="password" placeholder='password' className='border p-3 rounded-lg' id="password" onChange={handleChange}/>
        <button disabled={loading} className='bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80'>{loading ? 'Loading... ' : 'SIGN UP'}</button>
        {error && <p className='text-red-500 '>{error}</p>}
        <OAuth /> 
      </form>
      <div className='flex gap-2 mt-5'>
        <p>Have an account?</p>
        <Link to="/signin">
          <span className='text-blue-700'>Sign in</span>
        </Link>
      </div>
    </div>
  )
}
