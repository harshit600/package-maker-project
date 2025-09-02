import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  signInStart,
  signInSuccess,
  signInFailure,
} from "../redux/user/userSlice";
import OAuth from "../components/OAuth";
import config from "../../config";

export default function SignIn() {
  const [formData, setFormData] = useState({});
  const { loading, error } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(signInStart());
      const res = await fetch(`${config.API_HOST}/api/auth/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(signInFailure(data.message));
        return;
      }
      localStorage.setItem("user", JSON.stringify(data));
      dispatch(signInSuccess(data));
      navigate("/");
    } catch (error) {
      dispatch(signInFailure(error.message));
    }
  };

  console.log(error);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg">
        {/* Logo Section */}
        <div className="flex items-center gap-2 mb-8">
          <svg
            className="w-8 h-8 text-indigo-600"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <span className="text-2xl font-bold text-gray-800">FOCUS</span>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back!</h1>
        <p className="text-gray-500 mb-8">Sign in to your account</p>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            <label htmlFor="phone" className="text-sm text-gray-600">
              Phone Number
            </label>
            <input
              type="text"
              placeholder="Enter your phone number"
              className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              id="phone"
              value={formData.phone || ""}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm text-gray-600">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              id="password"
              value={formData.password || ""}
              onChange={handleChange}
            />
          </div>

          <button
            disabled={loading}
            className="bg-indigo-600 text-white p-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-70 mt-4"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          {error && <p className="text-red-500 text-center">{error}</p>}

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <OAuth />
        </form>

        <div className="flex justify-center gap-2 mt-6 text-sm">
          <p className="text-gray-600">Don't have an account?</p>
          <Link to="/signup">
            <span className="text-indigo-600 font-semibold hover:text-indigo-800">
              Sign up
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
