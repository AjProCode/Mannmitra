import React from 'react';

interface AudioVisualizerProps {
  isActive: boolean;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isActive }) => {
  return (
    <div className={`relative flex items-center justify-center w-32 h-32 transition-all duration-1000 ${isActive ? 'opacity-100' : 'opacity-50'}`}>
      {/* Outer rings */}
      <div className={`absolute w-full h-full rounded-full border border-sage-200 ${isActive ? 'animate-[ping_3s_linear_infinite]' : ''}`} />
      <div className={`absolute w-24 h-24 rounded-full border border-sage-300 ${isActive ? 'animate-[ping_4s_linear_infinite_0.5s]' : ''}`} />
      
      {/* Core */}
      <div className="relative w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center shadow-sm">
        <div className={`w-12 h-12 bg-sage-500/20 rounded-full ${isActive ? 'animate-pulse' : ''}`} />
      </div>
    </div>
  );
};

export default AudioVisualizer;