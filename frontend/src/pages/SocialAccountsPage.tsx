import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'react-router-dom';
import api from '@/services/api';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin, 
  Youtube, 
  Music,
  Check,
  X,
  AlertCircle,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface SocialAccount {
  id: string;
  platform: string;
  platformUserId: string;
  handle: string;
  isActive: boolean;
  connectedAt: string;
  expiresAt?: string;
}

const PLATFORMS = [
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'bg-blue-600', enabled: true },
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'bg-gradient-to-r from-purple-500 to-pink-500', enabled: true },
  { id: 'twitter', name: 'Twitter (X)', icon: Twitter, color: 'bg-black', enabled: false },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'bg-blue-700', enabled: false },
  { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'bg-red-600', enabled: false },
  { id: 'tiktok', name: 'TikTok', icon: Music, color: 'bg-black', enabled: false },
];

export default function SocialAccountsPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(teamId || null);

  // Get teams to allow selection
  const { data: teams } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const response = await api.get('/teams');
      return response.data;
    },
  });

  // Set default team if available
  useEffect(() => {
    if (!selectedTeamId && teams && teams.length > 0) {
      setSelectedTeamId(teams[0].id);
    }
  }, [teams, selectedTeamId]);

  // Get connected accounts
  const { data: accounts } = useQuery({
    queryKey: ['social-accounts', selectedTeamId],
    queryFn: async () => {
      if (!selectedTeamId) return [];
      const response = await api.get(`/teams/${selectedTeamId}/social-accounts`);
      return response.data;
    },
    enabled: !!selectedTeamId,
  });

  // Check OAuth callback result
  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    const accountId = searchParams.get('accountId');

    if (success && accountId) {
      queryClient.invalidateQueries({ queryKey: ['social-accounts'] });
      // Show success message (you can add toast notification here)
      alert('Account connected successfully!');
    } else if (error) {
      alert(`Connection failed: ${decodeURIComponent(error)}`);
    }
  }, [searchParams, queryClient]);

  // Connect account mutation
  const connectAccount = useMutation({
    mutationFn: async (platform: string) => {
      if (!selectedTeamId) throw new Error('Please select a team');
      
      // Get OAuth URL
      const response = await api.get(`/oauth/meta/${platform}/authorize`, {
        params: { teamId: selectedTeamId },
      });
      
      // Redirect to OAuth URL
      window.location.href = response.data.authUrl;
    },
  });

  // Disconnect account mutation
  const disconnectAccount = useMutation({
    mutationFn: async (accountId: string) => {
      if (!selectedTeamId) throw new Error('Please select a team');
      await api.delete(`/teams/${selectedTeamId}/social-accounts/${accountId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-accounts', selectedTeamId] });
    },
  });

  const getConnectedAccount = (platformId: string): SocialAccount | undefined => {
    return accounts?.find((acc: SocialAccount) => acc.platform === platformId && acc.isActive);
  };

  const isTokenExpired = (expiresAt?: string): boolean => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  if (!selectedTeamId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Team Selected</h3>
          <p className="mt-1 text-sm text-gray-500">Please select a team to manage social accounts</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Social Accounts</h1>
        <p className="text-gray-600 mt-2">Connect your social media accounts to start publishing</p>
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
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Connected Accounts Summary */}
      {accounts && accounts.length > 0 && (
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Connected Accounts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((account: SocialAccount) => {
              const platform = PLATFORMS.find((p) => p.id === account.platform);
              const Icon = platform?.icon || Facebook;
              const expired = isTokenExpired(account.expiresAt);

              return (
                <div
                  key={account.id}
                  className="border rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded ${platform?.color || 'bg-gray-600'}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{platform?.name || account.platform}</p>
                      <p className="text-sm text-gray-500">@{account.handle}</p>
                      {expired && (
                        <p className="text-xs text-red-600 mt-1">Token expired</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => disconnectAccount.mutate(account.id)}
                    disabled={disconnectAccount.isPending}
                    className="text-red-600 hover:text-red-700 disabled:opacity-50"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Platform Connection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PLATFORMS.map((platform) => {
          const Icon = platform.icon;
          const connectedAccount = getConnectedAccount(platform.id);
          const isConnected = !!connectedAccount;
          const expired = isConnected && isTokenExpired(connectedAccount?.expiresAt);

          return (
            <div
              key={platform.id}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${platform.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  {isConnected && (
                    <span className="flex items-center text-green-600 text-sm font-medium">
                      <Check className="h-4 w-4 mr-1" />
                      Connected
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">{platform.name}</h3>

                {isConnected && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">@{connectedAccount.handle}</p>
                    {expired && (
                      <p className="text-xs text-red-600 mt-1">⚠️ Token expired - reconnect needed</p>
                    )}
                  </div>
                )}

                <button
                  onClick={() => {
                    if (isConnected) {
                      disconnectAccount.mutate(connectedAccount.id);
                    } else if (platform.enabled) {
                      connectAccount.mutate(platform.id);
                    }
                  }}
                  disabled={
                    connectAccount.isPending ||
                    disconnectAccount.isPending ||
                    (!platform.enabled && !isConnected)
                  }
                  className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                    isConnected
                      ? 'bg-red-50 text-red-700 hover:bg-red-100'
                      : platform.enabled
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
                >
                  {connectAccount.isPending || disconnectAccount.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {isConnected ? 'Disconnecting...' : 'Connecting...'}
                    </>
                  ) : isConnected ? (
                    'Disconnect'
                  ) : platform.enabled ? (
                    <>
                      Connect <ExternalLink className="h-4 w-4 ml-2" />
                    </>
                  ) : (
                    'Coming Soon'
                  )}
                </button>

                {!platform.enabled && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    OAuth integration coming soon
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

