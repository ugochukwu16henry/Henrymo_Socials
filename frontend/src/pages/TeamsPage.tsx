import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { Plus, Users } from 'lucide-react';
import { useState } from 'react';

export default function TeamsPage() {
  const queryClient = useQueryClient();
  const { data: teams, isLoading, error } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      try {
        const response = await api.get('/teams');
        console.log('Teams API response:', response);
        console.log('Teams API response.data:', response.data);
        console.log('Teams API response.data type:', typeof response.data);
        console.log('Teams API response.data is array:', Array.isArray(response.data));
        
        // Ensure we return an array
        const teamsData = response.data;
        if (Array.isArray(teamsData)) {
          return teamsData;
        } else {
          console.warn('API response is not an array, returning empty array');
          return [];
        }
      } catch (err: any) {
        console.error('Error fetching teams:', err);
        console.error('Error response:', err.response);
        throw err;
      }
    },
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Debug logs
  console.log('=== TeamsPage Debug ===');
  console.log('teams data:', teams);
  console.log('teams type:', typeof teams);
  console.log('teams is array:', Array.isArray(teams));
  console.log('teams length:', teams?.length);
  console.log('isLoading:', isLoading);
  console.log('error:', error);
  
  // Verify teams structure
  if (teams && !Array.isArray(teams)) {
    console.warn('WARNING: teams is not an array!', teams);
  }

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsCreating(true);
    
    try {
      const response = await api.post('/teams', { name: teamName });
      console.log('Team created successfully:', response.data);
      setTeamName('');
      setShowCreateModal(false);
      // Invalidate teams query cache so all pages using it will refetch
      await queryClient.invalidateQueries({ queryKey: ['teams'] });
      // Also refetch to ensure we have the latest data
      await queryClient.refetchQueries({ queryKey: ['teams'] });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create team. Please try again.';
      setError(errorMessage);
      console.error('Failed to create team:', err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teams</h1>
          <p className="text-gray-600 mt-2">Manage your teams and collaborators</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={20} />
          <span>Create Team</span>
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">
            Error loading teams: {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">Loading teams...</p>
        </div>
      )}

      {/* Teams List */}
      {!isLoading && !error && teams && teams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team: any) => (
            <div key={team.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Users className="text-primary-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{team.name}</h3>
                  <p className="text-sm text-gray-500 capitalize">{team.planTier} Plan</p>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <p>{team.members?.length || 0} member(s)</p>
              </div>
            </div>
          ))}
        </div>
      ) : !isLoading && !error ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Users className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No teams yet</h3>
          <p className="text-gray-600 mb-4">Create your first team to get started</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Create Team
          </button>
        </div>
      ) : null}

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Create New Team</h2>
            <form onSubmit={handleCreateTeam}>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
              <div className="mb-4">
                <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 mb-1">
                  Team Name
                </label>
                <input
                  type="text"
                  id="teamName"
                  value={teamName}
                  onChange={(e) => {
                    setTeamName(e.target.value);
                    setError(null);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter team name"
                  required
                  disabled={isCreating}
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setTeamName('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

