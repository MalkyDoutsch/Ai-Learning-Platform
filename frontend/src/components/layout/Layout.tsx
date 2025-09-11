import React from 'react';
import { Link } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">AI Learning Platform</h1>
          <div className="space-x-4">
            <Link to="/" className="hover:underline">Home</Link>
            <Link to="/categories" className="hover:underline">Categories</Link>
            <Link to="/generate" className="hover:underline">Generate Lesson</Link>
            <Link to="/history" className="hover:underline">History</Link>
          </div>
        </div>
      </nav>
      <main className="container mx-auto p-4">
        {children}
      </main>
    </div>
  );
};

export default Layout;