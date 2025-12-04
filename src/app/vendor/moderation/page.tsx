'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../../amplify/data/resource';
import { imageSizes, generateBlurDataURL } from '@/lib/utils/image-optimization';

const client = generateClient<Schema>();

interface Story {
  id: string;
  vendorId: string;
  vendor?: { id: string; name: string; [key: string]: unknown };
  platform: string;
  videoUrl: string;
  thumbnailUrl?: string;
  caption?: string;
  postedAt: string;
  isApproved: boolean;
  isFeatured: boolean;
  moderationNotes?: string;
}

export default function ModerationPage() {
  const queryClient = useQueryClient();
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [notes, setNotes] = useState('');

  // Fetch pending stories
  const { data: stories, isLoading } = useQuery({
    queryKey: ['stories', 'pending'],
    queryFn: async () => {
      // TODO: Add a query to fetch unapproved stories
      // For now, return empty array
      return [] as Story[];
    },
  });

  // Approve story mutation
  const approveMutation = useMutation({
    mutationFn: async ({ storyId, featured }: { storyId: string; featured: boolean }) => {
      // TODO: Implement story approval mutation
      console.log('Approving story:', storyId, 'Featured:', featured);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories', 'pending'] });
      setSelectedStory(null);
      setNotes('');
    },
  });

  // Reject story mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ storyId, reason }: { storyId: string; reason: string }) => {
      // TODO: Implement story rejection mutation
      console.log('Rejecting story:', storyId, 'Reason:', reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories', 'pending'] });
      setSelectedStory(null);
      setNotes('');
    },
  });

  const handleApprove = (featured: boolean = false) => {
    if (!selectedStory) return;
    approveMutation.mutate({ storyId: selectedStory.id, featured });
  };

  const handleReject = () => {
    if (!selectedStory) return;
    rejectMutation.mutate({ storyId: selectedStory.id, reason: notes });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading stories...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Story Moderation</h1>

        {stories && stories.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No stories pending approval</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stories list */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Pending Stories</h2>
              {stories?.map((story) => (
                <div
                  key={story.id}
                  onClick={() => setSelectedStory(story)}
                  className={`bg-white rounded-lg shadow p-4 cursor-pointer transition-colors ${
                    selectedStory?.id === story.id ? 'ring-2 ring-blue-500' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    <div className="relative w-24 h-32 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                      {story.thumbnailUrl ? (
                        <Image
                          src={story.thumbnailUrl}
                          alt="Story thumbnail"
                          fill
                          className="object-cover"
                          sizes={imageSizes.thumbnail}
                          loading="lazy"
                          placeholder="blur"
                          blurDataURL={generateBlurDataURL()}
                          quality={75}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No preview
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded">
                          {story.platform}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(story.postedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        {story.vendor?.businessName || 'Unknown Vendor'}
                      </p>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {story.caption || 'No caption'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Preview and actions */}
            {selectedStory && (
              <div className="bg-white rounded-lg shadow p-6 sticky top-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Review Story</h2>

                {/* Video preview */}
                <div className="mb-4 bg-black rounded-lg overflow-hidden aspect-[9/16]">
                  <video
                    src={selectedStory.videoUrl}
                    poster={selectedStory.thumbnailUrl}
                    controls
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Story details */}
                <div className="mb-4 space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Vendor:</span>
                    <span className="text-sm text-gray-900 ml-2">
                      {selectedStory.vendor?.businessName || 'Unknown'}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Platform:</span>
                    <span className="text-sm text-gray-900 ml-2">{selectedStory.platform}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Posted:</span>
                    <span className="text-sm text-gray-900 ml-2">
                      {new Date(selectedStory.postedAt).toLocaleString()}
                    </span>
                  </div>
                  {selectedStory.caption && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Caption:</span>
                      <p className="text-sm text-gray-900 mt-1">{selectedStory.caption}</p>
                    </div>
                  )}
                </div>

                {/* Moderation notes */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Moderation Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Add notes about this story..."
                  />
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <button
                    onClick={() => handleApprove(true)}
                    disabled={approveMutation.isPending}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Approve & Feature
                  </button>
                  <button
                    onClick={() => handleApprove(false)}
                    disabled={approveMutation.isPending}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Approve
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={rejectMutation.isPending}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reject
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
