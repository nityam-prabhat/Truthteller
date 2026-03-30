import React, { useState } from 'react';
import { ImageIcon, FileText, ThumbsUp, ThumbsDown } from 'lucide-react';
import Modal from '../components/Modal';
import { ResultCard } from '../components/ResultCard';
import Loader from '../components/Loader';
// interface ImageCheckResult {
//   type: 'ai' | 'fact';
//   line?: string;
//   probability?: number;
//   sources?: string
// }

const ImageCheck = () => {
  const [checkType, setCheckType] = useState<'ai' | 'fact'>('ai');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setFile] = useState<File | null>(null);
  const [resultList, setResultList] = useState<[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  // const [modalData, setModalData] = useState<ImageCheckResult | null>();
  // const [isModalOpen, setModalOpen] = useState<boolean>(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
    }
    setFile(file);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setResultList([])
    const formData = new FormData();
    formData.append("image", imageFile ? imageFile : "No file");
    formData.append("type", checkType);
    const response = await fetch("http://localhost:5000/image", {
      method: "POST",
      body: formData,
    });
    console.log(response)
    if (!response.ok) {
      throw new Error("Failed to fetch results");
    }
    const data = await response.json();
    if (checkType === 'ai') {
      setResultList(data);
      setIsLoading(false);
      console.log(data);
    }
    else {
      const { job_id } = data;
      // Step 2: Open SSE to stream results
      const eventSource = new EventSource(`http://localhost:5000/image/stream/${job_id}`);

      eventSource.onmessage = (event) => {
        const updatedResults: [] = JSON.parse(event.data);
        setResultList(updatedResults); // This re-renders with new array
        console.log(updatedResults)
        setIsLoading(false);
      };

      eventSource.onerror = (err) => {
        console.error("SSE error:", err);
        eventSource.close();
        setIsLoading(false);
      };
    }
  };

  // const viewDetails = (result: ImageCheckResult) => {
  //   setModalOpen(true);
  //   setModalData(result);
  // }

  // const handleFeedback = async (isPositive: boolean) => {
  //   // Mock feedback API call
  //   console.log(`Feedback ${isPositive ? 'positive' : 'negative'} for image check`);
  // };

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Check Type Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Check Type</h2>
          <div className="space-y-4">
            <button
              className={`flex items-center space-x-2 w-full p-3 rounded-lg transition ${checkType === 'ai'
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              onClick={() => { setCheckType('ai'); setResultList([]); }}
            >
              <ImageIcon className="w-5 h-5" />
              <span>AI Generation Check</span>
            </button>
            <button
              className={`flex items-center space-x-2 w-full p-3 rounded-lg transition ${checkType === 'fact'
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              onClick={() => { setCheckType('fact'); setResultList([]); }}
            >
              <FileText className="w-5 h-5" />
              <span>Text Fact Check</span>
            </button>
          </div>
        </div>

        {/* Image Upload Area */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Upload Image</h2>
          <div className="space-y-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="block w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
            >
              <div className="flex flex-col items-center justify-center h-full">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="max-h-full object-contain"
                  />
                ) : (
                  <>
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                    <span className="mt-2 text-sm text-gray-500">
                      Click to upload an image
                    </span>
                  </>
                )}
              </div>
            </label>
            <button
              className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              onClick={handleSubmit}
              disabled={!imageUrl}
            >
              Analyze Image
            </button>
          </div>
        </div>

        {/* Results Area */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Results</h2>
          {resultList && resultList.map((result, index) => (
            <div className='flex flex-col'>
              {checkType === 'ai' ? (
                (index == 0 ? <>
                  <div className="w-full max-w-md mx-auto flip-container">
                    <div className="mb-4">
                      <div
                        className={`inline-flex items-center px-3 py-1 rounded-full text-lg font-medium ${result.label === "real"
                          ? "bg-green-100 text-green-800"
                          : result.label === "dalle"
                            ? "bg-red-100 text-red-800"
                            : "bg-red-100 text-orange-800"
                          }`}
                      >
                        {result.label == "dalle" ? "AI generated" : result.label}
                      </div>
                    </div>
                  </div>
                  <div className="w-full mt-1">
                    <div className="h-2 bg-gray-200 rounded">
                      <div
                        className={`h-2 rounded ${result.label === "real"
                          ? "bg-green-500"
                          : result.label === "dalle"
                            ? "bg-red-500"
                            : "bg-orange-500"
                          }`}
                        style={{ width: `${(result.score * 100).toFixed(2)}%` }}
                      ></div>
                    </div>
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-lg font-medium">
                      {(result.score * 100).toFixed(2)}%
                    </div>      </div>
                </> : <></>)

              ) : <ResultCard results={result} key={index} />}
            </div>
          ))}
          {isLoading && <Loader duration={15000} />}
        </div>
      </div>
    </div>
  );
};

export default ImageCheck;

// {result.length != 0 && (
//   <div className="space-y-4">
//     {Array.isArray(result) && result.map((item: ImageCheckResult, idx: number) =>
//       item.type === "ai" ? (
//         <div key={idx} className="border dark:border-gray-700 rounded-lg p-4">
//           <div className="flex items-center mb-2">
//             <div className="flex-1 h-2 bg-gray-200 rounded-full">
//               <div className="h-2 bg-blue-600 rounded-full" style={{ width: `${item.probability}` }} />
//             </div>
//             <span className="ml-2 text-sm">
//               {item.probability}
//             </span>
//           </div>
//           <div className="flex justify-center space-x-4 mt-4">
//             <button
//               onClick={() => handleFeedback(true)}
//               className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
//             >
//               <ThumbsUp className="w-5 h-5" />
//             </button>
//             <button
//               onClick={() => handleFeedback(false)}
//               className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
//             >
//               <ThumbsDown className="w-5 h-5" />
//             </button>
//           </div>
//         </div>
//       ) : (
//         <div key={idx} className="border dark:border-gray-700 rounded-lg p-4">
//           <p className="mb-2">{item.line}</p>
//           <div className="flex items-center mb-2">
//             <div className="flex-1 h-2 bg-gray-200 rounded-full">
//               <div
//                 className="h-2 bg-blue-600 rounded-full"
//                 style={{ width: `${item.probability}` }}
//               />
//             </div>
//             <span className="ml-2 text-sm">{item.probability}</span>
//           </div>
//           <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
//             <button onClick={() => viewDetails(item)}
//               className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
//             >
//               View Details
//             </button>
//             {isModalOpen && <Modal key={idx} modalData={modalData} closeModal={setModalOpen} />}
//           </div>
//           <div className="flex space-x-2">
//             <button
//               onClick={() => handleFeedback(true)}
//               className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
//             >
//               <ThumbsUp className="w-4 h-4" />
//             </button>
//             <button
//               onClick={() => handleFeedback(false)}
//               className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
//             >
//               <ThumbsDown className="w-4 h-4" />
//             </button>
//           </div>
//         </div>
//       )
//     )}
//   </div>
// )
// }