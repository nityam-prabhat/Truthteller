import React, { useState } from 'react';
import { Video, ThumbsUp, ThumbsDown } from 'lucide-react';

interface VideoCheckResult {
  probability: number;
  label: string;
}

const VideoCheck = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [result, setResult] = useState<VideoCheckResult | null>(null);

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setVideoFile(file);
    }
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("video", videoFile?videoFile:"No file");
    const response = await fetch("http://localhost:5000/video", {
      method: "POST",
      body: formData,
    });
    console.log(response)
    if (!response.ok) {
      throw new Error("Failed to fetch results");
    }
    const data: VideoCheckResult = await response.json();
    console.log(data)
    setResult(data);
  };

  const handleFeedback = async (isPositive: boolean) => {
    // Mock feedback API call
    console.log(`Feedback ${isPositive ? 'positive' : 'negative'} for video check`);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Video Upload Area */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Deepfake Detection</h2>
          <div className="space-y-4">
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              className="hidden"
              id="video-upload"
            />
            <label
              htmlFor="video-upload"
              className="block w-full aspect-video border-2 border-dashed rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
            >
              <div className="flex flex-col items-center justify-center h-full">
                {videoUrl ? (
                  <video
                    src={videoUrl}
                    controls
                    className="max-h-full max-w-full"
                  />
                ) : (
                  <>
                    <Video className="w-12 h-12 text-gray-400" />
                    <span className="mt-2 text-sm text-gray-500">
                      Click to upload a video
                    </span>
                  </>
                )}
              </div>
            </label>
            <button
              className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              onClick={handleSubmit}
              disabled={!videoUrl}
            >
              Analyze Video
            </button>
          </div>
        </div>

        {/* Results Area */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Results</h2>
          {result && (
            <div className="space-y-4">
              <div className="border dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Reality Probability</h3>
                <div className="flex items-center mb-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-2 bg-blue-600 rounded-full"
                      style={{ width: `${result.probability}%` }}
                    />
                  </div>
                  <span className="ml-2 text-sm">{result.probability}%</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {result.label}
                </p>
              </div>
              <div className="flex justify-center space-x-4 mt-4">
                <button
                  onClick={() => handleFeedback(true)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                >
                  <ThumbsUp className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleFeedback(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                >
                  <ThumbsDown className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCheck;