import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Play, Pause, Loader2, Send } from 'lucide-react';

const TYPE_DESCRIPTIONS: Record<string, { title: string; desc: string }> = {
  energy: {
    title: "高能動態",
    desc: "你的感知頻率充滿張力與明確的目的性。對你而言，聲音不僅是訊息，更是驅動情緒與節奏的能量。"
  },
  space: {
    title: "無垠空間",
    desc: "你對環境的寬度與深邃有著天然的敏銳度。你聽見的不只是聲音本身，更是聲音在空間中折射出的軌跡。"
  },
  texture: {
    title: "細緻肌理",
    desc: "你著迷於事物微小的紋理與溫度。那些充滿顆粒感、不可預測的聲音瑕疵與質感，才是你認為最真實的頻率。"
  }
};

export function Result() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const type = searchParams.get('type') || 'energy';
  
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [feeling, setFeeling] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Fetch the correct audio track for the result type
    fetch(`/api/audio/track/${type}`)
      .then(res => res.json())
      .then(data => {
        if (data.filename) {
          setAudioUrl(`/audio/${data.filename}`);
        }
      })
      .catch(console.error);
  }, [type]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feeling.trim()) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result_type: type, feeling })
      });
      if (res.ok) {
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const content = TYPE_DESCRIPTIONS[type] || TYPE_DESCRIPTIONS.energy;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 flex flex-col items-center py-20 px-6 relative">
      <div className="w-full max-w-2xl space-y-16">
        
        {/* Result Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-6"
        >
          <div className="text-xs tracking-[0.2em] text-neutral-500 uppercase">分析完成</div>
          <h1 className="text-4xl md:text-5xl font-light tracking-widest text-white">
            {content.title}
          </h1>
          <p className="text-neutral-400 leading-relaxed text-lg">
            {content.desc}
          </p>
        </motion.div>

        {/* Audio Player */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="p-8 border border-neutral-800 rounded-3xl bg-neutral-900/30 backdrop-blur flex flex-col items-center justify-center space-y-8"
        >
          {audioUrl ? (
            <>
              <audio 
                ref={audioRef} 
                src={audioUrl} 
                onEnded={() => setIsPlaying(false)}
                className="hidden" 
              />
              <div className="text-center space-y-2">
                <div className="text-sm font-mono text-neutral-500">AIGC TRACK LOADED</div>
                <div className="text-xl font-light tracking-wide">你的專屬 AI 聲音軌跡</div>
              </div>
              <button
                onClick={togglePlay}
                className="w-20 h-20 flex items-center justify-center rounded-full bg-white text-neutral-900 hover:scale-105 transition-transform"
              >
                {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
              </button>
            </>
          ) : (
            <div className="text-center text-neutral-500 py-10 space-y-4">
              <Loader2 className="w-8 h-8 animate-spin mx-auto opacity-50" />
              <p>我們無法為這個頻率找到聲音軌跡。<br/>請從後台加入 {type} 類別的音檔。</p>
            </div>
          )}
        </motion.div>

        {/* Feedback Section */}
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.8, duration: 0.8 }}
           className="space-y-6"
        >
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block text-sm font-light text-neutral-400 mb-2">
                聽完這段聲音，你有什麼真實的感受？（例如：畫面感、情感、記憶）
              </label>
              <div className="relative">
                <textarea 
                  value={feeling}
                  onChange={(e) => setFeeling(e.target.value)}
                  placeholder="寫下你的感受..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-4 text-white focus:outline-none focus:border-neutral-600 transition-colors placeholder:text-neutral-700 min-h-[120px] resize-none"
                />
                <button 
                  type="submit"
                  disabled={!feeling.trim() || isSubmitting}
                  className="absolute bottom-4 right-4 p-2 bg-white text-black rounded-full disabled:opacity-50 hover:bg-neutral-200 transition-colors"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </form>
          ) : (
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="text-center p-8 border border-neutral-800 rounded-2xl bg-neutral-900/30"
             >
               <h3 className="text-xl text-white font-light mb-2">謝謝你的分享</h3>
               <p className="text-neutral-500 text-sm">你的反饋將成為我們研究的一部份。</p>
               <button onClick={() => navigate('/')} className="mt-6 text-sm underline text-neutral-400 hover:text-white transition-colors">
                 重新體驗
               </button>
             </motion.div>
          )}
        </motion.div>

      </div>
    </div>
  );
}
