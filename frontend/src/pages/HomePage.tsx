import React, { useState } from 'react';
import { userApi } from '../services/api';
import { CreateUserData, User } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState<CreateUserData>({
    name: '',
    phone: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [registeredUser, setRegisteredUser] = useState<User | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAlert(null);

    try {
      // Basic validation
      if (!formData.name.trim()) {
        throw new Error('Name is required');
      }
      if (!formData.phone.trim()) {
        throw new Error('Phone number is required');
      }

      const user = await userApi.createUser(formData);
      setRegisteredUser(user);
      setAlert({
        type: 'success',
        message: `User "${user.name}" registered successfully! You can now start learning.`
      });
      
      // Reset form
      setFormData({ name: '', phone: '' });
    } catch (error: any) {
      setAlert({
        type: 'error',
        message: error.response?.data?.detail || error.message || 'Failed to register user'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewRegistration = () => {
    setRegisteredUser(null);
    setAlert(null);
  };

  return (
    <div className="max-w-md mx-auto animate-fade-in">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">👤</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Register New User
          </h1>
          <p className="text-gray-600">
            Create your account to start your learning journey
          </p>
        </div>

        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        {registeredUser ? (
          <div className="text-center animate-slide-up">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <div className="text-3xl mb-4">🎉</div>
              <h2 className="text-xl font-semibold text-green-800 mb-2">
                Registration Successful!
              </h2>
              <div className="text-green-700">
                <p><strong>Name:</strong> {registeredUser.name}</p>
                <p><strong>Phone:</strong> {registeredUser.phone}</p>
                <p><strong>User ID:</strong> {registeredUser.id}</p>
              </div>
            </div>
            
            <div className="flex flex-col space-y-3">
              <button
                onClick={handleNewRegistration}
                className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-200"
              >
                Register Another User
              </button>
              <a
                href="/learn"
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200 inline-block"
              >
                Start Learning
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                placeholder="+1234567890"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Include country code (e.g., +972501234567)
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="small" />
                  <span className="ml-2">Registering...</span>
                </>
              ) : (
                'Register User'
              )}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <a href="/learn" className="text-primary-600 hover:text-primary-700 font-medium">
              Start Learning
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;


