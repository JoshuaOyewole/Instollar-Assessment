'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { jobsAPI, matchesAPI, usersAPI } from '@/lib/api';
import { Users, Briefcase, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';


interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: number;
}

interface User {
  userId: string;
  name: string;
  email: string;
  role: string;
}

export default function AdminMatchesPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [talents, setTalents] = useState<User[]>([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [selectedTalent, setSelectedTalent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { user } = useAuth();

  useEffect(() => {
    // Middleware handles authentication, just fetch data
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch jobs
      const jobsResponse = await jobsAPI.getAll();
      setJobs(jobsResponse.data.data);

      const usersResponse = await usersAPI.getAllTalents();

      setTalents(usersResponse.data.data);
    } catch (err: any) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const res = await matchesAPI.create({
        jobId: selectedJob,
        userId: selectedTalent
      });

      if (!res.data.status) return toast.error(res.data.message || 'Failed to create match');

      toast.success(res.data.message || 'Match created successfully');
      setSuccess('Match created successfully!');
      setSelectedJob('');
      setSelectedTalent('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create match');
    } finally {
      setSubmitting(false);
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
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Job Matches</h1>
        <p className="text-gray-600">
          Match talented professionals with suitable job opportunities
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex items-center">
          <CheckCircle size={20} className="mr-2" />
          {success}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleCreateMatch} className="space-y-6">
          {/* Job Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Briefcase size={16} className="inline mr-1" />
              Select Job
            </label>
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a job...</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
          </div>

          {/* Talent Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users size={16} className="inline mr-1" />
              Select Talent
            </label>
            <select
              value={selectedTalent}
              onChange={(e) => setSelectedTalent(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a talent...</option>
              {talents.map((talent) => (
                <option key={talent.userId} value={talent.userId}>
                  {talent.name} ({talent.email})
                </option>
              ))}
            </select>
          </div>

          {/* Match Preview */}
          {selectedJob && selectedTalent && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Match Preview</h3>
              <div className="text-sm text-blue-700">
                <p>
                  <strong>Job:</strong> {jobs.find(j => j.id === selectedJob)?.title}
                </p>
                <p>
                  <strong>Talent:</strong> {talents.find(t => t.userId === selectedTalent)?.name} ({talents.find(t => t.userId === selectedTalent)?.email})
                </p>
                <p>
                  <strong>Location:</strong> {jobs.find(j => j.id === selectedJob)?.location}
                </p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !selectedJob || !selectedTalent}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creating Match...
              </>
            ) : (
              <>
                <Users size={20} />
                Create Match
              </>
            )}
          </button>
        </form>
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="font-medium text-gray-900 mb-2">How to Create Matches</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Select a job posting from the available opportunities</li>
          <li>• Choose a talent that would be a good fit for the position</li>
          <li>• Review the match preview to ensure it's correct</li>
          <li>• Click "Create Match" to notify the talent about this opportunity</li>
          <li>• The talent will be able to view this match in their "My Matches" section</li>
        </ul>
      </div>
    </div>
  );
}
