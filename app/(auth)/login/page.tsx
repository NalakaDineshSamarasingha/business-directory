"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { showSuccess, showError } from "@/lib/utils/toast";
import { signInWithEmail } from "@/services/auth.service";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setErrors({});
    const newErrors: Record<string, string> = {};
    
    // Validate required fields
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!password) {
      newErrors.password = "Password is required";
    }
    
    // Check if there are any errors
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsLoading(true);

    try {
      // Sign in directly on the client side so Firebase Auth state changes
      const userCredential = await signInWithEmail(email, password);
      
      showSuccess('Login successful!');
      
      // Fetch user data to determine redirect
      const response = await fetch(`/api/auth/user/${userCredential.user.uid}`);
      
      if (!response.ok) {
        console.error('Failed to fetch user data');
        router.push('/');
        return;
      }
      
      const userData = await response.json();
      
      console.log('User data:', userData);
      
      // Redirect based on user type
      if (userData.userType === 'business') {
        router.push('/business-dashboard');
      } else {
        router.push('/');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle Firebase Auth errors
      if (error.message) {
        if (error.message.includes('invalid-credential') || 
            error.message.includes('user-not-found') || 
            error.message.includes('wrong-password')) {
          showError('Invalid email or password');
        } else if (error.message.includes('user-disabled')) {
          showError('This account has been disabled');
        } else if (error.message.includes('too-many-requests')) {
          showError('Too many login attempts. Please try again later');
        } else {
          showError('Login failed. Please try again');
        }
      } else {
        showError('An error occurred during login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 pt-30 pb-12 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-block mb-6">
            <span className="text-4xl text-black tracking-tight" style={{ fontFamily: 'Lobster, cursive' }}>
              BizDiary
            </span>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: "" });
                }}
                onBlur={() => {
                  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    setErrors({ ...errors, email: "Please enter a valid email address" });
                  }
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all text-gray-900 ${
                  errors.email ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-[#151D26]"
                }`}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: "" });
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all text-gray-900 ${
                  errors.password ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-[#151D26]"
                }`}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[#151D26] focus:ring-[#151D26] border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <Link href="/forgot-password" className="text-sm text-[#151D26] hover:text-[#2B3D4F] font-medium">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#151D26] text-white py-3 rounded-lg hover:bg-[#2B3D4F] transition-colors font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              
            </div>
           
          </div>
        </div>

        {/* Sign Up Link */}
        <p className="text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link href="/register" className="text-[#151D26] hover:text-[#2B3D4F] font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
