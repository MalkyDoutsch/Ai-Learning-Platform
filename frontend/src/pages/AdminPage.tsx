import React, { useState, useEffect } from 'react';
import { userApi, promptApi } from '../services/api';
import { User, Prompt } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';

const AdminPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [allPrompts, setAllPrompts] = useState<Prompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [alert, setAlert] = useState<{
    type: 'success' | 'error' | 'warning';
    message: string;
  } | null>(null);
  const [filterUserId, setFilterUserId] = useState<string>('');

  useEffect(() => {
    loadAdminData();
  }, []);

  useEffect(() => {
    loadPrompts();
  }, [filterUserId]);

  const loadAdminData = async () => {
    try {
      const usersData = await userApi.getUsers();
      setUsers(usersData);
      await loadPrompts();
    } catch (error) {
      console.error('Error loading admin data:', error);
      setAlert({
        type: 'error',
        message: 'Failed to load admin data. Please refresh the page.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadPrompts = async () => {
    try {
      const userId = filterUserId ? parseInt(filterUserId) : undefined;
      const promptsData = await promptApi.getAllPrompts(userId);
      setAllPrompts(promptsData);
    } catch (error) {
      console.error('Error loading prompts:', error);
      setAlert({
        type: 'error',
        message: 'Failed to load prompts'
      });
    }
  };

  const handleDeleteUser = async (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete user "${user.name}"? This will also delete all their learning history.`
    );

    if (confirmDelete) {
      try {
        await userApi.deleteUser(userId);
        setUsers(users.filter(u => u.id !== userId));
        setAllPrompts(allPrompts.filter(p => p.user_id !== userId));
        setAlert({
          type: 'success',
          message: `User "${user.name}" has been deleted successfully`
        });
      } catch (error) {
        console.error('Error deleting user:', error);
        setAlert({
          type: 'error',
          message: 'Failed to delete user'
        });
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getTotalStats = () => {
    return {
      totalUsers: users.length,
      totalPrompts: allPrompts.length,
      completedPrompts: allPrompts.filter(p => p.response).length,
      pendingPrompts: allPrompts.filter(p => !p.response).length,
      categoriesUsed: new Set(allPrompts.map(p => p.category_name)).size,
      topCategory: getMostUsedCategory()
    };
  };

  const getMostUsedCategory = () => {
    const categoryCount: { [key: string]: number } = {};
    allPrompts.forEach(p => {
      if (p.category_name) {
        categoryCount[p.category_name] = (categoryCount[p.category_name] || 0) + 1;
      }
    });
    
    const mostUsed = Object.entries(categoryCount).sort(([,a], [,b]) => b - a)[0];
    return mostUsed ? `${mostUsed[0]} (${mostUsed[1]})` : 'None';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner size="large" text="Loading admin dashboard..." />
      </div>
    );
  }

  const stats = getTotalStats();

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center">
          <span className="mr-3">⚙️</span>
          Admin Dashboard
        </h1>
        <p className="text-xl text-gray-600">
          Manage users and monitor learning activity across the platform
        </p>
      </div>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Statistics Overview */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-primary-600">{stats.totalUsers}</div>
          <p className="text-sm text-gray-600">Total Users</p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.totalPrompts}</div>
          <p className="text-sm text-gray-600">Total Lessons</p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.completedPrompts}</div>
          <p className="text-sm text-gray-600">Completed</p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.pendingPrompts}</div>
          <p className="text-sm text-gray-600">Pending</p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.categoriesUsed}</div>
          <p className="text-sm text-gray-600">Categories Used</p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-4 text-center">
          <div className="text-xs font-bold text-gray-800">{stats.topCategory}</div>
          <p className="text-sm text-gray-600">Top Category</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Users Management */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">👥</span>
            Users Management
          </h2>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {users.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">👤</div>
                <p>No users registered yet</p>
              </div>
            ) : (
              users.map(user => (
                <div
                  key={user.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{user.name}</h3>
                      <p className="text-sm text-gray-600">📱 {user.phone}</p>
                      <p className="text-sm text-gray-600">
                        🗓️ Joined: {formatDate(user.created_at)}
                      </p>
                      <p className="text-sm text-gray-600">
                        📚 Lessons: {user.prompt_count || 0}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium p-1"
                      title="Delete user"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <a
              href="/register"
              className="block w-full text-center bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors duration-200"
            >
              + Add New User
            </a>
          </div>
        </div>

        {/* Prompts Management */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <span className="mr-2">📝</span>
              Learning Activity
            </h2>
            <select
              value={filterUserId}
              onChange={(e) => setFilterUserId(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="">All Users</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {allPrompts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📭</div>
                <p>No learning sessions found</p>
              </div>
            ) : (
              allPrompts.map(prompt => (
                <div
                  key={prompt.id}
                  onClick={() => setSelectedPrompt(prompt)}
                  className={`border rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedPrompt?.id === prompt.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-xs text-gray-500">
                      {formatDate(prompt.created_at)}
                    </div>
                    {prompt.response ? (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        ✅ Complete
                      </span>
                    ) : (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        ⏳ Pending
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    👤 {prompt.user_name}
                  </p>
                  <p className="text-sm text-primary-600 mb-1">
                    📚 {prompt.category_name} → {prompt.sub_category_name}
                  </p>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {prompt.prompt}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Prompt Details */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">🔍</span>
            Session Details
          </h2>

          {!selectedPrompt ? (
            <div className="text-center py-16 text-gray-500">
              <div className="text-6xl mb-4">📄</div>
              <p className="text-lg">Select a session to view details</p>
              <p className="text-sm">Click on any learning session from the activity list</p>
            </div>
          ) : (
            <div className="animate-slide-up">
              {/* Session Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Session #{selectedPrompt.id}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {formatDate(selectedPrompt.created_at)}
                    </p>
                  </div>
                  {selectedPrompt.response ? (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                      ✅ Complete
                    </span>
                  ) : (
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                      ⏳ Processing
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-2 text-sm">
                  <p><strong>User:</strong> {selectedPrompt.user_name}</p>
                  <p><strong>Category:</strong> {selectedPrompt.category_name}</p>
                  <p><strong>Sub-category:</strong> {selectedPrompt.sub_category_name}</p>
                </div>
              </div>

              {/* User's Question */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">User's Question:</h4>
                <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
                  {selectedPrompt.prompt}
                </div>
              </div>

              {/* AI Response */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">AI Response:</h4>
                {selectedPrompt.response ? (
                  <div className="bg-green-50 border border-green-200 rounded p-3 text-sm max-h-64 overflow-y-auto">
                    <div className="whitespace-pre-wrap">
                      {selectedPrompt.response}
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-4 text-center">
                    <LoadingSpinner size="small" />
                    <p className="text-sm text-yellow-600 mt-2">
                      Response being generated...
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `User: ${selectedPrompt.user_name}\nTopic: ${selectedPrompt.category_name} → ${selectedPrompt.sub_category_name}\nQuestion: ${selectedPrompt.prompt}\nResponse: ${selectedPrompt.response || 'Pending...'}`
                    );
                    setAlert({
                      type: 'success',
                      message: 'Session details copied to clipboard!'
                    });
                  }}
                  className="text-sm bg-primary-600 text-white px-3 py-1 rounded hover:bg-primary-700 transition-colors duration-200"
                >
                  📋 Copy Details
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity Summary */}
      <div className="mt-8 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Platform Overview</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Recent Activity</h3>
            <ul className="text-gray-300 space-y-1">
              <li>• {stats.totalPrompts} total learning sessions created</li>
              <li>• {stats.completedPrompts} lessons successfully generated</li>
              <li>• {stats.categoriesUsed} different learning categories explored</li>
              <li>• {stats.totalUsers} active users on the platform</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <a
                href="/register"
                className="block bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 transition-colors duration-200 text-center"
              >
                + Register New User
              </a>
              <a
                href="/learn"
                className="block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors duration-200 text-center"
              >
                🚀 Create Learning Session
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;