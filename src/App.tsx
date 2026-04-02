/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, Download, Sparkles, User, Image as ImageIcon, Check, Loader2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";

// --- Types ---
type DressType = 'Himachal' | 'Rajasthani' | 'Punjabi';

interface DressOption {
  id: DressType;
  name: string;
  description: string;
  prompt: string;
  color: string;
}

const DRESS_OPTIONS: DressOption[] = [
  {
    id: 'Himachal',
    name: 'Himachal Pradesh',
    description: 'Traditional Pattu and Dhatu with woolen embroidery',
    prompt: 'Apply a traditional Himachal Pradesh dress (Pattu and Dhatu headscarf) to the person in this image. Keep the face, pose, and background exactly the same. The dress should be colorful and authentic to Himachali culture.',
    color: 'bg-emerald-500'
  },
  {
    id: 'Rajasthani',
    name: 'Rajasthan',
    description: 'Vibrant Ghagra Choli or Angarkha with Pagri',
    prompt: 'Apply a vibrant traditional Rajasthani dress (Ghagra Choli with mirror work or Angarkha with a colorful Pagri turban) to the person in this image. Keep the face, pose, and background exactly the same. Use rich colors like saffron and deep red.',
    color: 'bg-orange-500'
  },
  {
    id: 'Punjabi',
    name: 'Punjab',
    description: 'Phulkari embroidery and Patiala style',
    prompt: 'Apply a traditional Punjabi dress (Phulkari embroidered suit or Kurta with a turban) to the person in this image. Keep the face, pose, and background exactly the same. The outfit should look festive and authentic.',
    color: 'bg-blue-500'
  }
];

export default function App() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [selectedDress, setSelectedDress] = useState<DressOption>(DRESS_OPTIONS[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Capture, 2: Select, 3: Result

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Check if API key is configured
  useEffect(() => {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.trim() === '') {
      setError('GEMINI_API_KEY is not configured. Please set it in the .env file and restart the server.');
    }
  }, []);

  // Initialize Camera
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access camera. Please ensure you have given permission.");
    }
  };

  useEffect(() => {
    if (step === 1) {
      startCamera();
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [step]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        setStep(2);
        // Stop camera stream to save resources
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          setStream(null);
        }
      }
    }
  };

  const resetCapture = () => {
    setCapturedImage(null);
    setResultImage(null);
    setStep(1);
  };

  const processImage = async () => {
    if (!capturedImage) return;

    // Validate API key before processing
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.trim() === '') {
      setError('GEMINI_API_KEY is not set. Please configure your API key in the .env file.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = 'gemini-2.5-flash-image';
      
      // Extract base64 data
      const base64Data = capturedImage.split(',')[1];

      const response = await ai.models.generateContent({
        model: model,
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: "image/jpeg",
              },
            },
            {
              text: selectedDress.prompt,
            },
          ],
        },
      });

      let foundImage = false;
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const resultBase64 = part.inlineData.data;
          setResultImage(`data:image/png;base64,${resultBase64}`);
          setStep(3);
          foundImage = true;
          break;
        }
      }

      if (!foundImage) {
        throw new Error("AI did not return an image. Please try again.");
      }

    } catch (err: any) {
      console.error("AI Processing Error:", err);
      setError(err.message || "An error occurred while processing the image.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = `traditional-dress-${selectedDress.id.toLowerCase()}.png`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-emerald-100">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
            <Sparkles size={18} />
          </div>
          <h1 className="text-lg font-semibold tracking-tight">Vastra AI</h1>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium uppercase tracking-widest text-gray-400">
          <span className={step === 1 ? 'text-emerald-600' : ''}>Capture</span>
          <ChevronRight size={14} />
          <span className={step === 2 ? 'text-emerald-600' : ''}>Style</span>
          <ChevronRight size={14} />
          <span className={step === 3 ? 'text-emerald-600' : ''}>Result</span>
        </div>
      </header>

      <main className="pt-24 pb-12 px-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Side: Viewport */}
          <div className="lg:col-span-7 space-y-6">
            <div className="relative aspect-[4/3] bg-black rounded-3xl overflow-hidden shadow-2xl shadow-emerald-900/10 border border-gray-200">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div 
                    key="camera"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0"
                  >
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      className="w-full h-full object-cover scale-x-[-1]"
                    />
                    <div className="absolute inset-0 border-[20px] border-white/10 pointer-events-none" />
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
                      <button 
                        onClick={capturePhoto}
                        className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-white/20 backdrop-blur-sm hover:scale-110 transition-transform active:scale-95"
                      >
                        <div className="w-14 h-14 rounded-full bg-white" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {(step === 2 || (step === 3 && !resultImage)) && (
                  <motion.div 
                    key="preview"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0"
                  >
                    <img 
                      src={capturedImage!} 
                      alt="Captured" 
                      className="w-full h-full object-cover"
                    />
                    {isProcessing && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                        <Loader2 className="w-12 h-12 animate-spin mb-4" />
                        <p className="text-lg font-medium animate-pulse">Dressing you up in {selectedDress.name} style...</p>
                        <p className="text-sm opacity-60 mt-2">Our AI is weaving your traditional attire</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {step === 3 && resultImage && (
                  <motion.div 
                    key="result"
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0"
                  >
                    <img 
                      src={resultImage} 
                      alt="Result" 
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm flex items-start gap-3">
                <div className="mt-0.5">⚠️</div>
                <p>{error}</p>
              </div>
            )}
          </div>

          {/* Right Side: Controls */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">
                {step === 1 ? 'Strike a Pose' : step === 2 ? 'Choose Your Style' : 'Looking Great!'}
              </h2>
              <p className="text-gray-500 leading-relaxed">
                {step === 1 
                  ? 'Position yourself in the center of the frame. Ensure good lighting for the best AI results.' 
                  : step === 2 
                  ? 'Select a traditional regional dress from India to virtually try on.'
                  : 'Your AI-generated traditional look is ready. You can download it or try another style.'}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div 
                  key="step1-controls"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-4"
                >
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <Camera size={20} />
                    </div>
                    <p>Camera is active and ready</p>
                  </div>
                  <div className="h-px bg-gray-100" />
                  <p className="text-xs text-gray-400 italic">
                    Tip: Stand at a distance where your upper body is visible.
                  </p>
                </motion.div>
              ) : step === 2 ? (
                <motion.div 
                  key="step2-controls"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 gap-3">
                    {DRESS_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setSelectedDress(option)}
                        className={`group relative p-4 rounded-2xl border-2 transition-all text-left flex items-center gap-4 ${
                          selectedDress.id === option.id 
                            ? 'border-emerald-600 bg-emerald-50/50' 
                            : 'border-gray-100 bg-white hover:border-gray-200'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-xl ${option.color} flex items-center justify-center text-white shadow-lg shadow-black/5`}>
                          <ImageIcon size={24} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{option.name}</h3>
                          <p className="text-xs text-gray-500">{option.description}</p>
                        </div>
                        {selectedDress.id === option.id && (
                          <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center text-white">
                            <Check size={14} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={resetCapture}
                      className="flex-1 px-6 py-4 rounded-2xl border border-gray-200 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <RefreshCw size={18} />
                      Retake
                    </button>
                    <button 
                      onClick={processImage}
                      disabled={isProcessing}
                      className="flex-[2] px-6 py-4 rounded-2xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Sparkles size={18} />
                      Apply Dress
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="step3-controls"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <button 
                    onClick={downloadResult}
                    className="w-full px-6 py-4 rounded-2xl bg-gray-900 text-white font-semibold hover:bg-black transition-all shadow-xl flex items-center justify-center gap-2"
                  >
                    <Download size={18} />
                    Download Photo
                  </button>
                  <button 
                    onClick={resetCapture}
                    className="w-full px-6 py-4 rounded-2xl border border-gray-200 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={18} />
                    Try Another
                  </button>
                  
                  <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 space-y-3">
                    <h4 className="font-semibold text-emerald-900 flex items-center gap-2">
                      <User size={16} />
                      About the Look
                    </h4>
                    <p className="text-sm text-emerald-800/80 leading-relaxed">
                      You are wearing the {selectedDress.name} style. {selectedDress.description}. 
                      This AI generation preserves your identity while reimagining your attire.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <canvas ref={canvasRef} className="hidden" />
      
      {/* Footer */}
      <footer className="mt-auto py-8 px-6 border-t border-gray-100">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
          <p>© 2026 Vastra AI. Powered by Google Gemini 2.5 Flash Image.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-600 transition-colors">Research Doc</a>
            <a href="#" className="hover:text-gray-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gray-600 transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
