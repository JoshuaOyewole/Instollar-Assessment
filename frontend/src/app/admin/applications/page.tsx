'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { applicationsAPI } from '@/lib/api';
import Link from 'next/link';
import {
  User,
  Briefcase,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  MapPin,
  Wrench,
} from 'lucide-react';
import { toast } from 'react-toastify';

interface Application {
  _id: string;
  jobId: {
    _id: string;
    title: string;
    location: string;
    requiredSkills?: string[];
    description?: string;
  };
  userId: {
    _id: string;
    name: string;
    email: string;
    role: string;
    location?: string;
    skills?: string[];
  };
  status: 'pending' | 'matched' | 'rejected' | 'withdrawn';
  appliedAt: string;
}

export default function AdminApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, [filter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await applicationsAPI.getAll(params);
      const applications = response.data.data || [];
      console.log('Fetched applications:', applications);
      if (applications.length > 0) {
        console.log('First application jobId:', applications[0].jobId);
      }
      setApplications(applications);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewApplication = async (applicationId: string, status: 'matched' | 'rejected') => {
    try {
      setProcessingId(applicationId);
      await applicationsAPI.review(applicationId, status);
      
      // Update the application in the state
      setApplications(prev => 
        prev.map(app => 
          app._id === applicationId 
            ? { ...app, status, reviewedBy: user?.id, reviewedAt: new Date().toISOString() }
            : app
        )
      );

      // Show success message
      const actionText = status === 'matched' ? 'matched' : 'rejected';
      toast.success(`Application ${actionText} successfully!`);
    } catch (error) {
      console.error('Error reviewing application:', error);
      toast.error('Failed to review application. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'matched':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'withdrawn':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-[#0b2b29] bg-clip-text text-transparent">
            Job Applications
          </h1>
          <p className="text-gray-600 text-lg mt-2">Review and manage talent applications</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-8">
          <div className="overflow-x-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-2 shadow-lg border border-white/20 inline-flex min-w-max">
              {['pending', 'matched', 'rejected', 'all'].map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  className={`px-4 sm:px-6 py-2 rounded-lg font-medium transition-all duration-200 capitalize whitespace-nowrap ${
                    filter === filterType
                      ? 'bg-[linear-gradient(90deg,#0e3e33,#0e3e33_30%,#0b2b29_50%,#0b2b29)] text-white shadow-lg'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50/50'
                  }`}
                >
                  {filterType}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Applications Grid */}
        {error ? (
          <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 px-6 py-4 rounded-xl">
            {error}
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-12 shadow-xl border border-white/20 text-center">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Applications Found</h3>
            <p className="text-gray-600">
              {filter === 'pending' 
                ? 'No pending applications at the moment.'
                : `No ${filter} applications found.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {applications.map((application) => (
              <div
                key={application._id}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-white/20 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
              >
                {/* Application Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {application.jobId.title}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>Applied {formatDate(application.appliedAt)}</span>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(application.status)}`}>
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </div>
                </div>

                {/* Job Details Section */}
                <div className="bg-blue-50/80 backdrop-blur-sm rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Briefcase className="w-4 h-4 mr-2 text-blue-600" />
                    Job Requirements
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 mt-0.5 text-gray-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Location</p>
                        <p className="text-sm text-gray-600">{application.jobId.location}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <Wrench className="w-4 h-4 mt-0.5 text-gray-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Required Skills</p>
                        {application.jobId.requiredSkills && application.jobId.requiredSkills.length > 0 ? (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {application.jobId.requiredSkills.map((skill, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 italic mt-1">No specific skills required</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Talent Details Section */}
                <div className="bg-green-50/80 backdrop-blur-sm rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <User className="w-4 h-4 mr-2 text-green-600" />
                    Talent Profile
                  </h4>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold text-gray-900">{application.userId.name}</p>
                      <p className="text-sm text-gray-600">{application.userId.email}</p>
                    </div>
                    
                    {application.userId.location && (
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 mt-0.5 text-gray-600 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Location</p>
                          <p className="text-sm text-gray-600">{application.userId.location}</p>
                        </div>
                      </div>
                    )}
                    
                    {application.userId.skills && application.userId.skills.length > 0 && (
                      <div className="flex items-start space-x-2">
                        <Wrench className="w-4 h-4 mt-0.5 text-gray-600 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Skills</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {application.userId.skills.map((skill, index) => {
                              // Check if this skill matches any required skill
                              const isMatched = application.jobId.requiredSkills?.some(
                                reqSkill => reqSkill.toLowerCase().includes(skill.toLowerCase()) || 
                                           skill.toLowerCase().includes(reqSkill.toLowerCase())
                              );
                              
                              return (
                                <span
                                  key={index}
                                  className={`px-2 py-1 text-xs rounded-full ${
                                    isMatched 
                                      ? 'bg-green-100 text-green-800 ring-2 ring-green-300' 
                                      : 'bg-gray-100 text-gray-800'
                                  }`}
                                  title={isMatched ? 'Matches job requirement' : ''}
                                >
                                  {skill}
                                  {isMatched && <span className="ml-1">✓</span>}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Skills Match Summary */}
                {application.jobId.requiredSkills && application.jobId.requiredSkills.length > 0 && application.userId.skills && (
                  <div className="bg-yellow-50/80 backdrop-blur-sm rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Skills Match</span>
                      <span className="text-sm text-gray-600">
                        {application.userId.skills.filter(userSkill => 
                          application.jobId.requiredSkills?.some(reqSkill => 
                            reqSkill.toLowerCase().includes(userSkill.toLowerCase()) || 
                            userSkill.toLowerCase().includes(reqSkill.toLowerCase())
                          )
                        ).length} of {application.jobId.requiredSkills.length} required skills
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full" 
                        style={{
                          width: `${Math.min(100, (application.userId.skills.filter(userSkill => 
                            application.jobId.requiredSkills?.some(reqSkill => 
                              reqSkill.toLowerCase().includes(userSkill.toLowerCase()) || 
                              userSkill.toLowerCase().includes(reqSkill.toLowerCase())
                            )
                          ).length / application.jobId.requiredSkills.length) * 100)}%`
                        }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center space-x-3">
                  <Link
                    href={`/jobs/${application.jobId._id}`}
                    className="flex items-center px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Job
                  </Link>
                  
                  {application.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleReviewApplication(application._id, 'matched')}
                        disabled={processingId === application._id}
                        className="flex items-center px-4 py-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {processingId === application._id ? 'Processing...' : 'Match'}
                      </button>
                      <button
                        onClick={() => handleReviewApplication(application._id, 'rejected')}
                        disabled={processingId === application._id}
                        className="flex items-center px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        {processingId === application._id ? 'Processing...' : 'Reject'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
