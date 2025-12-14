"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function BusinessRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    businessName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [emailStatus, setEmailStatus] = useState<{
    checking: boolean;
    exists: boolean;
    message: string;
  }>({ checking: false, exists: false, message: "" });

  // Check email availability
  useEffect(() => {
    const checkEmail = async () => {
      if (!formData.email || formData.email.length < 3) {
        setEmailStatus({ checking: false, exists: false, message: "" });
        return;
      }

      setEmailStatus({ checking: true, exists: false, message: "" });

      try {
        const response = await fetch("/api/auth/check-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: formData.email }),
        });

        const result = await response.json();
        
        if (response.ok) {
          setEmailStatus({
            checking: false,
            exists: result.exists,
            message: result.message,
          });
        }
      } catch (error) {
        console.error("Email check error:", error);
        setEmailStatus({ checking: false, exists: false, message: "" });
      }
    };

    const timeoutId = setTimeout(checkEmail, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (emailStatus.exists) {
      toast.error("This email is already registered. Please use a different email.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match!");
      return;
    }

    const loadingToast = toast.loading("Creating your business account...");

    try {
      const response = await fetch("/api/auth/register/business", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessName: formData.businessName,
          email: formData.email,
          password: formData.password,
        }),
      });
      const result = await response.json();
      console.log("Business registration:", result);
      
      toast.dismiss(loadingToast);
      
      if (response.ok) {
        toast.success("Business registration successful!");
        setTimeout(() => {
          router.push('/business-dashboard');
        }, 1500);
        // Redirect to login or dashboard
      } else {
        toast.error(result.error || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.dismiss(loadingToast);
      toast.error("Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 pt-24 pb-12 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-block mb-6">
            <span className="text-4xl text-black tracking-tight" style={{ fontFamily: 'Lobster, cursive' }}>
              BizRate
            </span>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">Create Business Account</h2>
          <p className="mt-2 text-gray-600">Register your business on BizRate</p>
        </div>

        {/* User Type Toggle */}
        <div className="bg-gray-100 p-1 rounded-lg flex">
          <Link
            href="/register"
            className="flex-1 py-3 text-center rounded-md font-medium text-gray-600 hover:text-black"
          >
            Regular User
          </Link>
          <Link
            href="/business-register"
            className="flex-1 py-3 text-center rounded-md font-medium bg-white text-black shadow-sm"
          >
            Business Owner
          </Link>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Business Name */}
            <div>
              <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                Business Name
              </label>
              <input
                id="businessName"
                type="text"
                required
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#151D26] focus:border-transparent"
                placeholder="Your Business Name"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="businessEmail" className="block text-sm font-medium text-gray-700 mb-2">
                Business Email
              </label>
              <div className="relative">
                <input
                  id="businessEmail"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                    emailStatus.exists 
                      ? "border-red-500 focus:ring-red-500" 
                      : emailStatus.message && !emailStatus.exists
                      ? "border-green-500 focus:ring-green-500"
                      : "border-gray-300 focus:ring-[#151D26]"
                  }`}
                  placeholder="business@example.com"
                />
                {emailStatus.checking && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin h-5 w-5 border-2 border-gray-300 border-t-[#151D26] rounded-full"></div>
                  </div>
                )}
                {!emailStatus.checking && emailStatus.exists && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                {!emailStatus.checking && emailStatus.message && !emailStatus.exists && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              {emailStatus.message && (
                <p className={`mt-1 text-sm ${emailStatus.exists ? "text-red-600" : "text-green-600"}`}>
                  {emailStatus.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="businessPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="businessPassword"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#151D26] focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="businessConfirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                id="businessConfirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#151D26] focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#151D26] text-white py-3 rounded-lg hover:bg-[#2B3D4F] transition-colors font-medium text-lg"
            >
              Create Business Account
            </button>
          </form>
        </div>

        {/* Sign In Link */}
        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="text-[#151D26] hover:text-[#2B3D4F] font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
