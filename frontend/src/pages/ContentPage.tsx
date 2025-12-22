import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import api from '@/services/api';
import { 
  Plus, 
  Image as ImageIcon, 
  Calendar, 
  Send, 
  Save, 
  Eye,
  X,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Music,
  Clock,
  FileText,
  Filter
} from 'lucide-react';

interface SocialAccount {
  id: string;
  platform: string;
  handle: string;
  isActive: boolean;
}

interface Post {
  id: string;
  contentText: string;
  mediaUrls: string[] | null;
  scheduledAt: string | null;
  publishedAt: string | null;
  status: string;
  createdAt: string;
  platforms?: Array<{ socialAccount: { platform: string; handle: string } }>;
}

const PLATFORM_ICONS: Record<string, any> = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  linkedin: Linkedin,
  youtube: Youtube,
  tiktok: Music,
};

const PLATFORM_COLORS: Record<string, string> = {
  facebook: 'bg-blue-600',
  instagram: 'bg-gradient-to-r from-purple-500 to-pink-500',
  twitter: 'bg-black',
  linkedin: 'bg-blue-700',
  youtube: 'bg-red-600',
  tiktok: 'bg-black',
};

export default function ContentPage() {
  const { teamId } = useParams<{ teamId?: string }>();
  const queryClient = useQueryClient();
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(teamId || null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Get teams
  const { data: teams } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const response = await api.get('/teams');
      return response.data;
    },
  });

  // Set default team
  useEffect(() => {
    if (!selectedTeamId && teams && teams.length > 0) {
      setSelectedTeamId(teams[0].id);
    }
  }, [teams, selectedTeamId]);

  // Get social accounts for selected team
  const { data: socialAccounts } = useQuery({
    queryKey: ['social-accounts', selectedTeamId],
    queryFn: async () => {
      if (!selectedTeamId) return [];
      const response = await api.get(`/teams/${selectedTeamId}/social-accounts`);
      return response.data;
    },
    enabled: !!selectedTeamId,
  });

  // Get posts for selected team
  const { data: posts } = useQuery({
    queryKey: ['posts', selectedTeamId],
    queryFn: async () => {
      if (!selectedTeamId) return [];
      const response = await api.get(`/teams/${selectedTeamId}/posts`);
      return response.data;
    },
    enabled: !!selectedTeamId,
  });

  // Filter posts by status
  const filteredPosts = posts?.filter((post: Post) => 
    statusFilter === 'all' ? true : post.status === statusFilter
  ) || [];

  if (!selectedTeamId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">No Team Selected</h3>
          <p className="mt-1 text-sm text-gray-500">Please select a team to create posts</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Studio</h1>
          <p className="text-gray-600 mt-2">Create and schedule your social media posts</p>
        </div>
        {!showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus size={20} />
            Create Post
          </button>
        )}
      </div>

      {/* Team Selector */}
      {teams && teams.length > 1 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Team</label>
          <select
            value={selectedTeamId || ''}
            onChange={(e) => setSelectedTeamId(e.target.value)}
            className="block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {teams.map((team: any) => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Create Post Form */}
      {showCreateForm && (
        <CreatePostForm
          teamId={selectedTeamId!}
          socialAccounts={socialAccounts || []}
          onCancel={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false);
            queryClient.invalidateQueries({ queryKey: ['posts'] });
          }}
        />
      )}

      {/* Posts List */}
      {!showCreateForm && (
        <div className="bg-white rounded-lg shadow">
          {/* Filters */}
          <div className="p-4 border-b border-gray-200 flex items-center gap-4">
            <Filter size={18} className="text-gray-500" />
            <div className="flex gap-2">
              {['all', 'draft', 'scheduled', 'published'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    statusFilter === status
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
            <span className="ml-auto text-sm text-gray-500">
              {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'}
            </span>
          </div>

          {/* Posts Grid */}
          {filteredPosts.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No posts found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {statusFilter === 'all' 
                  ? 'Get started by creating your first post'
                  : `No ${statusFilter} posts found`}
              </p>
            </div>
          ) : (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post: Post) => (
                <PostCard key={post.id} post={post} teamId={selectedTeamId!} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Create Post Form Component
function CreatePostForm({ 
  teamId, 
  socialAccounts, 
  onCancel, 
  onSuccess 
}: { 
  teamId: string; 
  socialAccounts: SocialAccount[];
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scheduledAt, setScheduledAt] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [status, setStatus] = useState<'draft' | 'scheduled' | 'published'>('draft');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const queryClient = useQueryClient();

  // Handle media file selection
  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setMediaFiles(prev => [...prev, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setMediaPreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Calculate scheduled datetime
  const getScheduledDateTime = (): string | undefined => {
    if (!scheduledAt || !scheduledTime) return undefined;
    return new Date(`${scheduledAt}T${scheduledTime}`).toISOString();
  };

  // Create post mutation
  const createPost = useMutation({
    mutationFn: async (data: {
      contentText: string;
      mediaUrls?: string[];
      scheduledAt?: string;
      status: string;
      platformIds?: string[];
    }) => {
      const response = await api.post(`/teams/${teamId}/posts`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', teamId] });
      onSuccess();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // For now, we'll store media as data URLs (in production, upload to cloud storage first)
    const mediaUrls = mediaPreviews.length > 0 ? mediaPreviews : undefined;
    const scheduledDateTime = getScheduledDateTime();
    
    // Determine status
    let postStatus = status;
    if (scheduledDateTime && status === 'draft') {
      postStatus = 'scheduled';
    }

    await createPost.mutateAsync({
      contentText: content,
      mediaUrls,
      scheduledAt: scheduledDateTime,
      status: postStatus,
      platformIds: selectedPlatforms.length > 0 ? selectedPlatforms : undefined,
    });
  };

  const characterCount = content.length;
  const maxCharacters = 280; // Default, varies by platform

  return (
    <div className="bg-white rounded-lg shadow mb-8">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Create New Post</h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Content Editor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Post Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            placeholder="What's on your mind?"
          />
          <div className="mt-2 flex justify-between items-center">
            <span className={`text-sm ${characterCount > maxCharacters ? 'text-red-600' : 'text-gray-500'}`}>
              {characterCount} / {maxCharacters} characters
            </span>
          </div>
        </div>

        {/* Media Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Media (Images/Videos)
          </label>
          <div className="mt-2 flex items-center gap-4">
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <ImageIcon size={18} />
              Add Media
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleMediaSelect}
                className="hidden"
              />
            </label>
            {mediaFiles.length > 0 && (
              <span className="text-sm text-gray-500">
                {mediaFiles.length} {mediaFiles.length === 1 ? 'file' : 'files'} selected
              </span>
            )}
          </div>
          
          {/* Media Previews */}
          {mediaPreviews.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {mediaPreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-md border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeMedia(index)}
                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Platform Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Platforms
          </label>
          {socialAccounts.length === 0 ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                No social accounts connected. <a href="/social-accounts" className="underline">Connect accounts</a> to publish posts.
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {socialAccounts.map((account) => {
                const Icon = PLATFORM_ICONS[account.platform] || FileText;
                const isSelected = selectedPlatforms.includes(account.id);
                return (
                  <button
                    key={account.id}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedPlatforms(prev => prev.filter(id => id !== account.id));
                      } else {
                        setSelectedPlatforms(prev => [...prev, account.id]);
                      }
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md border-2 transition-colors ${
                      isSelected
                        ? `border-primary-500 ${PLATFORM_COLORS[account.platform] || 'bg-primary-600'} text-white`
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-sm font-medium">{account.handle}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Scheduling */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Schedule Date
            </label>
            <input
              type="date"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Schedule Time
            </label>
            <input
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              disabled={!scheduledAt}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-100"
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="draft">Draft</option>
            <option value="scheduled" disabled={!scheduledAt || !scheduledTime}>
              Scheduled {(!scheduledAt || !scheduledTime) && '(select date & time)'}
            </option>
            <option value="published">Publish Now</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            <Eye size={18} />
            {showPreview ? 'Hide' : 'Show'} Preview
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!content.trim() || createPost.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {status === 'scheduled' || (scheduledAt && scheduledTime) ? (
                <>
                  <Calendar size={18} />
                  Schedule
                </>
              ) : status === 'published' ? (
                <>
                  <Send size={18} />
                  Publish Now
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Draft
                </>
              )}
            </button>
          </div>
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Preview</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <div className="flex gap-2">
                {selectedPlatforms.map(platformId => {
                  const account = socialAccounts.find(acc => acc.id === platformId);
                  if (!account) return null;
                  const Icon = PLATFORM_ICONS[account.platform] || FileText;
                  return (
                    <div key={platformId} className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-gray-200">
                      <Icon size={16} />
                      <span className="text-xs">{account.handle}</span>
                    </div>
                  );
                })}
              </div>
              <p className="text-gray-900 whitespace-pre-wrap">{content || 'Your post content will appear here...'}</p>
              {mediaPreviews.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {mediaPreviews.map((preview, index) => (
                    <img key={index} src={preview} alt={`Preview ${index + 1}`} className="w-full h-32 object-cover rounded-md" />
                  ))}
                </div>
              )}
              {scheduledAt && scheduledTime && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock size={16} />
                  Scheduled for {new Date(`${scheduledAt}T${scheduledTime}`).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

// Post Card Component
function PostCard({ post, teamId }: { post: Post; teamId: string }) {
  const queryClient = useQueryClient();

  const deletePost = useMutation({
    mutationFn: async () => {
      await api.delete(`/teams/${teamId}/posts/${post.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', teamId] });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(post.status)}`}>
          {post.status}
        </span>
        <button
          onClick={() => deletePost.mutate()}
          className="text-gray-400 hover:text-red-600 transition-colors"
        >
          <X size={18} />
        </button>
      </div>
      
      <p className="text-gray-900 text-sm mb-3 line-clamp-3">{post.contentText}</p>
      
      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <div className="mb-3">
          <img src={post.mediaUrls[0]} alt="Post media" className="w-full h-32 object-cover rounded-md" />
        </div>
      )}
      
      {post.platforms && post.platforms.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {post.platforms.map((platform, index) => {
            const Icon = PLATFORM_ICONS[platform.socialAccount.platform] || FileText;
            return (
              <div key={index} className="flex items-center gap-1 text-xs text-gray-600">
                <Icon size={14} />
                <span>{platform.socialAccount.handle}</span>
              </div>
            );
          })}
        </div>
      )}
      
      <div className="flex items-center justify-between text-xs text-gray-500">
        {post.scheduledAt ? (
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            {new Date(post.scheduledAt).toLocaleString()}
          </div>
        ) : post.publishedAt ? (
          <div className="flex items-center gap-1">
            <Send size={14} />
            {new Date(post.publishedAt).toLocaleString()}
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <Clock size={14} />
            {new Date(post.createdAt).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
}
