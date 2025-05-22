import React from 'react';
import { getCountryStaticPaths, getCountryStaticProps } from '@bellyfed/utils';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Users, MessageCircle, Heart, Share2 } from 'lucide-react';

export default function SocialPage({ country }) {
  // Mock data for social feed
  const socialFeed = [
    {
      id: 1,
      user: {
        name: 'Jane Cooper',
        avatar: 'https://randomuser.me/api/portraits/women/10.jpg',
      },
      content: 'Just tried the new ramen place downtown. Absolutely amazing!',
      image: 'https://images.unsplash.com/photo-1614563637806-1d0e645e0940?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2073&q=80',
      likes: 24,
      comments: 5,
      time: '2 hours ago',
    },
    {
      id: 2,
      user: {
        name: 'Alex Morgan',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      },
      content: 'Found this hidden gem for breakfast. The pancakes are to die for!',
      image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1980&q=80',
      likes: 42,
      comments: 8,
      time: '5 hours ago',
    },
    {
      id: 3,
      user: {
        name: 'Sarah Chen',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      },
      content: 'Birthday dinner at the new Italian place. The pasta was incredible!',
      image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2032&q=80',
      likes: 56,
      comments: 12,
      time: '1 day ago',
    },
  ];

  return (
    <Container>
      <PageHeader
        title="Social Feed"
        description="Connect with food lovers and share your culinary experiences"
        icon={<Users className="w-8 h-8 text-primary-500" />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          {socialFeed.map((post) => (
            <Card key={post.id} className="overflow-hidden">
              <div className="p-4 flex items-center space-x-3">
                <Avatar src={post.user.avatar} alt={post.user.name} size="md" />
                <div>
                  <h3 className="font-medium">{post.user.name}</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">{post.time}</p>
                </div>
              </div>
              
              <div className="px-4 pb-3">
                <p>{post.content}</p>
              </div>
              
              {post.image && (
                <div className="aspect-video w-full bg-neutral-100 dark:bg-neutral-800">
                  <img 
                    src={post.image} 
                    alt="Post" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 flex justify-between">
                <Button variant="ghost" size="sm" className="text-neutral-600 dark:text-neutral-400">
                  <Heart className="w-4 h-4 mr-1.5" />
                  {post.likes}
                </Button>
                <Button variant="ghost" size="sm" className="text-neutral-600 dark:text-neutral-400">
                  <MessageCircle className="w-4 h-4 mr-1.5" />
                  {post.comments}
                </Button>
                <Button variant="ghost" size="sm" className="text-neutral-600 dark:text-neutral-400">
                  <Share2 className="w-4 h-4 mr-1.5" />
                  Share
                </Button>
              </div>
            </Card>
          ))}
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-4">
            <h3 className="font-semibold text-lg mb-4">Popular Food Lovers</h3>
            <div className="space-y-4">
              {[
                { name: 'Mike Johnson', avatar: 'https://randomuser.me/api/portraits/men/42.jpg', followers: '2.5K' },
                { name: 'Lisa Wong', avatar: 'https://randomuser.me/api/portraits/women/65.jpg', followers: '1.8K' },
                { name: 'David Kim', avatar: 'https://randomuser.me/api/portraits/men/22.jpg', followers: '3.2K' },
              ].map((user, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar src={user.avatar} alt={user.name} size="sm" />
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-neutral-500">{user.followers} followers</p>
                    </div>
                  </div>
                  <Button variant="outline" size="xs">Follow</Button>
                </div>
              ))}
            </div>
          </Card>
          
          <Card className="p-4">
            <h3 className="font-semibold text-lg mb-4">Trending Topics</h3>
            <div className="space-y-2">
              {['#StreetFood', '#BrunchGoals', '#FoodieLife', '#HomeCooking', '#DessertLover'].map((tag) => (
                <div key={tag} className="py-1.5 px-3 bg-neutral-100 dark:bg-neutral-800 rounded-full text-sm inline-block mr-2 mb-2">
                  {tag}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </Container>
  );
}

// Generate static paths for all supported countries
export const getStaticPaths = () => getCountryStaticPaths();

// Get static props with country information
export const getStaticProps = ({ params }) => getCountryStaticProps(params);
