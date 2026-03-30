// const Loader = () => {
//   return(
  import React, { useEffect, useState } from 'react';

  interface ProgressBarProps {
    duration: number; // in milliseconds
  }
  
  const Loader: React.FC<ProgressBarProps> = ({ duration = 15000 }) => {
    const [progress, setProgress] = useState(0);
  
    useEffect(() => {
      const step = 100 / (duration / 50); // update every 50ms
      const interval = setInterval(() => {
        setProgress((prev) => {
          const next = prev + step;
          return next >= 90 ? 90 : next;
        });
      }, 50);
      return () => clearInterval(interval);
    }, [duration]);   
    useEffect(()=>{
      setProgress(0);
    },[])
    return (
    <div className="w-full h-6 bg-gray-200 rounded-xl overflow-hidden relative shadow-inner">
      <div
        className="h-full bg-blue-500 transition-all duration-100 ease-linear"
        style={{ width: `${progress}%` }}
      />
      <div className="absolute left-50 top-1 text-black inset-0 flex items-end justify-center pb-1 text-white text-sm font-medium">
        {Math.round(progress)}%
      </div>
    </div>  
  )
}

export default Loader;