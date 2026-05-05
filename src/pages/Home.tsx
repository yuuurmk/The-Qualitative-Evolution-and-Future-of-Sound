import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';

export function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Decorative gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-800/30 via-neutral-950 to-neutral-950 -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-2xl text-center space-y-8"
      >
        <div className="space-y-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xs tracking-[0.2em] text-neutral-500 uppercase"
          >
            AI: 聲音的質變與未來
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-light tracking-tight text-white mb-6 leading-tight">
            探索你的<br />聲音意識頻率
          </h1>
          <p className="text-neutral-400 text-lg leading-relaxed max-w-lg mx-auto">
            日常的選擇，揭示了你對能量、空間與質地的感知。透過 5 個簡單的問答，我們將為你生成一段專屬的 AIGC 聲音軌跡。
          </p>
        </div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/quiz')}
          className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-neutral-900 rounded-full font-medium tracking-wide transition-all hover:bg-neutral-200"
        >
          <span>開始體驗</span>
          <Play className="w-4 h-4 fill-current group-hover:translate-x-0.5 transition-transform" />
        </motion.button>
      </motion.div>

    </div>
  );
}
