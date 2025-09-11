// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Layout from './components/layout/Layout';
// import Home from './pages/Home';
// import Categories from './pages/Categories';
// import LessonGeneration from './pages/LessonGeneration';
// import LearningHistory from './pages/LearningHistory';
// import './styles/globals.css';

// function App() {
//   return (
//     <Router>
//       <Layout>
//         <Routes>
//           <Route path="/" element={<Home />} />
//           <Route path="/categories" element={<Categories />} />
//           <Route path="/generate" element={<LessonGeneration />} />
//           <Route path="/history" element={<LearningHistory />} />
//         </Routes>
//       </Layout>
//     </Router>
//   );
// }

// export default App;

//////////////////////////////////////////////////////////////////////////////////////
// import React from 'react';

function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>AI Learning Platform</h1>
      <p>Welcome! Your app is working.</p>
      
      <div style={{ marginTop: '20px' }}>
        <button style={{ 
          padding: '10px 20px', 
          backgroundColor: '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px',
          cursor: 'pointer'
        }}>
          Test Button
        </button>
      </div>
    </div>
  );
}

export default App;