import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FileText, Image, Video, Mic, Home } from 'lucide-react';

const Navbar = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const navItems = [
    { 
      path: '/', 
      icon: Home, 
      label: 'Home',
      lightColor: 'text-emerald-500 group-hover:text-emerald-600',
      darkColor: 'dark:text-emerald-400 dark:group-hover:text-emerald-300',
      bgLight: 'hover:bg-emerald-50',
      bgDark: 'dark:hover:bg-emerald-900/20'
    },
    { 
      path: '/text', 
      icon: FileText, 
      label: 'Text Check',
      lightColor: 'text-blue-500 group-hover:text-blue-600',
      darkColor: 'dark:text-blue-400 dark:group-hover:text-blue-300',
      bgLight: 'hover:bg-blue-50',
      bgDark: 'dark:hover:bg-blue-900/20'
    },
    { 
      path: '/image', 
      icon: Image, 
      label: 'Image Check',
      lightColor: 'text-purple-500 group-hover:text-purple-600',
      darkColor: 'dark:text-purple-400 dark:group-hover:text-purple-300',
      bgLight: 'hover:bg-purple-50',
      bgDark: 'dark:hover:bg-purple-900/20'
    },
    { 
      path: '/video', 
      icon: Video, 
      label: 'Video Check',
      lightColor: 'text-red-500 group-hover:text-red-600',
      darkColor: 'dark:text-red-400 dark:group-hover:text-red-300',
      bgLight: 'hover:bg-red-50',
      bgDark: 'dark:hover:bg-red-900/20'
    },
    { 
      path: '/audio', 
      icon: Mic, 
      label: 'Audio Check',
      lightColor: 'text-amber-500 group-hover:text-amber-600',
      darkColor: 'dark:text-amber-400 dark:group-hover:text-amber-300',
      bgLight: 'hover:bg-amber-50',
      bgDark: 'dark:hover:bg-amber-900/20'
    },
  ];

  return (
    <nav
      className="fixed left-0 top-0 h-screen bg-white/80 dark:bg-gray-900/80 backdrop-blur-md transition-all duration-300 z-40 border-r border-gray-200 dark:border-gray-700"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      style={{ width: isExpanded ? '16rem' : '4rem' }}
    >
      <div className="flex flex-col h-full py-8">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
          >
            {({ isActive }) => (
              <div
                className={`group flex items-center px-4 py-3 transition-all duration-300 ${
                  isActive
                    ? `bg-gray-100 dark:bg-gray-800`
                    : `${item.bgLight} ${item.bgDark}`
                }`}
              >
                <div className="min-w-[24px] transition-transform duration-300 group-hover:scale-110">
                  <item.icon 
                    className={`w-6 h-6 transition-all duration-300 ${item.lightColor} ${item.darkColor}`} 
                  />
                </div>
                <span
                  className={`ml-4 whitespace-nowrap transition-all duration-300 ${
                    isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
                  } ${item.lightColor} ${item.darkColor}`}
                >
                  {item.label}
                </span>
              </div>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;