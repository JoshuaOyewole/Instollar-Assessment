'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { matchesAPI } from '@/lib/api';
import { MapPin, DollarSign, Clock, Building, User, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Match {
  _id: string;
  status: string;
  createdAt: string;
  jobId: {
    _id: string;
    title: string;
    description: string;
    location: string;
    requiredSkills: string[];
  };
  matchedBy: {
    name: string;
    email: string;
  };
}

export default function MyMatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Middleware handles authentication, just fetch matches
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await matchesAPI.getMyMatches();
      setMatches(response.data.data);
    } catch (err: any) {
      setError('Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md mx-auto">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-6 px-4">
      <button
        onClick={() => router.back()}
        className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 mb-8 transition-colors duration-200 group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
        <span className="font-medium">Go Back </span>
      </button>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Job Matches</h1>
        <p className="text-gray-600">
          Jobs that have been matched to your profile by our team
        </p>
      </div>

      {matches.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-100 rounded-lg p-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No matches yet</h3>
            <p className="text-gray-600">
              Our team will match you with suitable opportunities soon. In the meantime, you can browse all available jobs.
            </p>
            <button
              onClick={() => router.push('/jobs')}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Browse All Jobs
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 mb-4">
          {matches.map((match) => (
            <div key={match._id} className="bg-white rounded-lg shadow-md lg:py-6 px-3 py-6 lg:px-5 hover:shadow-lg transition-shadow border-l-4 border-green-500">

              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-semibold text-gray-900">{match.jobId.title}</h2>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs font-medium">
                  Matched
                </span>
              </div>



              <div className="flex items-center mb-3 xl:mb-4">
                <MapPin size={14} className="mr-1" />
                <span>{match.jobId?.location}</span>
              </div>



              <p className="text-gray-700 mb-4 line-clamp-3">{match.jobId.description}</p>

              {Array.isArray(match.jobId.requiredSkills) && match.jobId.requiredSkills.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Requirements:</h4>
                  <div className="flex flex-wrap gap-2">
                    {match.jobId.requiredSkills.slice(0, 3).map((req, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-sm"
                      >
                        {req}
                      </span>
                    ))}
                    {match.jobId.requiredSkills.length > 3 && (
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                        +{match.jobId.requiredSkills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-sm text-gray-500">
                  <div className="flex items-center">
                    <User size={14} className="mr-1" />
                    <span>Matched by {match.matchedBy.name} • {new Date(match.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
