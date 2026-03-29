import { useState } from "react";
import { auth, provider } from "../firebase";
import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from "firebase/auth";

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // 🔐 Google Login
  const handleGoogleLogin = async () => {
    setError("");
    try {
      const result = await signInWithPopup(auth, provider);
      onLogin(result.user.displayName || result.user.email);
    } catch (err) {
      setError(err.message);
    }
  };

  // 🆕 Signup
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      setMessage("Account created successfully!");
      onLogin(result.user.email);
    } catch (err) {
      setError(err.message);
    }
  };

  // 🔓 Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      onLogin(result.user.email);
    } catch (err) {
      setError(err.message);
    }
  };

  // 🔁 Reset Password
  const handleReset = async () => {
    setError("");
    setMessage("");

    if (!email) {
      setError("Please enter your email first");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent!");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96 space-y-5 border">

        {/* 🏥 Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-indigo-600">
            🏥 Arundhati Health System
          </h1>
          <p className="text-gray-500 text-sm">
            Student Health Portal Login
          </p>
        </div>

        {/* 🔴 Error Message */}
        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded text-sm">
            {error}
          </div>
        )}

        {/* 🟢 Success Message */}
        {message && (
          <div className="bg-green-100 text-green-700 p-2 rounded text-sm">
            {message}
          </div>
        )}

        {/* 🔐 Google Login */}
        <button
          onClick={handleGoogleLogin}
          className="w-full border border-gray-300 py-2 rounded-lg hover:bg-gray-100 transition font-medium"
        >
          Continue with Google
        </button>

        <div className="text-center text-gray-400 text-sm">OR</div>

        {/* 📧 Email */}
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />

        {/* 🔑 Password */}
        <input
          type="password"
          placeholder="Enter your password (min 6 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />

        {/* 🔓 Login */}
        <button
          onClick={handleLogin}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition font-medium"
        >
          Login
        </button>

        {/* 🆕 Signup */}
        <button
          onClick={handleSignup}
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-medium"
        >
          Create Account
        </button>

        {/* 🔁 Forgot Password */}
        <div className="text-center">
          <button
            onClick={handleReset}
            className="text-sm text-indigo-600 hover:underline"
          >
            Forgot Password?
          </button>
        </div>

      </div>
    </div>
  );
}