'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { User, MapPin, Wrench, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { usersAPI } from '@/lib/api';
import { toast } from 'react-toastify';

export default function EditProfilePage() {
  const { user, updateUser, loading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    location: '',
    skills: [] as string[]
  });
  const [skillsInput, setSkillsInput] = useState('');

  useEffect(() => {
    // Redirect if not authenticated or not a talent
    if (!loading && (!user || user.role !== 'talent')) {
      router.push('/auth/login');
      return;
    }

    // Populate form with current user data
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        location: user.location || '',
        skills: user.skills || []
      });
      setSkillsInput(user.skills?.join(', ') || '');
    }
  }, [user, loading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const skillsString = e.target.value;
    setSkillsInput(skillsString);
    
    // Update the skills array in formData
    const skillsArray = skillsString.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0);
    setFormData({
      ...formData,
      skills: skillsArray
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate required fields
    if (!formData.name.trim()) {
      setError('Name is required');
      setIsLoading(false);
      return;
    }

    if (!formData.email.trim()) {
      setError('Email is required');
      setIsLoading(false);
      return;
    }

    if (!formData.location.trim()) {
      setError('Location is required for talents');
      setIsLoading(false);
      return;
    }

    if (formData.skills.length === 0) {
      setError('At least one skill is required');
      setIsLoading(false);
      return;
    }

    try {
      // Call the API to update user profile
      const response = await usersAPI.updateProfile({
        name: formData.name,
        email: formData.email,
        location: formData.location,
        skills: formData.skills
      });

      // Update the user context with new data
      await updateUser();
      
      toast.success('Profile updated successfully!');
      router.push('/jobs');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
          <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-indigo-400 animate-ping"></div>
        </div>
      </div>
    );
  }

  // Don't render anything if user is not authenticated or not a talent
  if (!user || user.role !== 'talent') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/jobs"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Jobs
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Profile</h1>
          <p className="text-gray-600">Update your profile information to improve job matches</p>
        </div>

        {/* Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-center space-x-4 pb-6 border-b border-gray-200">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-xl">
                {formData.name.charAt(0).toUpperCase() || user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{formData.name || user.name}</h2>
                <p className="text-gray-600 capitalize">{user.role}</p>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e3e33] focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e3e33] focus:border-transparent"
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e3e33] focus:border-transparent"
                placeholder="Enter your location (e.g., New York, NY)"
              />
            </div>

            {/* Skills */}
            <div>
              <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-2">
                <Wrench className="w-4 h-4 inline mr-2" />
                Skills <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="skills"
                name="skills"
                value={skillsInput}
                onChange={handleSkillsChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e3e33] focus:border-transparent"
                placeholder="Enter your skills separated by commas (e.g., Electrical Work, Plumbing, HVAC)"
              />
              <p className="text-sm text-gray-500 mt-2">Separate multiple skills with commas</p>
              
              {/* Skills Preview */}
              {formData.skills.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Skills Preview:</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <Link
                href="/jobs"
                className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center px-6 py-3 bg-[#0e3e33] text-white rounded-lg hover:bg-[#0b2b29] focus:outline-none focus:ring-2 focus:ring-[#0e3e33] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
