import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  const { isLoggedIn, user } = useAuth();

  const features = [
    {
      icon: '🔐',
      title: 'Secure Authentication',
      description: 'JWT-based authentication with password protection'
    },
    {
      icon: '📚',
      title: 'Learning Categories',
      description: 'Organized learning topics and subtopics'
    },
    {
      icon: '🤖',
      title: 'AI-Generated Lessons',
      description: 'Personalized lessons powered by AI'
    },
    {
      icon: '📈',
      title: 'Learning History',
      description: 'Track progress and revisit lessons'
    }
  ];

  const getQuickActions = () => {
    if (isLoggedIn) {
      return [
        {
          title: 'Start Learning',
          description: 'Begin your AI-powered learning journey',
          link: '/learn',
          icon: '🚀',
          color: 'bg-primary-500 hover:bg-primary-600'
        },
        {
          title: 'View History',
          description: 'Check your learning progress',
          link: '/history',
          icon: '📜',
          color: 'bg-purple-500 hover:bg-purple-600'
        },
        ...(user?.is_admin ? [{
          title: 'Admin Dashboard',
          description: 'Manage users and platform',
          link: '/admin',
          icon: '⚙️',
          color: 'bg-red-500 hover:bg-red-600'
        }] : [])
      ];
    } else {
      return [
        {
          title: 'Sign In',
          description: 'Access your learning account',
          link: '/login',
          icon: '🔑',
          color: 'bg-primary-500 hover:bg-primary-600'
        },
        {
          title: 'Create Account',
          description: 'Start your learning journey today',
          link: '/register',
          icon: '✨',
          color: 'bg-green-500 hover:bg-green-600'
        }
      ];
    }
  };

  const quickActions = getQuickActions();

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Welcome to AI Learning Platform
        </h1>
        {isLoggedIn ? (
          <div className="mb-6">
            <p className="text-xl text-primary-600 mb-2">
              Welcome back, {user?.full_name}! 👋
            </p>
            <p className="text-lg text-gray-600">
              Ready to continue your learning journey?
            </p>
          </div>
        ) : (
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Discover personalized learning experiences powered by artificial intelligence. 
            Create an account to select topics, ask questions, and receive tailored lessons designed just for you.
          </p>
        )}
        
        <div className="flex justify-center space-x-4">
          {isLoggedIn ? (
            <>
              <Link
                to="/learn"
                className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                Start Learning Now
              </Link>
              <Link
                to="/history"
                className="bg-white text-primary-600 border-2 border-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors duration-200"
              >
                View History
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/register"
                className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                Get Started Free
              </Link>
              <Link
                to="/login"
                className="bg-white text-primary-600 border-2 border-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors duration-200"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          Platform Features
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200 text-center animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          {isLoggedIn ? 'Quick Actions' : 'Get Started'}
        </h2>
        <div className={`grid ${quickActions.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-8 max-w-4xl mx-auto`}>
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className={`${action.color} text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 animate-slide-up`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">{action.icon}</span>
                <h3 className="text-xl font-semibold">{action.title}</h3>
              </div>
              <p className="text-white opacity-90">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">{isLoggedIn ? '1️⃣' : '🔐'}</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {isLoggedIn ? 'Choose Your Topic' : 'Create Account'}
            </h3>
            <p className="text-gray-600">
              {isLoggedIn 
                ? 'Select from various categories and subcategories to focus your learning'
                : 'Sign up with your username and password to get started'
              }
            </p>
          </div>
          <div className="text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">{isLoggedIn ? '2️⃣' : '📚'}</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {isLoggedIn ? 'Ask Your Question' : 'Choose Topics'}
            </h3>
            <p className="text-gray-600">
              {isLoggedIn
                ? 'Submit your learning prompt or question about the topic'
                : 'Browse categories and select what you want to learn about'
              }
            </p>
          </div>
          <div className="text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">{isLoggedIn ? '3️⃣' : '🤖'}</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {isLoggedIn ? 'Get AI Lesson' : 'Learn with AI'}
            </h3>
            <p className="text-gray-600">
              {isLoggedIn
                ? 'Receive a personalized, comprehensive lesson tailored to your request'
                : 'Get personalized AI-generated lessons based on your questions'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-2xl shadow-lg p-8 text-center">
        <h2 className="text-3xl font-bold mb-8">
          {isLoggedIn ? `Welcome Back, ${user?.full_name}!` : 'Join the Learning Revolution'}
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="text-4xl font-bold mb-2">∞</div>
            <p className="text-primary-100">Learning Topics</p>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">🤖</div>
            <p className="text-primary-100">AI-Powered</p>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">🔐</div>
            <p className="text-primary-100">Secure & Protected</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;