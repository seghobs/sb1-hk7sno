import React, { useState, useEffect } from 'react';
import { PlusSquare } from 'lucide-react';
import PostCard from '../components/PostCard';
import StoryBar from '../components/StoryBar';
import CreatePost from '../components/CreatePost';
import { Post } from '../types';

const HomePage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [showCreatePost, setShowCreatePost] = useState(false);

  useEffect(() => {
    // Fetch posts
    const fetchPosts = async () => {
      try {
        const response = await fetch('http://localhost:3000/posts', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <StoryBar />
      
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => setShowCreatePost(true)}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          <PlusSquare className="w-5 h-5" />
          Create Post
        </button>
      </div>

      {showCreatePost && (
        <CreatePost
          onClose={() => setShowCreatePost(false)}
          onPostCreated={(newPost) => {
            setPosts([newPost, ...posts]);
            setShowCreatePost(false);
          }}
        />
      )}

      <div className="space-y-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default HomePage;