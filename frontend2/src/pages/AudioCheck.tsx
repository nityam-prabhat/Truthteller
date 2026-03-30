import React, { useState, useRef } from 'react';
import { Mic, Square, Upload, Link, ThumbsUp, ThumbsDown } from 'lucide-react';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import WavEncoder from "wav-encoder";
import { ResultCard } from '../components/ResultCard';

const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

type AudioInputType = 'voiceover' | 'url' | 'local';

interface AnalysisResult {
  text: string;
  probability: number;
  sources: string[];
}



const AudioCheck = () => {
  const [inputType, setInputType] = useState<AudioInputType>('voiceover');
  const [isRecording, setIsRecording] = useState(false);
  const chunksRef = useRef<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [transcribedText, setTranscribedText] = useState('');

  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [results, setResults] = useState<[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadOptionEnabled, toggleUploadOption] = useState(false);
  const [isRecordOptionEnabled, toggleRecordOption] = useState(true);
  const [isUrlOptionEnabled, toggleUrlOption] = useState(false);


  const [recordedAudioURL, setrecordedAudioURL] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const recognitionRef = useRef<typeof SpeechRecognition | null>(null);

  const startRecording = async () => {
    try {
      setResults([]);
      setTranscribedText('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      // Setup speech recognition
      if (!SpeechRecognition) {
        console.error("SpeechRecognition API not supported in this browser.");
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setTranscribedText(transcript);
      };

      recognition.onerror = (e: any) => console.error("Recognition error", e);

      recognition.start();
      recognitionRef.current = recognition;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        recognition.stop(); // stop transcriber
        const audioBlob = new Blob(chunksRef.current, { type: "audio/wav" });

        const pcmWavFile = await convertToPcmWav(audioBlob);
        setrecordedAudioURL(URL.createObjectURL(pcmWavFile));
        handleAudioAnalysis(pcmWavFile);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const convertToPcmWav = async (audioBlob: Blob) => {
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioContext = new (window.AudioContext || window.AudioContext)();

    // Decode audio data
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // Encode to PCM WAV
    const wavData = await WavEncoder.encode({
      sampleRate: audioBuffer.sampleRate, // Keep original sample rate
      channelData: [audioBuffer.getChannelData(0)], // Use mono (first channel)
    });

    return new File([wavData], "audio_pcm.wav", { type: "audio/wav" });
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const handleAudioAnalysis = async (audio: File) => {
    setTranscribedText('');
    setIsLoading(true);
    const formData = new FormData();
    formData.append("audio", audio ? audio : "No audio file");
    const response = await fetch("http://localhost:5000/audio/mic", {
      method: "POST",
      body: formData,
    });
    console.log(response)
    if (!response.ok) {
      throw new Error("Failed to fetch results");
    }
    // const data = await response.json();
    // console.log(data)

    const { job_id } = await response.json();

    // Step 2: Open SSE to stream results
    const eventSource = new EventSource(`http://localhost:5000/audio/stream/${job_id}`);

    eventSource.onmessage = (event) => {
      const updatedResults: [] = JSON.parse(event.data);
      setResults(updatedResults); // This re-renders with new array
      console.log(updatedResults)
    };

    eventSource.onerror = (err) => {
      console.error("SSE error:", err);
      eventSource.close();
      setIsLoading(false);
    };
  };
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioBlob(file);
      handleAudioAnalysis(file);
    }
  };


  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (audioUrl) { 
      setResults([])
      setTranscribedText('');
      setIsLoading(true);
      // const formData = new FormData();
      // formData.append("url", audio ? audio : "No audio file");
      const response = await fetch("http://localhost:5000/audio/url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url:audioUrl }),
      });
      console.log(response)
      if (!response.ok) {
        throw new Error("Failed to fetch results");
      }
      // const data = await response.json();
      // console.log(data)
  
      const { job_id } = await response.json();
  
      // Step 2: Open SSE to stream results
      const eventSource = new EventSource(`http://localhost:5000/audio/stream/${job_id}`);
  
      eventSource.onmessage = (event) => {
        const updatedResults: [] = JSON.parse(event.data);
        setResults(updatedResults); // This re-renders with new array
        console.log(updatedResults)
      };
  
      eventSource.onerror = (err) => {
        console.error("SSE error:", err);
        eventSource.close();
        setIsLoading(false);
      };
    }
  };
  const handleFeedback = async (result: AnalysisResult, isPositive: boolean) => {
    console.log(`Feedback ${isPositive ? 'positive' : 'negative'} for: ${result.text}`);
  };


  // const handleFeedback = async (isPositive: boolean) => {
  //   console.log(`Feedback ${isPositive ? 'positive' : 'negative'} for audio check`);
  // };
  // const openModal = (result: AudioCheckResult) => {
  //   setModal(true);
  //   setResultData(result);
  // }

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Input Type</h2>
          <div className="space-y-4">
            <button
              onClick={() => {setInputType('voiceover'); setAudioBlob(null); setResults([]);}}
              className={`flex items-center space-x-2 p-3 w-full rounded-lg transition ${inputType === 'voiceover'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
            >
              <Mic className="w-5 h-5" />
              <span>Voice Recording</span>
            </button>
            <button
              onClick={() => {setInputType('url'); setAudioBlob(null);setResults([]);}}
              className={`flex items-center space-x-2 p-3 w-full rounded-lg transition ${inputType === 'url'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
            >
              <Link className="w-5 h-5" />
              <span>Audio URL</span>
            </button>
            <button
              onClick={() => {setInputType('local'); setAudioBlob(null);setResults([]);}}
              className={`flex items-center space-x-2 p-3 w-full rounded-lg transition ${inputType === 'local'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
            >
              <Upload className="w-5 h-5" />
              <span>Local File</span>
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Audio Input</h2>

          {/* Voice Recording Input */}
          {inputType === 'voiceover' && (
            <div className="flex flex-col items-center space-y-4">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`p-4 rounded-full ${isRecording
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-blue-500 hover:bg-blue-600'
                  } text-white transition`}
              >
                {isRecording ? (
                  <Square className="w-6 h-6" />
                ) : (
                  <Mic className="w-6 h-6" />
                )}
              </button>
              <p>{isRecording ? 'Recording...' : 'Click to start recording'}</p>
              {audioBlob && (
                <audio controls src={URL.createObjectURL(audioBlob)} className="w-full mt-4" />
              )}
            </div>
          )}

          {/* URL Input */}
          {inputType === 'url' && (
            <form onSubmit={handleUrlSubmit} className="space-y-4">
              <input
                type="url"
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                placeholder="Enter audio URL"
                className="w-full p-3 rounded-lg border dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                Analyze
              </button>
            </form>
          )}

          {/* Local File Input */}
          {inputType === 'local' && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition"
              >
                <Upload className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>Click to upload audio file</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="audio/*"
                  className="hidden"
                />
              </div>
              {audioBlob && (
                <audio controls src={URL.createObjectURL(audioBlob)} className="w-full" />
              )}
            </div>
          )}

          {/* Transcribed Text */}
          {transcribedText && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Transcribed Text:</h3>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p>{transcribedText}</p>
              </div>
            </div>
          )}
        </div>

        {/* <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Results</h2>
          {results && results.map((result, index) => (
              <div className='flex flex-col'>
                <ResultCard results={result} key={index}/>
              </div>
            ))}
          {isLoading && <Loader duration={15000}/>}
        </div> */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
          <div className="space-y-4">
            {results.map((result, index) => (
              <div className='flex flex-col'>
                <ResultCard results={result} key={index} />
              </div>
            ))}
            {isLoading && <Loader duration={15000} />}
          </div>
        </div>
      </div>
      </div>
  );
};

      export default AudioCheck;
