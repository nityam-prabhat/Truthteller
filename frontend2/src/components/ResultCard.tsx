import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Languages } from 'lucide-react';

// interface Source {
//   url: string;
// }

interface ResultData {
  query: string;
  prediction: string;
  justification: string;
  lang: string;
  sources: string[];
}

interface ResultCardProps {
  results: ResultData[];
}


const CardContent: React.FC<{
  result: ResultData;
  isExpanded: boolean;
  setIsExpanded: (value: boolean) => void;
  hasTranslation: boolean;
  isFlipped: boolean;
  onFlip: () => void;
  otherLang: string;
}> = ({ result, isExpanded, setIsExpanded, hasTranslation, isFlipped, onFlip, otherLang }) => (
  <div className="p-6">
    {/* Query Section */}
    <h3 className="text-lg font-semibold text-gray-800 mb-4">
      {result.query}
    </h3>

    {/* Prediction Section */}
    <div className="mb-4">
      <div
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${result.prediction==="True"
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
          }`}
      >
        {result.prediction === "True"? "True" : "False"}
      </div>
    </div>

    {/* Justification Section (Expandable) */}
    {isExpanded && (
      <div className="mt-4 text-gray-600 animate-expand">
        <p className="mb-4">{result.justification}</p>

        {/* Sources */}
        {result.sources.length > 0 && (
          <div  className="mt-4">
            <p className="font-medium text-gray-700 mb-2">Sources:</p>
            <ul className="list-disc list-inside space-y-1">
              {result.sources.map((source, index) => (
                <li key={index}>
                  <a
                    href={source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 break-all"
                  >
                    {source}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )}

    {/* Action Buttons */}
    <div className="flex justify-between items-center mt-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center text-gray-600 hover:text-gray-800"
      >
        {isExpanded ? (
          <>
            <ChevronUp className="w-4 h-4 mr-1" />
            Show Less
          </>
        ) : (
          <>
            <ChevronDown className="w-4 h-4 mr-1" />
            Show More
          </>
        )}
      </button>

      {hasTranslation && (
        <button
          onClick={onFlip}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <Languages className="w-4 h-4 mr-1" />
          {otherLang}
        </button>
      )}
    </div>
  </div>
);

export const ResultCard: React.FC<ResultCardProps> = ({ results }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  console.log("resultcard: ", results[0])
  const hasTranslation = results.length === 2;
  function getLanguageName(isoCode: string, locale: string = 'en'): string {
    try {
      const displayNames = new Intl.DisplayNames([locale], { type: 'language' });
      return displayNames.of(isoCode) || isoCode;
    } catch (e) {
      return isoCode; // Fallback in case of invalid code or unsupported browser
    }
  }

  return (
    <div className="w-full max-w-md mx-auto flip-container">
      <div className={`flipper ${isFlipped ? 'flip' : ''}`}>
        {/* <div className="front" >
          <CardContent
            result= {results[0]}
            isExpanded={isExpanded}
            setIsExpanded={setIsExpanded}
            hasTranslation={hasTranslation}
            isFlipped={isFlipped}
            onFlip={() => setIsFlipped(true)}
            otherLang={getLanguageName(results[1]?.lang || '')}
          />
        </div> */}
        {isFlipped? <div className="back">
          <CardContent
            result={results[1]}
            isExpanded={isExpanded}
            setIsExpanded={setIsExpanded}
            hasTranslation={hasTranslation}
            isFlipped={isFlipped}
            onFlip={() => setIsFlipped(false)}
            otherLang={getLanguageName(results[0].lang)}
          />
        </div>:<div className="front" >
          <CardContent
            result= {results[0]}
            isExpanded={isExpanded}
            setIsExpanded={setIsExpanded}
            hasTranslation={hasTranslation}
            isFlipped={isFlipped}
            onFlip={() => setIsFlipped(true)}
            otherLang={getLanguageName(results[1]?.lang || '')}
          />
        </div>}
      </div>
    </div>
  );
}