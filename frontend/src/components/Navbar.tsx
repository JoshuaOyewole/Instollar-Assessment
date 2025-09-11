'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import {
  LogOut,
  User,
  Briefcase,
  Users,
  Menu,
  X,
  ChevronDown,
  Zap
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/20 shadow-sm w-full">
      <div className='h-16 flex w-full justify-center relative z-50'>
        <div className="flex justify-between items-center w-[95%] lg:w-[90%] mx-auto relative z-50">
          {/* Logo */}

          <Link
            href={user && user?.role === 'admin' ? "/admin/dashboard" : user?.role === 'talent' ? "/jobs" : "/"}
            className="flex items-center group gap-x-2 justify-center relative z-50"
          >
            <div className="w-8 h-8 bg-[#0b2b29] rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-[#0e3e33] to-[#0b2b29] bg-clip-text text-transparent">
              InstollConnect
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 relative z-50">

            {user ? (
              <>


                {user.role === 'talent' && (
                  <>
                    <Link
                      href="/jobs"
                      className="flex items-center space-x-2 text-gray-700 hover:text-teal-600 hover:bg-teal-50 px-4 py-2 rounded-xl transition-all duration-200 font-medium"
                    >
                      Browse Jobs
                    </Link>

                    <Link
                      href="/my-matches"
                      className="flex items-center space-x-2 text-gray-700 hover:text-teal-600 hover:bg-teal-50 px-4 py-2 rounded-xl transition-all duration-200 font-medium"
                    >
                      <Users size={18} />
                      <span>My Matches</span>
                    </Link>
                  </>
                )}

                {user.role === 'admin' && (
                  <>
                    <Link
                      href="/admin/jobs"
                      className="flex items-center space-x-2 text-gray-700 hover:text-teal-600 hover:bg-teal-50 px-4 py-2 rounded-xl transition-all duration-200 font-medium"
                    >
                      <Briefcase size={18} />
                      <span>Manage Jobs</span>
                    </Link>
                    <Link
                      href="/admin/applications"
                      className="flex items-center space-x-2 text-gray-700 hover:text-teal-600 hover:bg-teal-50 px-4 py-2 rounded-xl transition-all duration-200 font-medium"
                    >
                      <Users size={18} />
                      <span>Applications</span>
                    </Link>
                  </>
                )}

                {/* User Dropdown */}
                <div className="relative ml-4 z-50">
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center space-x-3 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-xl transition-all duration-200"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-xs text-gray-500 capitalize">{user.role}</div>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`text-gray-400 transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''
                        }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-[60]">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email || `${user.role}@jobmatch.com`}</div>
                      </div>

                      {user.role === 'talent' && (
                        <Link
                          href="/profile/edit"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <User size={16} />
                          <span>Edit Profile</span>
                        </Link>
                      )}

                      <div className="border-t border-gray-100 pt-1">
                        <button
                          onClick={() => {
                            logout();
                            setIsUserDropdownOpen(false);
                          }}
                          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut size={16} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-x-4">
                <Link
                  href="/jobs"
                  className="text-gray-700 hover:text-[#0b2b29] !px-4 !py-2 rounded-xl hover:bg-blue-50 transition-all duration-200 font-medium"
                >
                  Browse Jobs
                </Link>
                <Link
                  href="/auth/login"
                  className="text-gray-700 hover:text-[#0b2b29] !px-4 !py-2 rounded-xl hover:bg-blue-50 transition-all duration-200 font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-[#0e3e33] text-white !px-6 !py-2 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-semibold"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors relative z-50"
          >
            {isMobileMenuOpen ? (
              <X size={24} className="text-gray-600" />
            ) : (
              <Menu size={24} className="text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200/20 py-4 absolute top-16 left-0 right-0 z-40">
          {user ? (
            <div className="!space-y-2">
              {/* User Info */}
              <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50 rounded-xl mx-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  <div className="text-xs text-gray-500 capitalize">{user.role}</div>
                </div>
              </div>

              {/* Navigation Links */}
              <Link
                href="/jobs"
                className="flex items-center space-x-2 text-gray-700 hover:text-teal-600 hover:bg-teal-50 px-4 py-2 rounded-xl transition-all duration-200 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Briefcase size={20} />
                <span>Jobs</span>
              </Link>

              {user.role === 'talent' && (
                <>
                  <Link
                    href="/my-matches"
                    className="flex items-center space-x-2 text-gray-700 hover:text-teal-600 hover:bg-teal-50 px-4 py-2 rounded-xl transition-all duration-200 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Users size={20} />
                    <span>My Matches</span>
                  </Link>
                  <Link
                    href="/profile/edit"
                    className="flex items-center space-x-2 text-gray-700 hover:text-teal-600 hover:bg-teal-50 px-4 py-2 rounded-xl transition-all duration-200 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User size={20} />
                    <span>Edit Profile</span>
                  </Link>
                </>
              )}

              {user.role === 'admin' && (
                <>
                  <Link
                    href="/admin/jobs"
                    className="flex items-center space-x-2 text-gray-700 hover:text-teal-600 hover:bg-teal-50 px-4 py-2 rounded-xl transition-all duration-200 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Briefcase size={20} />
                    <span>Manage Jobs</span>
                  </Link>
                  <Link
                    href="/admin/applications"
                    className="flex items-center space-x-2 text-gray-700 hover:text-teal-600 hover:bg-teal-50 px-4 py-2 rounded-xl transition-all duration-200 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Users size={20} />
                    <span>Applications</span>
                  </Link>
                </>
              )}



              {/* Logout */}
              <div className="border-t border-gray-200 pt-2">
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl mx-2 transition-all"
                >
                  <LogOut size={20} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="!space-y-2">
              <Link
                href="/jobs"
                className="block !px-4 !py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl mx-2 transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Browse Jobs
              </Link>
              <Link
                href="/auth/login"
                className="block !px-4 !py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl mx-2 transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="block bg-gradient text-white !px-4 !py-3 rounded-xl !mx-2 text-center font-semibold"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Click outside to close dropdown */}
      {isUserDropdownOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setIsUserDropdownOpen(false)}
        />
      )}

      {/* Click outside to close mobile menu */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;
