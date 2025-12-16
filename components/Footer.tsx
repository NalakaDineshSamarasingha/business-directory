import Link from "next/link";
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">About BizDiary</h3>
            <p className="text-sm text-gray-400 mb-4">
              Your trusted platform for discovering and connecting with local businesses. Find services, read reviews, and grow your network.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition">
                <FaFacebook size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition">
                <FaTwitter size={20} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition">
                <FaLinkedin size={20} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-pink-500 transition">
                <FaInstagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm hover:text-white transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/find-business" className="text-sm hover:text-white transition">
                  Find Business
                </Link>
              </li>
              <li>
                <Link href="/favorites" className="text-sm hover:text-white transition">
                  My Favorites
                </Link>
              </li>
              <li>
                <Link href="/business-dashboard" className="text-sm hover:text-white transition">
                  Business Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* For Business */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">For Business</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/business-register" className="text-sm hover:text-white transition">
                  Register Business
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-sm hover:text-white transition">
                  Login
                </Link>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-white transition">
                  Pricing Plans
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-white transition">
                  Business Resources
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm hover:text-white transition">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-white transition">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-white transition">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-white transition">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} BizDiary. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-sm text-gray-400 hover:text-white transition">
                Privacy
              </a>
              <a href="#" className="text-sm text-gray-400 hover:text-white transition">
                Terms
              </a>
              <a href="#" className="text-sm text-gray-400 hover:text-white transition">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
