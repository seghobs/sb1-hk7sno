import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { Post } from '../types';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const [liked, setLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const handleLike = async () => {
    try {
      const response = await fetch(`http://localhost:3000/posts/${post.id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        setLiked(!liked);
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {post.image && (
        <img
          src={post.image}
          alt="Post"
          className="w-full h-96 object-cover"
        />
      )}
      
      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <Link to={`/profile/${post.userId}`}>
            <img
              src="https://via.placeholder.com/40"
              alt="User"
              className="w-10 h-10 rounded-full"
            />
          </Link>
          <div>
            <Link to={`/profile/${post.userId}`} className="font-medium hover:underline">
              Username
            </Link>
            <p className="text-sm text-gray-500">
              {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <p className="mb-4">{post.content}</p>

        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 ${liked ? 'text-red-500' : ''}`}
          >
            <Heart className={`w-6 h-6 ${liked ? 'fill-current' : ''}`} />
            <span>{post.likesCount}</span>
          </button>
          
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1"
          >
            <MessageCircle className="w-6 h-6" />
            <span>{post.commentsCount}</span>
          </button>
          
          <button className="flex items-center gap-1">
            <Share2 className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostCard;