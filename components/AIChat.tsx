import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Mic, MicOff, Volume2, X } from 'lucide-react';
import { createBlob, decode, decodeAudioData } from '../services/audioUtils';
import AudioVisualizer from './AudioVisualizer';
import { User } from '../types';

interface AIChatProps {
  onClose: () => void;
  user?: User;
}

const AIChat: React.FC<AIChatProps> = ({ onClose, user }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Refs for audio handling to avoid re-renders
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const initializeSession = async () => {
    try {
      if (!process.env.API_KEY) {
        throw new Error("API Key is missing.");
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const inputCtx = new AudioContextClass({ sampleRate: 16000 });
      const outputCtx = new AudioContextClass({ sampleRate: 24000 });
      
      inputContextRef.current = inputCtx;
      audioContextRef.current = outputCtx;
      
      const outputNode = outputCtx.createGain();
      outputNode.connect(outputCtx.destination);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Personalized Context
      const userContext = user 
        ? `The user's name is ${user.username} and they are a student in Grade ${user.grade}.` 
        : "The user is anonymous.";

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            console.log('Session opened');
            setIsConnected(true);
            
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            
            if (base64Audio && audioContextRef.current) {
              const ctx = audioContextRef.current;
              setIsSpeaking(true);
              
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              const audioBuffer = await decodeAudioData(
                decode(base64Audio),
                ctx,
                24000,
                1
              );
              
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputNode);
              
              source.addEventListener('ended', () => {
                 sourcesRef.current.delete(source);
                 if (sourcesRef.current.size === 0) setIsSpeaking(false);
              });

              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(src => src.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setIsSpeaking(false);
            }
          },
          onclose: () => {
            console.log('Session closed');
            setIsConnected(false);
          },
          onerror: (e) => {
            console.error(e);
            setError("Connection error occurred.");
            setIsConnected(false);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: `You are 'Mitra', a calm, empathetic, and non-judgmental personal therapist for students. ${userContext} Listen to their burdens, offer safe and gentle advice, and remember you are a safe space. Do not be overly clinical; be a warm friend. Keep responses concise.`,
        },
      });

      sessionPromiseRef.current = sessionPromise;

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to connect");
    }
  };

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (inputContextRef.current) inputContextRef.current.close();
    if (audioContextRef.current) audioContextRef.current.close();
    sessionPromiseRef.current = null;
    setIsConnected(false);
  };

  useEffect(() => {
    return () => cleanup();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto p-8 bg-white/50 backdrop-blur-md rounded-3xl shadow-xl border border-white/60 animate-fade-in relative my-8">
      <button 
        onClick={() => { cleanup(); onClose(); }}
        className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="mb-8 text-center">
        <h2 className="text-2xl font-light text-stone-700 mb-2">Mitra AI</h2>
        <p className="text-stone-500 text-sm">Hi {user?.username}, I'm listening.</p>
      </div>

      <div className="mb-12">
        <AudioVisualizer isActive={isConnected} />
      </div>

      <div className="flex flex-col items-center gap-4">
        {!isConnected ? (
          <button
            onClick={initializeSession}
            className="flex items-center gap-3 px-8 py-4 bg-sage-500 text-white rounded-full hover:bg-sage-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
          >
            <Mic className="w-5 h-5" />
            <span>Start Session</span>
          </button>
        ) : (
          <div className="flex flex-col items-center gap-4">
             <div className="flex items-center gap-2 text-sage-700 bg-sage-100 px-4 py-1 rounded-full text-xs font-medium tracking-wide">
                <div className="w-2 h-2 bg-sage-500 rounded-full animate-pulse"></div>
                LIVE CONNECTION
             </div>
            <button
              onClick={cleanup}
              className="flex items-center gap-3 px-8 py-4 bg-stone-200 text-stone-600 rounded-full hover:bg-stone-300 transition-all"
            >
              <MicOff className="w-5 h-5" />
              <span>End Session</span>
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-6 text-red-400 text-sm bg-red-50 px-4 py-2 rounded-lg">
          {error}
        </div>
      )}
      
      {isSpeaking && (
        <div className="mt-4 flex items-center gap-2 text-stone-400 text-sm animate-pulse">
          <Volume2 className="w-4 h-4" />
          <span>Mitra is speaking...</span>
        </div>
      )}
    </div>
  );
};

export default AIChat;