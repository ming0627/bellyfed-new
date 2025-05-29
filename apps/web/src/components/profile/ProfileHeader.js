import React, { useState, memo } from 'react';
import Image from 'next/image';
import {
  Camera,
  Edit,
  MapPin,
  Calendar,
  Award,
  MessageSquare,
  Star,
} from 'lucide-react';
/**
 * ProfileHeader component for displaying user profile information
 *
 * @param {Object} props - Component props
 * @param {Object} props.user - User data object
 * @param {boolean} props.isCurrentUser - Whether the profile belongs to the current user
 * @param {Function} props.onEditProfile - Function to handle edit profile action
 * @returns {JSX.Element} - Rendered component
 */
const ProfileHeader = memo(function ProfileHeader({
  user,
  isCurrentUser = false,
  onEditProfile,
}) {
  const [isHoveringCover, setIsHoveringCover] = useState(false);
  const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);

  // Handle cover photo hover
  const handleCoverMouseEnter = () => {
    if (isCurrentUser) {
      setIsHoveringCover(true);
    }
  };

  const handleCoverMouseLeave = () => {
    setIsHoveringCover(false);
  };

  // Handle avatar hover
  const handleAvatarMouseEnter = () => {
    if (isCurrentUser) {
      setIsHoveringAvatar(true);
    }
  };

  const handleAvatarMouseLeave = () => {
    setIsHoveringAvatar(false);
  };

  // Format date for display
  const formatJoinDate = dateString => {
    if (!dateString) return 'Unknown';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
      {/* Cover Photo */}
      <div
        className="relative h-48 sm:h-64 bg-gray-200 dark:bg-gray-700"
        onMouseEnter={handleCoverMouseEnter}
        onMouseLeave={handleCoverMouseLeave}
      >
        {user.coverPhoto ? (
          <Image
            src={user.coverPhoto}
            alt={`${user.name}'s cover`}
            layout="fill"
            objectFit="cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-orange-400 to-orange-600"></div>
        )}

        {/* Cover Photo Edit Overlay */}
        {isCurrentUser && isHoveringCover && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <button
              onClick={() => onEditProfile('coverPhoto')}
              className="bg-white text-gray-800 px-4 py-2 rounded-md flex items-center"
            >
              <CameraclassName="w-5 h-5 mr-2"
                aria-hidden="true"
               />
              Change Cover
            </button>
          </div>
        )}

        {/* Edit Profile Button */}
        {isCurrentUser && (
          <button
            onClick={() => onEditProfile('profile')}
            className="absolute top-4 right-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-white p-2 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Edit profile"
          >
            <EditclassName="w-5 h-5"
              aria-hidden="true"
             />
          </button>
        )}
      </div>

      {/* Profile Info */}
      <div className="relative px-4 sm:px-6 pb-6">
        {/* Avatar */}
        <div
          className="relative -mt-16 mb-4"
          onMouseEnter={handleAvatarMouseEnter}
          onMouseLeave={handleAvatarMouseLeave}
        >
          <div className="w-32 h-32 mx-auto rounded-full border-4 border-white dark:border-gray-800 overflow-hidden bg-gray-200 dark:bg-gray-700">
            {user.profilePicture ? (
              <Image
                src={user.profilePicture}
                alt={user.name}
                width={128}
                height={128}
                objectFit="cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-orange-500 text-white text-4xl font-bold">
                {user.name.charAt(0)}
              </div>
            )}
          </div>

          {/* Avatar Edit Overlay */}
          {isCurrentUser && isHoveringAvatar && (
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={() => onEditProfile('avatar')}
                className="bg-black bg-opacity-50 text-white p-2 rounded-full"
                aria-label="Change profile picture"
              >
                <CameraclassName="w-5 h-5"
                  aria-hidden="true"
                 />
              </button>
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {user.name}
          </h1>

          {user.bio && (
            <p className="text-gray-600 dark:text-gray-400 mb-3 max-w-lg mx-auto">
              {user.bio}
            </p>
          )}

          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            {user.location && (
              <div className="flex items-center">
                <MapPinclassName="w-4 h-4 mr-1"
                  aria-hidden="true"
                 />
                <span>{user.location}</span>
              </div>
            )}

            <div className="flex items-center">
              <CalendarclassName="w-4 h-4 mr-1"
                aria-hidden="true"
               />
              <span>Joined {formatJoinDate(user.joinDate)}</span>
            </div>
          </div>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-3 gap-4 border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <StarclassName="w-5 h-5 text-orange-500 mr-1"
                aria-hidden="true"
               />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {user.reviewCount || 0}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Reviews</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <MessageSquareclassName="w-5 h-5 text-orange-500 mr-1"
                aria-hidden="true"
               />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {user.commentCount || 0}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Comments</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <AwardclassName="w-5 h-5 text-orange-500 mr-1"
                aria-hidden="true"
               />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {user.badgeCount || 0}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Badges</p>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ProfileHeader;
