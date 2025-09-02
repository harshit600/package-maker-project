import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import OAuth from "../components/OAuth";
import config from "../../config";

export default function SignUp() {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Add form validation
    if (!formData.username || !formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    // Password validation
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${config.API_HOST}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      // Check if the response is ok
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Something went wrong!");
      }

      const data = await res.json();
      setLoading(false);
      navigate("/signin");
    } catch (error) {
      setLoading(false);
      setError(error.message);
    }
  };

  return (
    <div className="p-3 max-w-lg mx-auto bg-white rounded-xl shadow-lg">
      <div className="flex justify-between items-center p-4">
        <div className="flex items-center">
          <img src="/focus-logo.svg" alt="Focus" className="h-8" />
          <span className="text-xl font-semibold text-blue-600 ml-2">
            FOCUS
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600">Already have an account?</span>
          <Link to="/signin">
            <button className="px-4 py-2 rounded-full border border-gray-200 hover:bg-gray-50">
              SIGN IN
            </button>
          </Link>
        </div>
      </div>

      <div className="px-8 py-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome to Focus!
        </h1>
        <p className="text-gray-500 mb-8">Register your account</p>

        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label className="text-gray-700">Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              className="border border-gray-200 p-3 rounded-lg focus:outline-none focus:border-blue-500"
              id="username"
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-gray-700">Email</label>
            <input
              type="email"
              placeholder="focus001@gmail.com"
              className="border border-gray-200 p-3 rounded-lg focus:outline-none focus:border-blue-500"
              id="email"
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-gray-700">Password</label>
            <input
              type="password"
              placeholder="8+ characters"
              className="border border-gray-200 p-3 rounded-lg focus:outline-none focus:border-blue-500"
              id="password"
              onChange={handleChange}
            />
          </div>

          <button
            disabled={loading}
            className="bg-blue-600 text-white py-3 rounded-full hover:bg-blue-700 disabled:opacity-80"
          >
            {loading ? "Loading... " : "Login"}
          </button>

          {error && <p className="text-red-500 text-center">{error}</p>}

          <div className="flex flex-col items-center gap-4">
            <p className="text-gray-500">Create account with</p>
            <div className="flex gap-4">
              <button className="p-2 rounded-full border border-gray-200 hover:bg-gray-50">
                <img
                  src="/facebook-icon.svg"
                  alt="Facebook"
                  className="w-6 h-6"
                />
              </button>
              <button className="p-2 rounded-full border border-gray-200 hover:bg-gray-50">
                <img
                  src="/linkedin-icon.svg"
                  alt="LinkedIn"
                  className="w-6 h-6"
                />
              </button>
              <button className="p-2 rounded-full border border-gray-200 hover:bg-gray-50">
                <img src="/google-icon.svg" alt="Google" className="w-6 h-6" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
