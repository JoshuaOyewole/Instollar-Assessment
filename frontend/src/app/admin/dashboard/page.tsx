'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { jobsAPI, matchesAPI, usersAPI, applicationsAPI } from '@/lib/api';
import Link from 'next/link';
import {
  Users,
  Briefcase,
  UserCheck,
  TrendingUp,
  Eye,
  Plus,
  Activity,
  Calendar,
  Clock,
  ArrowUpRight,
  Settings,
  BarChart3
} from 'lucide-react';

interface DashboardStats {
  totalJobs: number;
  activeJobs: number;
  totalMatches: number;
  totalTalents: number;
  totalApplications: number;
  pendingApplications: number;
  recentMatches: any[];
  recentJobs: any[];
  recentApplications: any[];
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    activeJobs: 0,
    totalMatches: 0,
    totalTalents: 0,
    totalApplications: 0,
    pendingApplications: 0,
    recentMatches: [],
    recentJobs: [],
    recentApplications: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch jobs data
      const jobsResponse = await jobsAPI.getAll();
      const jobs = jobsResponse.data.data || [];

      // Fetch matches data
      const matchesResponse = await matchesAPI.getAll();
      const matches = matchesResponse.data.data || [];

      //Fetch users count
      const usersResponse = await usersAPI.getAllTalents();
      const usersCount = usersResponse.data.data || []

      // Fetch applications data
      const applicationsResponse = await applicationsAPI.getAll();
      const applications = applicationsResponse.data.data || [];

      // Fetch pending applications
      const pendingApplicationsResponse = await applicationsAPI.getAll({ status: 'pending' });
      const pendingApplications = pendingApplicationsResponse.data.data || [];
      
      setStats({
        totalJobs: jobs.length,
        activeJobs: jobs.filter((job: any) => job.isActive).length,
        totalMatches: matches.length,
        totalTalents: usersCount.length,
        totalApplications: applications.length,
        pendingApplications: pendingApplications.length,
        recentMatches: matches.slice(0, 5),
        recentJobs: jobs.slice(0, 5),
        recentApplications: applications.slice(0, 5)
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
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
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[#195d4d]  to-[#0b2b29] bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <div className="flex items-center mt-3">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                <p className="text-gray-600 text-lg">Welcome back, <span className="font-semibold text-gray-800">{user?.name}</span></p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="bg-white/70 backdrop-blur-sm rounded-full p-3 shadow-lg border border-white/20">
                <Settings className="h-5 w-5 text-gray-600" />
              </div>
              <div className="bg-white/70 backdrop-blur-sm rounded-full p-3 shadow-lg border border-white/20">
                <BarChart3 className="h-5 w-5 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="group relative bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Jobs</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{stats.totalJobs}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-xs text-green-600 font-medium">+12% this month</span>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                <Briefcase className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>

          {/*   <div className="group relative bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Active Jobs</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{stats.activeJobs}</p>
                <div className="flex items-center mt-2">
                  <Activity className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-xs text-green-600 font-medium">Live now</span>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
            </div>
          </div> */}

          <div className="group relative bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Matches</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{stats.totalMatches}</p>
                <div className="flex items-center mt-2">
                  <UserCheck className="h-4 w-4 text-purple-500 mr-1" />
                  <span className="text-xs text-purple-600 font-medium">+8% this week</span>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg">
                <UserCheck className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>

          <div className="group relative bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Talents</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">{stats.totalTalents}</p>
                <div className="flex items-center mt-2">
                  <Users className="h-4 w-4 text-orange-500 mr-1" />
                  <span className="text-xs text-orange-600 font-medium">Growing</span>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl shadow-lg">
                <Users className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>

          <div className="group relative bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Applications</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">{stats.totalApplications}</p>
                <div className="flex items-center mt-2">
                  <Clock className="h-4 w-4 text-teal-500 mr-1" />
                  <span className="text-xs text-teal-600 font-medium">{stats.pendingApplications} pending</span>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl shadow-lg">
                <Activity className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <Link
            href="/admin/jobs/create"
            className="group relative bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg mr-4">
                    <Plus className="h-6 w-6 text-white" />
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Create New Job</h3>
                <p className="text-gray-600">Add a new job posting and start matching with talents</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/jobs"
            className="group relative bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-3">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg mr-4">
                    <Eye className="h-6 w-6 text-white" />
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-green-500 transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Manage Jobs</h3>
                <p className="text-gray-600">View, edit and monitor all job postings</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/applications"
            className="group relative bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-3">
                  <div className="p-3 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl shadow-lg mr-4">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-teal-500 transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Review Applications</h3>
                <p className="text-gray-600">Review talent applications and create matches</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Matches */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg mr-3">
                    <UserCheck className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Recent Matches</h3>
                </div>

              </div>
            </div>
            <div className="p-6">
              {stats.recentMatches.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentMatches.map((match: any, index: number) => (
                    <div key={index} className="group flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                      <div className="flex items-center">
                        <div className="h-12 w-16 lg:w-12 lg:h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl flex items-center justify-center mr-4">
                          <UserCheck className=" h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {match.userId?.name || 'Unknown User'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {match.jobId?.title || 'Unknown Job'}
                          </p>
                          <div className="flex items-center mt-1">
                            <Clock className="h-3 w-3 text-gray-400 mr-1" />
                            <span className="text-xs text-gray-500">2 hours ago</span>
                          </div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${match.status === 'matched' ? 'bg-blue-100 text-blue-800' :
                        match.status === 'viewed' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                        {match.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserCheck className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">No recent matches</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Jobs */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg mr-3">
                    <Briefcase className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Recent Jobs</h3>
                </div>

              </div>
            </div>
            <div className="p-6">
              {stats.recentJobs.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentJobs.map((job: any, index: number) => (
                    <div key={index} className="group flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                      <div className="flex items-center">
                        <div className=" h-12 w-16 lg:w-12 lg:h-12 bg-gradient-to-r from-green-100 to-blue-100 rounded-xl flex items-center justify-center mr-4">
                          <Briefcase className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{job.title}</p>
                          <p className="text-sm text-gray-600">{job.location}</p>
                          <div className="flex items-center mt-1">
                            <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                            <span className="text-xs text-gray-500">Posted today</span>
                          </div>
                        </div>
                      </div>
                      <span className="px-3 py-1 text-xs font-medium rounded-full 
                         bg-green-100 text-green-800">
                        Active
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">No recent jobs</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}