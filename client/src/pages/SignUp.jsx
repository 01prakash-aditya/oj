import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import OAuth from "../components/OAuth.jsx";
const API_URL = import.meta.env.VITE_URL || 'http://localhost:3000';

export default function SignUp() {
  const [formData, setFormData] = useState({
    role: 'user' // Default role
  });
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSecretCode, setShowSecretCode] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleRoleChange = (e) => {
    const selectedRole = e.target.value;
    setFormData({
      ...formData,
      role: selectedRole,
    });
    setShowSecretCode(selectedRole === 'admin');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate admin secret code if admin role is selected
    if (formData.role === 'admin' && !formData.secretCode) {
      setError('Secret code is required for admin registration');
      return;
    }

    try {
      setLoading(true);
      setError(false);
      
      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      await new Promise(resolve => setTimeout(resolve, 500));

      const data = await res.json();
      setLoading(false);
      
      if (data.success === false) {
        setError(data.message || 'Something went wrong!');
        return;
      }
      
      navigate("/sign-in");
    } catch (err) {
      setLoading(false);
      setError('Network error. Please try again.');
    }
  };

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl text-center font-semibold my-5">Sign Up</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        
        {/* Role Selection */}
        <label htmlFor="role" className="text-sm text-gray-500">
          Account Type :
        </label>
        <select
          id="role"
          value={formData.role}
          onChange={handleRoleChange}
          className="bg-slate-100 p-3 rounded-lg"
        >
          <option value="user">Regular User</option>
          <option value="admin">Administrator</option>
        </select>

        {/* Secret Code for Admin */}
        {showSecretCode && (
          <>
            <label htmlFor="secretCode" className="text-sm text-gray-500">
              Admin Secret Code :
            </label>
            <input
              type="password"
              placeholder="Enter admin secret code"
              id="secretCode"
              className="bg-slate-100 p-3 rounded-lg border-2 border-yellow-300"
              onChange={handleChange}
              required={formData.role === 'admin'}
            />
            <p className="text-xs text-yellow-600">
              * Admin secret code is required for administrator registration
            </p>
          </>
        )}

        <label htmlFor="username" className="text-sm text-gray-500">
          Username :
        </label>
        <input
          type="text"
          placeholder="eg. aditya07"
          id="username"
          className="bg-slate-100 p-3 rounded-lg"
          onChange={handleChange}
          required
        />

        <label htmlFor="email" className="text-sm text-gray-500">
          Email :
        </label>
        <input
          type="email"
          placeholder="eg. abc@yahoo.com"
          id="email"
          className="bg-slate-100 p-3 rounded-lg"
          onChange={handleChange}
          required
        />

        <label htmlFor="password" className="text-sm text-gray-500">
          Password :
        </label>
        <input
          type="password"
          placeholder="Create a secure password"
          id="password"
          className="bg-slate-100 p-3 rounded-lg"
          onChange={handleChange}
          required
        />

        <label htmlFor="fullName" className="text-sm text-gray-500">
          Full Name :
        </label>
        <input
          type="text"
          placeholder="eg. Aditya Prakash"
          id="fullName"
          className="bg-slate-100 p-3 rounded-lg"
          onChange={handleChange}
          required
        />

        <label htmlFor="dob" className="text-sm text-gray-500">
          Date of Birth :
        </label>
        <input
          type="date"
          placeholder="Date Of Birth"
          id="dob"
          className="bg-slate-100 p-3 rounded-lg"
          onChange={handleChange}
          required
        />

        <button 
          disabled={loading} 
          className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-75 disabled:opacity-55"
        >
          {loading ? 'Loading...' : `Sign Up as ${formData.role === 'admin' ? 'Administrator' : 'User'}`}
        </button>
        
        <OAuth />
      </form>
      
      <div className="flex gap-2 mt-5">
        <p>Have an account?</p>
        <Link to="/sign-in">
          <span className="text-blue-500">Sign in</span>
        </Link>
      </div>
      
      {error && (
        <p className='text-red-500 mt-5'>
          {typeof error === 'string' ? error : "Something went wrong!"}
        </p>
      )}
    </div>
  );
}