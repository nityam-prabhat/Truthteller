import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import TextCheck from './pages/TextCheck';
import ImageCheck from './pages/ImageCheck';
import VideoCheck from './pages/VideoCheck';
import AudioCheck from './pages/AudioCheck';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <Router>
      <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          </button>
        </div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/*"
            element={
              <>
                <Navbar />
                <div className="pl-16 lg:pl-16 pt-4">
                  <Routes>
                    <Route path="/text" element={<TextCheck />} />
                    <Route path="/image" element={<ImageCheck />} />
                    <Route path="/video" element={<VideoCheck />} />
                    <Route path="/audio" element={<AudioCheck />} />
                  </Routes>
                </div>
              </>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;