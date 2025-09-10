'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { jobsAPI, matchesAPI } from '@/lib/api';
import { Job } from '@/components/JobCard';
import { useAuth } from '@/contexts/AuthContext';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Heart,
  Share2,
  CheckCircle,
  AlertCircle,
  User,
  Mail,
  Target
} from 'lucide-react';
import Link from 'next/link';

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchJobDetails();
    }
  }, [params.id]);

  useEffect(() => {
    if (user && job && user.role === 'talent' && !hasApplied) {
      checkApplicationStatus();
    }
  }, [user, job, hasApplied]);

  const fetchJobDetails = async () => {
    try {
      const response = await jobsAPI.getById(params.id as string);
      setJob(response.data.data);
    } catch (err: any) {
      setError('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const checkApplicationStatus = async () => {
    try {
      const response = await matchesAPI.getMyMatches();
      const myMatches = response.data.data || [];
      const hasAppliedToThisJob = myMatches.some((match: any) => 
        match.jobId._id === job?.id || match.jobId.id === job?.id
      );
      setHasApplied(hasAppliedToThisJob);
    } catch (error) {
      console.error('Error checking application status:', error);
    }
  };


  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // Add bookmark API call here
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: job?.title,
          text: `Check out this job opportunity at InstollarMatch`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
      alert('Job URL copied to clipboard!');
    }
  };

  const handleApply = async () => {
    if (!user) {
      router.push(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (!job) return;

    setIsApplying(true);
    try {
      await matchesAPI.apply(job.id);
      setHasApplied(true);
      alert('Application submitted successfully!');
    } catch (error: any) {
      if (error.response?.status === 409) {
        alert('You have already applied to this job.');
        setHasApplied(true);
      } else {
        alert('Failed to submit application. Please try again.');
      }
    } finally {
      setIsApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="relative mb-4">
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
              <div className="absolute inset-0 rounded-full h-20 w-20 border-4 border-transparent border-t-purple-300 animate-ping"></div>
            </div>
            <p className="text-gray-600 text-lg font-medium">Loading job details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center py-12">
          <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 px-8 py-6 rounded-2xl max-w-md mx-auto shadow-xl">
            <AlertCircle className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Job Not Found</h3>
            <p className="mb-4">{error || 'The job you are looking for could not be found.'}</p>
            <button
              onClick={() => router.push('/jobs')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Jobs
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Enhanced Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/5 via-purple-900/5 to-pink-900/5"></div>
      <div className="absolute inset-0">
        <div className="absolute top-32 xl:left-20 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-32 right-20 w-72 h-72 bg-purple-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative pt-8 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 mb-8 transition-colors duration-200 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="font-medium">Back to Jobs</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Job Header Card */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl py-4 px-8 shadow-xl border border-gray-200/50">
                <div className="flex items-start justify-between flex-col">
                  <div className="flex lg:justify-between lg:w-full">
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">
                      {job.title}
                    </h1>
                    <div className="flex space-x-3 h-5 lg:h-auto lg:justify-between  ">
                      <button
                        onClick={handleBookmark}
                        className={`p-3 rounded-xl transition-all duration-200 ${isBookmarked
                          ? 'bg-red-100 text-red-600 hover:bg-red-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                      >
                        <Heart className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        onClick={handleShare}
                        className="p-3 rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all duration-200"
                      >
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>



                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>Posted {formatDate(job.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Job Stats */}








              </div>

              {/* Job Description */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-xl border border-gray-200/50">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Target className="w-6 h-6 mr-3 text-blue-600" />
                  Job Description
                </h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {job.description}
                  </p>
                </div>
              </div>

              {/* Requirements */}
              {job.requiredSkills && job.requiredSkills.length > 0 && (
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-xl border border-gray-200/50">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <CheckCircle className="w-6 h-6 mr-3 text-green-600" />
                    Requirements
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {job.requiredSkills.map((skill, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 p-4 bg-blue-50 rounded-xl border border-blue-200"
                      >
                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <span className="text-blue-800 font-medium">{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Apply Card */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-gray-200/50 sticky top-24">
                <div className="text-center mb-6">
                  {user ? (
                    user.role === 'talent' ? (
                      hasApplied ? (
                        <>
                          <h3 className="text-xl font-bold text-green-700 mb-2">Application Submitted!</h3>
                          <p className="text-gray-600 mb-3">Your will be matched by an admin if you meet the job requirement.</p>
                          <div className="bg-green-100 text-green-800 px-6 py-2 rounded-xl font-semibold">
                            ✓ Applied
                          </div>
                        </>
                      ) : (
                        <>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Express Interest</h3>
                          <p className="text-gray-600 mb-3">Submit your application and get matched with this opportunity.</p>
                          <button
                            onClick={handleApply}
                            disabled={isApplying}
                            className="bg-[linear-gradient(90deg,#0e3e33,#0e3e33_30%,#0b2b29_50%,#0b2b29)] w-full  text-white px-6 py-2 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isApplying ? 'Applying...' : "I'm Interested"}
                          </button>
                        </>
                      )
                    ) : (
                      <>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Admin View</h3>
                        <p className="text-gray-600 mb-3">You are viewing this job as an administrator.</p>
                        <Link
                          href="/admin/jobs"
                          className="bg-gradient-to-r w-full inline-block from-gray-600 to-gray-700 text-white px-6 py-2 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-semibold"
                        >
                          Manage Jobs
                        </Link>
                      </>
                    )
                  ) : (
                    <>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to get Matched?</h3>
                      <p className="text-gray-600 mb-3">Once you create an account, we will match you with the best opportunities.</p>
                      <Link
                        href={`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`}
                        className="bg-[linear-gradient(90deg,#0e3e33,#0e3e33_30%,#0b2b29_50%,#0b2b29)] w-full inline-block  text-white px-6 py-2 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-semibold"
                      >
                        I'm Interested
                      </Link>
                    </>
                  )}
                </div>



                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <span>Posted</span>
                    <div className="flex items-center">
                      <span>{formatDate(job.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Status</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                      {job.isActive ? 'Active' : 'Closed'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Company Info */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-gray-200/50">

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">{job.createdBy?.name || 'HR Team'}</div>
                      <div className="text-sm text-gray-500">Hiring Manager</div>
                    </div>
                  </div>
                  {job.createdBy?.email && (
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-600">{job.createdBy.email}</span>
                    </div>
                  )}
                </div>
              </div>


            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
