import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { BarChart3, Users, FileText, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const { data: teams } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const response = await api.get('/teams');
      return response.data;
    },
  });

  const stats = [
    { name: 'Total Teams', value: teams?.length || 0, icon: Users, color: 'text-blue-600' },
    { name: 'Active Posts', value: '0', icon: FileText, color: 'text-green-600' },
    { name: 'Engagement Rate', value: '0%', icon: TrendingUp, color: 'text-purple-600' },
    { name: 'Total Reach', value: '0', icon: BarChart3, color: 'text-orange-600' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to your social media management hub</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full bg-gray-50 ${stat.color}`}>
                  <Icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-500 text-center py-8">No recent activity. Start by creating a team!</p>
        </div>
      </div>
    </div>
  );
}

