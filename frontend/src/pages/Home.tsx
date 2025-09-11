import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-8">Welcome to AI Learning Platform</h1>
      <p className="text-xl mb-8">Learn anything with AI-powered lessons</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <Link to="/categories" className="bg-blue-100 p-6 rounded-lg hover:bg-blue-200">
          <h3 className="text-xl font-semibold mb-2">Browse Categories</h3>
          <p>Explore our learning categories</p>
        </Link>
        
        <Link to="/generate" className="bg-green-100 p-6 rounded-lg hover:bg-green-200">
          <h3 className="text-xl font-semibold mb-2">Generate Lesson</h3>
          <p>Create AI-powered lessons</p>
        </Link>
        
        <Link to="/history" className="bg-purple-100 p-6 rounded-lg hover:bg-purple-200">
          <h3 className="text-xl font-semibold mb-2">Learning History</h3>
          <p>View your past lessons</p>
        </Link>
      </div>
    </div>
  );
};

export default Home;