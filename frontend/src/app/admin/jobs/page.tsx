'use client';

import { useState, useEffect } from 'react';
import { jobsAPI } from '@/lib/api';
import { Plus, Trash2, MapPin } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { toast } from 'react-toastify'

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  requiredSkills: string[];
  createdAt: string;
}

function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Middleware handles authentication, just fetch jobs
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await jobsAPI.getAll();
      setJobs(response.data.data);
    } catch (err: any) {
      setError('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };


  const handleDelete = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;

    try {
      const res = await jobsAPI.delete(jobId);
      if (res.data.status) {
        toast.success(res.data.message || 'Job deleted successfully');
        fetchJobs();
      }

    } catch (err: any) {
      setError('Failed to delete job');
      toast.error(err.message || 'Failed to delete job');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center my-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Jobs</h1>
          <p className="text-gray-600">Create and manage job postings</p>
        </div>
        <Link href={"/admin/jobs/create"}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Create Job
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Jobs List */}
      <div className="grid gap-6">
        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-lg p-8">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs created yet</h3>
              <p className="text-gray-600">Create your first job posting to get started!</p>
            </div>
          </div>
        ) : (
          jobs.map((job) => (
            <div key={job.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-1">

                <h3 className="text-xl font-semibold text-gray-900 mb-1">{job.title}</h3>
                <button
                  onClick={() => handleDelete(job.id)}
                  className="text-red-600 hover:text-red-800 p-2"
                >
                  <Trash2 size={18} />
                </button>

              </div>

              <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <MapPin size={14} className="mr-1" />
                  <span className='font-semibold'>{job.location}</span>
                </div>
              </div>

              <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Created on {new Date(job.createdAt).toLocaleDateString()}
                </div>
                <Link href={`/admin/jobs/${job.id}`} className="text-blue-600 font-medium border rounded-md px-2 py-1 hover:text-blue-800">
                  View Details
                </Link>
              </div>

            </div>
          ))
        )}
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
