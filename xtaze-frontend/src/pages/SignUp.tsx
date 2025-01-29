import React, { useState } from 'react';
import { toast } from 'sonner'

import axios from 'axios';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/api/register', formData);
      toast('User registered Successfully', { position: 'top-center' })
      console.log(response.data);
    } catch (error: any) {
      toast('Error registering user: '+ (error.response?.data?.message || error.message), { position: 'top-right' })
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-black opacity-95 text-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 p-8 rounded-lg shadow-lg w-full max-w-md space-y-6"
      >
        <h2 className="text-3xl font-extrabold text-center">Sign Up</h2>
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className="w-full px-4 py-2 bg-[#1C2026] border border-gray-600 rounded-lg text-gray-100 ring-1  focus:outline-none"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="w-full px-4 py-2 bg-[#1C2026] border border-gray-600 rounded-lg text-gray-100 ring-1  focus:outline-none"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password

          </label>
          <input
            type="password"
            id="password"
            name="password"
            className="w-full px-4 py-2 bg-[#1C2026] border border-gray-600 rounded-lg text-gray-100 ring-1  focus:outline-none"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500 focus:ring-2 focus:ring-blue-400 focus:outline-none"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default Signup;
