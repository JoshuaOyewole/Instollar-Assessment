import React from 'react';
import {
    MapPin,
    Calendar,
    ArrowRight,
    Users
} from 'lucide-react';
import Link from 'next/link';

export interface Job {
    id: string;
    title: string;
    description: string;
    location: string;
    requiredSkills: string[];
    createdAt: string;
    isActive?: boolean;
    createdBy: {
        _id: string;
        name: string;
        email: string;
    };
}

interface JobCardProps {
    job: Job;
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {

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
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    };



    return (
        <div className="group bg-white/80 backdrop-blur-sm rounded-2xl !p-6 shadow-lg border border-gray-200/50 hover:shadow-2xl hover:border-blue-300/50 transition-all duration-300 hover:-translate-y-1">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center !gap-x-2">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                        {job.title}
                    </h3>

                </div>

                <div className="flex items-center !gap-x-2">

                    <div className="text-xs text-gray-500 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(job.createdAt)}
                    </div>
                </div>
            </div>

            {/* Job Details */}

            <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 !mr-2" />
                    <span>{job.location}</span>
                </div>
            </div>


            {/* Description */}
            <p className="text-gray-700 text-sm leading-relaxed !mt-2 line-clamp-2">
                {job.description}
            </p>

            {/* Requirements */}
            {job.requiredSkills && job.requiredSkills.length > 0 && (
                <div className="my-4">
                    <div className="flex flex-wrap gap-2">
                        {job.requiredSkills.slice(0, 3).map((skill, index) => (
                            <span
                                key={index}
                                className="!px-2 !py-1 bg-blue-50 text-blue-700 text-xs rounded-lg border border-blue-200"
                            >
                                {skill}
                            </span>
                        ))}
                        {job.requiredSkills.length > 3 && (
                            <span className="!px-2 !py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">
                                +{job.requiredSkills.length - 3} more
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center !gap-x-3 text-xs text-gray-500">
                    <div className="flex items-center">
                        <Users className="w-3 h-3 !mr-1" />
                        <span className='truncate w-4/5'>Posted by {job.createdBy?.name || ' Admin'}</span>
                    </div>
                    {job.isActive !== false && (
                        <div className="items-center hidden md:flex">
                            <div className="w-2 h-2 bg-green-400 rounded-full !mr-1 animate-pulse"></div>
                            <span className="text-green-600 font-medium">Active</span>
                        </div>
                    )}
                </div>

                <Link href={`/jobs/${job.id}`} className="flex items-center space-x-2 bg-[linear-gradient(90deg,#0e3e33,#0e3e33_30%,#0b2b29_50%,#0b2b29)] text-white !px-4 !py-2 rounded-xl text-sm font-medium transition-all duration-200 group-hover:shadow-lg">
                    <span>View</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
            </div>
        </div>
    );
};

export default JobCard;