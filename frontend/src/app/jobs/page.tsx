'use client';

import { useState, useEffect } from 'react';
import { jobsAPI } from '@/lib/api';
import JobCard, { Job } from '@/components/JobCard';
import {
    MapPin,
    Search,
    Briefcase,
    Zap,
} from 'lucide-react';



export default function JobsPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
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


    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
                <div className="flex items-center justify-center min-h-screen">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
                        <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-purple-300 animate-ping"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center !pt-16">
                <div className="text-center py-12">
                    <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 px-8 py-6 rounded-2xl max-w-md mx-auto shadow-xl">
                        <div className="mb-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                                <Zap className="w-6 h-6 text-red-600" />
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Oops! Something went wrong</h3>
                        <p>{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className=" bg-gradient-to-br h-screen overflow-y-scroll from-slate-50 via-blue-50 to-purple-50 !pt-8 lg:!pt-16">
            {/* Enhanced Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/5 via-purple-900/5 to-pink-900/5"></div>
            <div className="absolute inset-0">
                <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative !pb-16">
                <div className="  px-4 sm:px-6 lg:px-8 !mx-auto !flex !flex-col w-full xl:!w-[85%]" >
                    {/* Hero Header */}
                    <div className="text-center flex flex-col items-center">

                        <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight">
                            Job Listing
                            {/*  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                               <span></span> Career Move
                            </span> */}
                        </h1>
                        <p className="text-base md:text-2xl text-gray-700 mb-8 leading-relaxed font-light max-w-3xl mx-auto">
                            Browse through <span className="font-semibold text-gray-800">{jobs.length} amazing opportunities</span> from top companies waiting for talented people like you.
                        </p>
                    </div>

                

                    {/* Job Listings */}
                    {jobs.length === 0 ? (
                        <div className="text-center">
                            <div className="bg-white/80 flex items-center flex-col backdrop-blur-sm rounded-3xl !p-12 shadow-xl border border-gray-200/50 !max-w-md !mx-auto">
                                <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full  !flex !items-center !justify-center mx-auto mb-6">
                                    <Briefcase className="w-8 h-8 text-blue-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">No jobs found</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {jobs.length === 0
                                        ? "Check back later for new opportunities!"
                                        : "Try adjusting your search criteria to find more matches."
                                    }
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {jobs.map((job) => (
                                <JobCard key={job.id} job={job} />

                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
