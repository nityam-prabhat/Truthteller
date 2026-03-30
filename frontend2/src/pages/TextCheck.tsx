import React, { useState } from 'react';
import { Link2, Type, ThumbsUp, ThumbsDown } from 'lucide-react';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import {ResultCard} from '../components/ResultCard';

const TextCheck = () => {
  const [inputType, setInputType] = useState<'manual' | 'url'>('manual');
  const [input, setInput] = useState('');
  const [resultList, setResultList] = useState<[]>([]);
  const [isLoading, setIsLoading] = useState(false);


  const handleSubmit = async () => {
    setIsLoading(true);
    setResultList([])
    // Step 1: POST input to start processing
    const response = await fetch("http://localhost:5000/text/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: input, textType: inputType }),
    });
  
    if (!response.ok) {
      throw new Error("Failed to submit input");
    }
  
    const { job_id } = await response.json();
  
    // Step 2: Open SSE to stream results
    const eventSource = new EventSource(`http://localhost:5000/text/stream/${job_id}`);
  
    eventSource.onmessage = (event) => {
      const updatedResults: [] = JSON.parse(event.data);
      setResultList(updatedResults); // This re-renders with new array
      console.log(updatedResults)
    };
  
    eventSource.onerror = (err) => {
      console.error("SSE error:", err);
      eventSource.close();
      setIsLoading(false);
    };
  };
  


  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Input Type Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Input Type</h2>
          <div className="space-y-4">
            <button
              className={`flex items-center space-x-2 w-full p-3 rounded-lg transition ${inputType === 'manual'
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              onClick={() => setInputType('manual')}
            >
              <Type className="w-5 h-5" />
              <span>Manual Text Input</span>
            </button>
            <button
              className={`flex items-center space-x-2 w-full p-3 rounded-lg transition ${inputType === 'url'
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              onClick={() => setInputType('url')}
            >
              <Link2 className="w-5 h-5" />
              <span>URL Input</span>
            </button>
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">
            {inputType === 'manual' ? 'Enter Text' : 'Enter URL'}
          </h2>
          {inputType === 'manual' ? (
            <textarea
              className="w-full h-48 p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              placeholder="Enter text to fact check (one claim per line)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          ) : (
            <input
              type="url"
              className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              placeholder="Enter URL to fact check"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          )}
          <button
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            onClick={handleSubmit}
          >
            Check Facts
          </button>
        </div>

        {/* Results Area */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Results</h2>
          <div className="space-y-4">
            {resultList && resultList.map((result, index) => (
              <div className='flex flex-col'>
                <ResultCard results={result} key={index}/>
              </div>
            ))}
            {isLoading && <Loader duration={15000}/>} 
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextCheck;