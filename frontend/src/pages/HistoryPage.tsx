import React, { useState, useEffect } from 'react';
import { userApi, promptApi } from '../services/api';
import { User, Prompt } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';

const HistoryPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(false);
  const [alert, setAlert] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      loadUserPrompts(parseInt(selectedUserId));
    } else {
      setPrompts([]);
      setSelectedPrompt(null);
    }
  }, [selectedUserId]);

  const loadUsers = async () => {
    try {
      const usersData = await userApi.getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
      setAlert({
        type: 'error',
        message: 'Failed to load users. Please refresh the page.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserPrompts = async (userId: number) => {
    setIsLoadingPrompts(true);
    try {
      const promptsData = await promptApi.getUserPrompts(userId);
      setPrompts(promptsData);
      setSelectedPrompt(null);
    } catch (error) {
      console.error('Error loading prompts:', error);
      setAlert({
        type: 'error',
        message: 'Failed to load learning history'
      });
    } finally {
      setIsLoadingPrompts(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const selectedUser = users.find(u => u.id === parseInt(selectedUserId));

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner size="large" text="Loading learning history..." />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center">
          <span className="mr-3">📜</span>
          Learning History
        </h1>
        <p className="text-xl text-gray-600">
          Review your past learning sessions and AI-generated lessons
        </p>
      </div>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* User Selection & Prompt List */}
        <div className="lg:col-span-1 space-y-6">
          {/* User Selection */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Select User
            </h2>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Choose a user...</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.prompt_count || 0} lessons)
                </option>
              ))}
            </select>
            
            {selectedUser && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900">{selectedUser.name}</h3>
                <p className="text-sm text-gray-600">Phone: {selectedUser.phone}</p>
                <p className="text-sm text-gray-600">
                  Joined: {formatDate(selectedUser.created_at)}
                </p>
                <p className="text-sm text-gray-600">
                  Total Lessons: {selectedUser.prompt_count || 0}
                </p>
              </div>
            )}
          </div>

          {/* Prompts List */}
          {selectedUserId && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Learning Sessions
              </h2>
              
              {isLoadingPrompts ? (
                <div className="text-center py-8">
                  <LoadingSpinner size="medium" text="Loading sessions..." />
                </div>
              ) : prompts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📭</div>
                  <p>No learning sessions found</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {prompts.map(prompt => (
                    <div
                      key={prompt.id}
                      onClick={() => setSelectedPrompt(prompt)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedPrompt?.id === prompt.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-gray-500">
                          {formatDate(prompt.created_at)}
                        </span>
                        {prompt.response ? (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            ✓ Complete
                          </span>
                        ) : (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                            ⏳ Processing
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        {prompt.category_name} → {prompt.sub_category_name}
                      </p>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {prompt.prompt}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Prompt Details */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-6 min-h-96">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Lesson Details
            </h2>

            {!selectedPrompt ? (
              <div className="text-center py-16 text-gray-500">
                <div className="text-6xl mb-4">📖</div>
                <p className="text-lg">Select a learning session to view details</p>
                <p className="text-sm">Choose a user and click on any session from the list</p>
              </div>
            ) : (
              <div className="animate-slide-up">
                {/* Session Info */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {selectedPrompt.category_name} → {selectedPrompt.sub_category_name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {formatDate(selectedPrompt.created_at)}
                      </p>
                    </div>
                    {selectedPrompt.response ? (
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                        ✅ Complete
                      </span>
                    ) : (
                      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                        ⏳ Processing
                      </span>
                    )}
                  </div>
                  
                  <div className="border-t border-gray-200 pt-3">
                    <h4 className="font-medium text-gray-900 mb-2">Your Question:</h4>
                    <p className="text-gray-800 bg-white p-3 rounded border">
                      {selectedPrompt.prompt}
                    </p>
                  </div>
                </div>

                {/* AI Response */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <span className="mr-2">🤖</span>
                    AI Lesson:
                  </h4>
                  
                  {selectedPrompt.response ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="prose max-w-none text-sm leading-relaxed whitespace-pre-wrap">
                        {selectedPrompt.response}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <LoadingSpinner size="medium" text="AI is still generating the lesson..." />
                      <p className="text-sm text-yellow-600 mt-4">
                        This lesson is being processed. Check back in a few moments.
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {selectedPrompt.response && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(selectedPrompt.response || '');
                          setAlert({
                            type: 'success',
                            message: 'Lesson copied to clipboard!'
                          });
                        }}
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200"
                      >
                        📋 Copy Lesson
                      </button>
                      <a
                        href="/learn"
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
                      >
                        🚀 Learn More
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Statistics */}
      {selectedUser && prompts.length > 0 && (
        <div className="mt-8 bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Learning Statistics</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{prompts.length}</div>
              <p className="text-primary-100">Total Sessions</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">
                {prompts.filter(p => p.response).length}
              </div>
              <p className="text-primary-100">Completed</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">
                {new Set(prompts.map(p => p.category_name)).size}
              </div>
              <p className="text-primary-100">Categories</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">
                {new Set(prompts.map(p => p.sub_category_name)).size}
              </div>
              <p className="text-primary-100">Topics</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;