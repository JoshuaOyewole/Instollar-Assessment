'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';




function RegisterForm() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'talent' as 'talent' | 'admin',
        location: '',
        skills: [] as string[]
    });
    const [skillsInput, setSkillsInput] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const { register, user, loading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Don't redirect while still loading user data
        if (loading) return;

        // If user is already logged in, redirect them based on role
        if (user) {
            if (user.role === 'admin') {
                router.push('/admin/dashboard');
            } else {
                // For talents, use redirect parameter if it's not an auth route, otherwise go to jobs
                const redirect = searchParams.get('redirect');
                if (redirect && !redirect.includes('/auth/')) {
                    router.push(redirect);
                } else {
                    router.push('/jobs');
                }
            }
            return;
        }
    }, [user, loading, router, searchParams]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        // Reset skills when role changes away from talent
        if (name === 'role' && value !== 'talent') {
            setSkillsInput('');
            setFormData({
                ...formData,
                role: value as 'talent' | 'admin',
                skills: []
            });
        } else if (name === 'role') {
            setFormData({
                ...formData,
                role: value as 'talent' | 'admin'
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
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

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            setIsLoading(false);
            return;
        }

        // Validate required fields for talents
        if (formData.role === 'talent') {
            if (!formData.location.trim()) {
                setError('Location is required for talents');
                setIsLoading(false);
                return;
            }
            if (formData.skills.length === 0) {
                setError('At least one skill is required for talents');
                setIsLoading(false);
                return;
            }
        }

        try {
            const registrationData: any = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role
            };

            // Only add location and skills for talents
            if (formData.role === 'talent') {
                registrationData.location = formData.location;
                registrationData.skills = formData.skills;
            }

            await register(registrationData);
            // Get the redirect parameter or default to home page
            const redirect = searchParams.get('redirect') || '/';
            router.push(redirect);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Show loading while checking authentication status
    if (loading) {
        return (
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-center mb-6 dark:text-gray-800">Create Account</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0e3e33] dark:text-gray-800"
                        placeholder="Enter your full name"
                    />
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0e3e33] dark:text-gray-800"
                        placeholder="Enter your email"
                    />
                </div>

                <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                        Role <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0e3e33] dark:text-gray-800"
                    >
                        <option value="talent" className=' text-sm'>Talent (e.g Installer)</option>
                        <option value="admin" className=' text-sm'>Admin</option>
                    </select>
                </div>

                {formData.role === 'talent' && (
                    <>
                        <div>
                            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                                Location <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="location"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                required={formData.role === 'talent'}
                                className="w-full px-3 py-2 border border-gray-300 placeholder:text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-[#0e3e33] dark:text-gray-800"
                                placeholder="Enter your location (e.g., New York, NY)"
                            />
                        </div>

                        <div>
                            <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">
                                Skills <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="skills"
                                name="skills"
                                value={skillsInput}
                                onChange={handleSkillsChange}
                                required={formData.role === 'talent'}
                                className="w-full px-3 py-2 border border-gray-300 placeholder:text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-[#0e3e33] dark:text-gray-800"
                                placeholder="Enter your skills separated by commas (e.g., Electrical Work, Plumbing, HVAC)"
                            />
                            <p className="text-xs text-gray-500 mt-1">Separate multiple skills with commas</p>
                        </div>
                    </>
                )}

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0e3e33] pr-10 dark:text-gray-800"
                            placeholder="Enter your password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0e3e33] dark:text-gray-800"
                        placeholder="Confirm your password"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#0b2b29] text-white py-2 px-4 rounded-md hover:bg-[#0e3e33] focus:outline-none focus:ring-2 focus:ring-[#0e3e33] disabled:opacity-50"
                >
                    {isLoading ? 'Creating account...' : 'Create Account'}
                </button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link href="/auth/login" className="text-[#0e3e33] hover:text-[#0b2b29] font-medium">
                        Sign in here
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default RegisterForm;