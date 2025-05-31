import { useState } from 'react';
import { PlusCircle, Camera, MapPin, Users } from 'lucide-react';
import SocialPostCreator from '../../components/social/SocialPostCreator';
import ContactForm from '../../components/forms/ContactForm';
import {
  getCountryStaticPaths,
  getCountryStaticProps,
} from '../../utils/countryHelpers.js';

/**
 * Submit content page for community contributions
 */
export default function SubmitContentPage({ country }) {
  const [activeTab, setActiveTab] = useState('post');

  // Get country name from code
  const getCountryName = code => {
    const countries = {
      us: 'United States',
      my: 'Malaysia',
      sg: 'Singapore',
      jp: 'Japan',
    };
    return countries[code] || 'Your Country';
  };

  const handlePostCreated = (post) => {
    console.log('Post created:', post);
    // You could add a success notification here
  };

  const handleContactSubmit = (result) => {
    console.log('Contact form submitted:', result);
    // You could add a success notification here
  };

  const tabs = [
    {
      id: 'post',
      label: 'Share Food Experience',
      icon: Camera,
      description: 'Share photos and reviews of restaurants and dishes'
    },
    {
      id: 'restaurant',
      label: 'Submit Restaurant',
      icon: MapPin,
      description: 'Suggest a new restaurant for our listings'
    },
    {
      id: 'feedback',
      label: 'General Feedback',
      icon: Users,
      description: 'Send us feedback, suggestions, or report issues'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50/30">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <PlusCircle className="h-12 w-12 text-orange-500 mr-4" />
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-gray-900">
              Submit Your Content
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Share your favorite restaurants, dishes, and food experiences with
            the community in{' '}
            <span className="font-semibold text-orange-600">
              {getCountryName(country)}
            </span>
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon
                      className={`mr-2 h-5 w-5 ${
                        activeTab === tab.id
                          ? 'text-orange-500'
                          : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Description */}
          <div className="mt-4">
            <p className="text-gray-600">
              {tabs.find(tab => tab.id === activeTab)?.description}
            </p>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-lg border border-white/20 p-6">
          {activeTab === 'post' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Share Your Food Experience
              </h2>
              <SocialPostCreator
                onPostCreated={handlePostCreated}
                placeholder={`What's your latest food discovery in ${getCountryName(country)}?`}
                showPrivacyOptions={true}
                showLocationTag={true}
                showImageUpload={true}
                maxImages={4}
              />
            </div>
          )}

          {activeTab === 'restaurant' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Submit a Restaurant
              </h2>
              <ContactForm
                inquiryType="restaurant"
                showSubjectField={true}
                showAttachments={true}
                onSubmit={handleContactSubmit}
              />
            </div>
          )}

          {activeTab === 'feedback' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Send Us Feedback
              </h2>
              <ContactForm
                inquiryType="feedback"
                showSubjectField={true}
                showAttachments={false}
                onSubmit={handleContactSubmit}
              />
            </div>
          )}
        </div>

        {/* Additional Information */}
        <div className="mt-8 bg-orange-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-orange-900 mb-3">
            Community Guidelines
          </h3>
          <ul className="text-orange-800 space-y-2">
            <li>• Share authentic experiences and honest reviews</li>
            <li>• Include high-quality photos when possible</li>
            <li>• Be respectful and constructive in your feedback</li>
            <li>• Help others discover great food experiences</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Pre-render these paths
export async function getStaticPaths() {
  return {
    paths: [
      { params: { country: 'us' } },
      { params: { country: 'my' } },
      { params: { country: 'sg' } },
      { params: { country: 'jp' } },
    ],
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  return {
    props: {
      country: params.country,
    },
  };
}
