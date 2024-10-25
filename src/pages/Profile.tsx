import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { User, Post } from '../types';
import PostCard from '../components/PostCard';

const Profile = () => {
  const { username } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'followers' | 'following'>('posts');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`http://localhost:3000/users/${username}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUserData();
  }, [username]);

  return (
    <div className="max-w-2xl mx-auto">
      {user && (
        <>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center gap-6">
              <img
                src={user.profileImage || 'https://via.placeholder.com/150'}
                alt={user.username}
                className="w-24 h-24 rounded-full object-cover"
              />
              <div>
                <h1 className="text-2xl font-bold">{user.username}</h1>
                <p className="text-gray-600">{user.bio}</p>
                <div className="flex gap-4 mt-2">
                  <span>{user.postsCount} posts</span>
                  <span>{user.followersCount} followers</span>
                  <span>{user.followingCount} following</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md">
            <div className="flex border-b">
              <button
                className={`flex-1 py-3 ${activeTab === 'posts' ? 'border-b-2 border-blue-500' : ''}`}
                onClick={() => setActiveTab('posts')}
              >
                Posts
              </button>
              <button
                className={`flex-1 py-3 ${activeTab === 'followers' ? 'border-b-2 border-blue-500' : ''}`}
                onClick={() => setActiveTab('followers')}
              >
                Followers
              </button>
              <button
                className={`flex-1 py-3 ${activeTab === 'following' ? 'border-b-2 border-blue-500' : ''}`}
                onClick={() => setActiveTab('following')}
              >
                Following
              </button>
            </div>

            <div className="p-4">
              {activeTab === 'posts' && (
                <div className="space-y-6">
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              )}
              {/* Add followers and following tabs content */}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Profile;