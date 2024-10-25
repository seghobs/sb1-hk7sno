import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Story, User } from '../types';

const StoryBar = () => {
  const [stories, setStories] = useState<(Story & { user: User })[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  useEffect(() => {
    // Fetch stories
    const fetchStories = async () => {
      try {
        const response = await fetch('http://localhost:3000/stories', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        setStories(data);
      } catch (error) {
        console.error('Error fetching stories:', error);
      }
    };

    fetchStories();
  }, []);

  return (
    <div className="mb-6 bg-white rounded-lg shadow-md p-4">
      <div className="flex gap-4 overflow-x-auto">
        <button className="flex flex-col items-center min-w-[80px]">
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-blue-500 flex items-center justify-center">
            <Plus className="w-6 h-6 text-blue-500" />
          </div>
          <span className="mt-2 text-sm">Add Story</span>
        </button>

        {stories.map((story) => (
          <button
            key={story.id}
            onClick={() => setSelectedStory(story)}
            className="flex flex-col items-center min-w-[80px]"
          >
            <div className="w-16 h-16 rounded-full border-2 border-blue-500 p-[2px]">
              <img
                src={story.user.profileImage || 'https://via.placeholder.com/64'}
                alt={story.user.username}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <span className="mt-2 text-sm">{story.user.username}</span>
          </button>
        ))}
      </div>

      {selectedStory && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative max-w-lg w-full">
            <img
              src={selectedStory.content}
              alt="Story"
              className="w-full rounded-lg"
            />
            <button
              onClick={() => setSelectedStory(null)}
              className="absolute top-4 right-4 text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryBar;