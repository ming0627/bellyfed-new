import React, { useCallback, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Award, Calendar, MapPin, Users, Clock, Filter, Search } from 'lucide-react';
import Layout from '../../components/layout/Layout.js';
import { useCountry } from '../../contexts/index.js';
import { LucideClientIcon } from '../../components/ui/lucide-icon.js';
import Link from 'next/link';

// Mock data for competitions
const mockCompetitions = [
  {
    id: '1',
    title: 'KL Food Festival Cook-Off',
    description: 'Showcase your culinary skills at the biggest cooking competition in Kuala Lumpur! Open to both amateur and professional chefs.',
    imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=600&h=400&fit=crop',
    startDate: '2023-09-15T09:00:00Z',
    endDate: '2023-09-17T18:00:00Z',
    location: 'Kuala Lumpur Convention Centre, Kuala Lumpur',
    organizer: 'KL Food Festival Association',
    participantCount: 120,
    prizePool: 'RM 50,000',
    categories: ['Main Course', 'Dessert', 'Local Delicacies'],
    registrationDeadline: '2023-09-01T23:59:59Z',
    status: 'upcoming',
    isRegistered: false,
  },
  {
    id: '2',
    title: 'Penang Street Food Challenge',
    description: 'A competition to find the best street food vendor in Penang. Participants will be judged on taste, presentation, and originality.',
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=600&h=400&fit=crop',
    startDate: '2023-08-25T10:00:00Z',
    endDate: '2023-08-27T20:00:00Z',
    location: 'Gurney Drive, Penang',
    organizer: 'Penang Food Heritage Society',
    participantCount: 80,
    prizePool: 'RM 30,000',
    categories: ['Noodles', 'Rice Dishes', 'Snacks'],
    registrationDeadline: '2023-08-15T23:59:59Z',
    status: 'upcoming',
    isRegistered: true,
  },
  {
    id: '3',
    title: 'Malaysia Barista Championship',
    description: 'The premier coffee competition in Malaysia. Baristas will compete to create the perfect espresso, cappuccino, and signature beverage.',
    imageUrl: 'https://images.unsplash.com/photo-1517231925375-bf2cb42917a5?q=80&w=600&h=400&fit=crop',
    startDate: '2023-10-05T09:00:00Z',
    endDate: '2023-10-07T18:00:00Z',
    location: 'Sunway Pyramid Convention Centre, Petaling Jaya',
    organizer: 'Malaysia Specialty Coffee Association',
    participantCount: 60,
    prizePool: 'RM 25,000',
    categories: ['Espresso', 'Latte Art', 'Signature Beverage'],
    registrationDeadline: '2023-09-20T23:59:59Z',
    status: 'upcoming',
    isRegistered: false,
  },
  {
    id: '4',
    title: 'Kuching Food Photography Contest',
    description: 'Capture the beauty and essence of Sarawakian cuisine through your lens. Open to both amateur and professional photographers.',
    imageUrl: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?q=80&w=600&h=400&fit=crop',
    startDate: '2023-09-10T09:00:00Z',
    endDate: '2023-09-10T18:00:00Z',
    location: 'Kuching Waterfront, Sarawak',
    organizer: 'Sarawak Tourism Board',
    participantCount: 150,
    prizePool: 'RM 15,000',
    categories: ['Traditional Cuisine', 'Modern Interpretation', 'Street Food'],
    registrationDeadline: '2023-09-05T23:59:59Z',
    status: 'upcoming',
    isRegistered: false,
  },
  {
    id: '5',
    title: 'Ipoh Bean Sprout Chicken Cook-Off',
    description: 'A competition to find the best bean sprout chicken dish in Ipoh. Participants will be judged on taste, texture, and presentation.',
    imageUrl: 'https://images.unsplash.com/photo-1518492104633-130d0cc84637?q=80&w=600&h=400&fit=crop',
    startDate: '2023-08-20T10:00:00Z',
    endDate: '2023-08-20T16:00:00Z',
    location: 'Ipoh Old Town, Perak',
    organizer: 'Ipoh Food Heritage Association',
    participantCount: 40,
    prizePool: 'RM 10,000',
    categories: ['Traditional', 'Modern Twist'],
    registrationDeadline: '2023-08-15T23:59:59Z',
    status: 'upcoming',
    isRegistered: false,
  },
  {
    id: '6',
    title: 'Johor Bahru Dessert Festival',
    description: 'Showcase your sweet creations at the biggest dessert competition in Johor Bahru. Open to both amateur and professional bakers.',
    imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=600&h=400&fit=crop',
    startDate: '2023-07-15T09:00:00Z',
    endDate: '2023-07-16T18:00:00Z',
    location: 'Johor Bahru City Square, Johor',
    organizer: 'Johor Bahru Culinary Association',
    participantCount: 90,
    prizePool: 'RM 20,000',
    categories: ['Cakes', 'Pastries', 'Traditional Desserts'],
    registrationDeadline: '2023-07-01T23:59:59Z',
    status: 'past',
    isRegistered: true,
    result: {
      winner: 'Sarah Chen',
      winningDish: 'Durian Panna Cotta',
      yourRank: 3,
      totalParticipants: 90,
    },
  },
];

/**
 * CompetitionsPage component for displaying food competitions
 * 
 * @returns {JSX.Element} - Rendered component
 */
export default function CompetitionsPage() {
  const router = useRouter();
  const { currentCountry, isInitialized } = useCountry();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Function to generate country-specific links
  const getCountryLink = useCallback((path) => {
    if (!isInitialized || !currentCountry?.code) return path;
    return `/${currentCountry.code}${path}`;
  }, [currentCountry, isInitialized]);
  
  // Fetch competitions data
  const { data: competitions, isLoading, error } = useQuery({
    queryKey: ['competitions', currentCountry?.code, activeTab],
    queryFn: () => {
      // In a real app, this would fetch data from an API with the country code and filters
      // For now, we'll just return the mock data
      
      // Filter based on active tab
      let filtered = [...mockCompetitions];
      if (activeTab !== 'all') {
        filtered = filtered.filter(item => item.status === activeTab);
      }
      
      // Filter based on search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(item => 
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.location.toLowerCase().includes(query) ||
          item.organizer.toLowerCase().includes(query) ||
          item.categories.some(category => category.toLowerCase().includes(query))
        );
      }
      
      return Promise.resolve(filtered);
    },
    // Don't refetch on window focus for demo purposes
    refetchOnWindowFocus: false,
    // Only enable the query when country is initialized
    enabled: !!isInitialized,
  });
  
  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    // In a real app, this would trigger a new search
    console.log('Searching for:', searchQuery);
  };
  
  // Handle registration
  const handleRegister = (competitionId) => {
    // In a real app, this would call an API to register for the competition
    console.log('Registering for competition:', competitionId);
  };
  
  // Format date range
  const formatDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // If same day
    if (start.toDateString() === end.toDateString()) {
      return `${start.toLocaleDateString()} • ${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Different days
    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
  };
  
  // Check if registration deadline has passed
  const isRegistrationClosed = (deadline) => {
    return new Date(deadline) < new Date();
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <Layout
        title="Food Competitions"
        description="Discover and participate in food competitions and culinary events"
      >
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <LucideClientIcon
              icon={Loader2}
              className="w-8 h-8 animate-spin text-orange-500"
              aria-label="Loading"
            />
          </div>
        </div>
      </Layout>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <Layout
        title="Competitions Error"
        description="Error loading competitions"
      >
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center max-w-md">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Competitions</h1>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                We encountered a problem while loading the competitions. Please try again later.
              </p>
              <button
                onClick={() => router.reload()}
                className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout
      title="Food Competitions"
      description="Discover and participate in food competitions and culinary events"
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <LucideClientIcon icon={Award} className="w-8 h-8 mr-3 text-orange-500" aria-hidden="true" />
            Food Competitions
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl">
            Discover and participate in exciting food competitions and culinary events in {currentCountry?.name || 'your area'}. Showcase your skills, learn from others, and win amazing prizes!
          </p>
        </div>
        
        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <form onSubmit={handleSearch} className="relative flex-grow">
              <input
                type="text"
                placeholder="Search competitions..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <LucideClientIcon
                icon={Search}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5"
                aria-hidden="true"
              />
            </form>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <LucideClientIcon icon={Filter} className="w-5 h-5 mr-2" aria-hidden="true" />
              Filters
            </button>
          </div>
          
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    activeTab === 'all'
                      ? 'bg-orange-500 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                  }`}
                >
                  All Competitions
                </button>
                <button
                  onClick={() => setActiveTab('upcoming')}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    activeTab === 'upcoming'
                      ? 'bg-orange-500 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                  }`}
                >
                  Upcoming
                </button>
                <button
                  onClick={() => setActiveTab('ongoing')}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    activeTab === 'ongoing'
                      ? 'bg-orange-500 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                  }`}
                >
                  Ongoing
                </button>
                <button
                  onClick={() => setActiveTab('past')}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    activeTab === 'past'
                      ? 'bg-orange-500 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                  }`}
                >
                  Past
                </button>
                <button
                  onClick={() => setActiveTab('registered')}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    activeTab === 'registered'
                      ? 'bg-orange-500 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                  }`}
                >
                  My Registrations
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Competitions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {competitions && competitions.length > 0 ? (
            competitions.map((competition) => (
              <div key={competition.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col h-full">
                {/* Competition Image */}
                <div className="relative h-48">
                  <img
                    src={competition.imageUrl}
                    alt={competition.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {competition.status === 'ongoing' && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Ongoing
                    </div>
                  )}
                  {competition.status === 'past' && (
                    <div className="absolute top-2 right-2 bg-gray-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Completed
                    </div>
                  )}
                  {competition.isRegistered && (
                    <div className="absolute top-2 left-2 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Registered
                    </div>
                  )}
                </div>
                
                {/* Competition Details */}
                <div className="p-4 flex-grow">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    <Link href={getCountryLink(`/competitions/${competition.id}`)} className="hover:text-orange-500 transition-colors">
                      {competition.title}
                    </Link>
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                    {competition.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-start">
                      <LucideClientIcon icon={Calendar} className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 mr-2 flex-shrink-0" aria-hidden="true" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDateRange(competition.startDate, competition.endDate)}
                      </span>
                    </div>
                    
                    <div className="flex items-start">
                      <LucideClientIcon icon={MapPin} className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 mr-2 flex-shrink-0" aria-hidden="true" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {competition.location}
                      </span>
                    </div>
                    
                    <div className="flex items-start">
                      <LucideClientIcon icon={Users} className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 mr-2 flex-shrink-0" aria-hidden="true" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {competition.participantCount} participants
                      </span>
                    </div>
                    
                    {competition.status !== 'past' && (
                      <div className="flex items-start">
                        <LucideClientIcon icon={Clock} className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 mr-2 flex-shrink-0" aria-hidden="true" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Registration deadline: {new Date(competition.registrationDeadline).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Categories */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {competition.categories.map((category, index) => (
                      <span key={index} className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs">
                        {category}
                      </span>
                    ))}
                  </div>
                  
                  {/* Prize Pool */}
                  <div className="mb-4">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Prize Pool:</span>
                    <span className="ml-2 text-orange-500 dark:text-orange-400 font-semibold">
                      {competition.prizePool}
                    </span>
                  </div>
                  
                  {/* Results (for past competitions) */}
                  {competition.status === 'past' && competition.result && (
                    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-750 rounded-md">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Results
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Winner: <span className="font-medium">{competition.result.winner}</span>
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Winning Dish: <span className="font-medium">{competition.result.winningDish}</span>
                      </p>
                      {competition.isRegistered && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          Your Rank: <span className="font-medium">{competition.result.yourRank}</span> out of {competition.result.totalParticipants}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Competition Actions */}
                <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                  {competition.status !== 'past' ? (
                    competition.isRegistered ? (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">
                          You're registered!
                        </span>
                        <Link
                          href={getCountryLink(`/competitions/${competition.id}`)}
                          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                        >
                          View Details
                        </Link>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        {isRegistrationClosed(competition.registrationDeadline) ? (
                          <span className="text-sm font-medium text-red-600 dark:text-red-400">
                            Registration closed
                          </span>
                        ) : (
                          <button
                            onClick={() => handleRegister(competition.id)}
                            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors text-sm font-medium"
                          >
                            Register Now
                          </button>
                        )}
                        <Link
                          href={getCountryLink(`/competitions/${competition.id}`)}
                          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                        >
                          View Details
                        </Link>
                      </div>
                    )
                  ) : (
                    <Link
                      href={getCountryLink(`/competitions/${competition.id}`)}
                      className="block w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium text-center"
                    >
                      View Results
                    </Link>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No competitions found. Try adjusting your filters or search query.
              </p>
              <button
                onClick={() => {
                  setActiveTab('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

// Pre-render these paths
export async function getStaticPaths() {
  return {
    paths: [
      { params: { country: 'my' } },
      { params: { country: 'sg' } },
    ],
    fallback: true, // Generate pages for paths not returned by getStaticPaths
  };
}

export async function getStaticProps({ params }) {
  return {
    props: {
      country: params.country,
    },
    // Revalidate every hour
    revalidate: 3600,
  };
}
