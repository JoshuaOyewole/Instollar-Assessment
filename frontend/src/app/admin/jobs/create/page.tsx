'use client';

import { useState, useEffect } from 'react';
import { jobsAPI } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { toast } from 'react-toastify';

interface Job {
    id: string;
    title: string;
    description: string;
    location: string;
    requiredSkills: string[];
    createdAt: string;
}

function AdminJobsPage() {
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        requiredSkills: ''
    });
    const [submitting, setSubmitting] = useState(false);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const jobData = {
                ...formData,
                requiredSkills: formData.requiredSkills.split(',').map(req => req.trim()).filter(req => req)
            };

            const res = await jobsAPI.create(jobData);
            if (!res.data.status) return toast.error(res.data.message || 'Failed to create job');

            toast.success(res.data.message || 'Job created successfully');
            // Clear form
            setFormData({
                title: '',
                description: '',
                location: '',
                requiredSkills: ''
            });
            setError('');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create job');
        } finally {
            setSubmitting(false);
        }
    };  

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center my-8 px-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Jobs</h1>
                    <p className="text-gray-600">Create and manage job postings</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {/* Create Job Form */}

            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Create New Job</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Skills (comma-separated)
                        </label>
                        <input
                            type="text"
                            required
                            name="requiredSkills"
                            value={formData.requiredSkills}
                            onChange={handleChange}
                            placeholder="React, Node.js, 3+ years experience"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {submitting ? 'Creating...' : 'Create Job'}
                        </button>
                        <Link href={"/admin/jobs"}
                            type="button"
                            className="border border-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            Back
                        </Link>
                    </div>
                </form>
            </div>

        </div>
    );
}

// Wrap the component with ProtectedRoute for extra security
function AdminJobsPageWithProtection() {
    return (
        <ProtectedRoute requiredRole="admin">
            <AdminJobsPage />
        </ProtectedRoute>
    );
}

export default AdminJobsPageWithProtection;
