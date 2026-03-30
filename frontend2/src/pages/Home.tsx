import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Image, Video, Mic, Shield } from 'lucide-react';

const Home = () => {
  const features = [
    {
      path: '/text',
      icon: FileText,
      title: 'Text Analysis',
      description: 'Verify text content and URLs for factual accuracy',
      lightColor: 'text-blue-500 group-hover:text-blue-600',
      darkColor: 'dark:text-blue-400 dark:group-hover:text-blue-300',
      bgLight: 'group-hover:bg-blue-50',
      bgDark: 'dark:group-hover:bg-blue-900/20'
    },
    {
      path: '/image',
      icon: Image,
      title: 'Image Verification',
      description: 'Detect AI-generated images and verify image content',
      lightColor: 'text-purple-500 group-hover:text-purple-600',
      darkColor: 'dark:text-purple-400 dark:group-hover:text-purple-300',
      bgLight: 'group-hover:bg-purple-50',
      bgDark: 'dark:group-hover:bg-purple-900/20'
    },
    {
      path: '/video',
      icon: Video,
      title: 'Video Authentication',
      description: 'Identify deepfake videos and verify authenticity',
      lightColor: 'text-red-500 group-hover:text-red-600',
      darkColor: 'dark:text-red-400 dark:group-hover:text-red-300',
      bgLight: 'group-hover:bg-red-50',
      bgDark: 'dark:group-hover:bg-red-900/20'
    },
    {
      path: '/audio',
      icon: Mic,
      title: 'Audio Fact-Check',
      description: 'Transcribe and verify audio content accuracy',
      lightColor: 'text-amber-500 group-hover:text-amber-600',
      darkColor: 'dark:text-amber-400 dark:group-hover:text-amber-300',
      bgLight: 'group-hover:bg-amber-50',
      bgDark: 'dark:group-hover:bg-amber-900/20'
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <Shield className="w-20 h-20 text-emerald-500 dark:text-emerald-400 animate-pulse" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Factiy.ai
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Your advanced truth verification platform. Analyze text, images, videos, and audio
            to separate fact from fiction using cutting-edge AI technology.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <Link
              key={feature.path}
              to={feature.path}
              className={`group bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl 
                transition-all duration-300 transform hover:-translate-y-1 ${feature.bgLight} ${feature.bgDark}`}
            >
              <div className="flex flex-col items-center text-center">
                <feature.icon 
                  className={`w-12 h-12 mb-4 transition-all duration-300 transform group-hover:scale-110 
                    ${feature.lightColor} ${feature.darkColor}`} 
                />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;