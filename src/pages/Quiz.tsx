import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

const QUESTIONS = [
  {
    id: 1,
    text: "當你欣賞一場現場演出時，你通常更容易被哪種狀態打動？",
    options: [
      { text: "(A) 呈現出極致完美的展演、每一個細節都準確無誤，沒有任何失誤。", type: "space" },
      { text: "(B) 帶點手工的粗糙感，或是演出中充滿無法預測的即興與小失誤。", type: "texture" }
    ]
  },
  {
    id: 2,
    text: "週末晚上想挑一部電影來看，或者找一首新歌聽，你會怎麼選擇？",
    options: [
      { text: "(A) 直接點開熱門排行榜，選擇符合大眾口味、安全且絕對不踩雷的作品。", type: "space" },
      { text: "(B) 刻意尋找劇情難以預測、風格極度冷門怪異的作品，越打破我的預期我越愛。", type: "energy" }
    ]
  },
  {
    id: 3,
    text: "如果要準備一頓豐盛的晚餐，你比較享受哪一種狀態？",
    options: [
      { text: "(A) 直接叫外賣，雖然不知道廚房裡發生了什麼，但能快速得到完美的一餐。", type: "energy" },
      { text: "(B) 親自去市場挑選食材、切菜備料，享受從無到有慢慢熬煮的過程，即使花費大量時間。", type: "texture" }
    ]
  },
  {
    id: 4,
    text: "在跟朋友策劃一場團體旅行時，你通常扮演什麼樣的角色？",
    options: [
      { text: "(A) 負責耍廢。", type: "space" },
      { text: "(B) 決定整趟旅程的J人", type: "energy" }
    ]
  },
  {
    id: 5,
    text: "當社群平台的演算法精準猜測到你今天心情不好，並推薦了你一首超對胃口的歌，你的直覺反應是？",
    options: [
      { text: "(A) 覺得好方便、好懂我！直接把歌加入收藏清單。", type: "energy" },
      { text: "(B) 覺得有點毛骨悚然，有一種自己被系統分析、心思被看透的不適感。", type: "texture" }
    ]
  }
];

export function Quiz() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scores, setScores] = useState({ energy: 0, space: 0, texture: 0 });

  const handleSelect = (type: 'energy' | 'space' | 'texture') => {
    const newScores = { ...scores, [type]: scores[type] + 1 };
    
    // We update state asynchronously
    if (currentQuestion < QUESTIONS.length - 1) {
      setScores(newScores);
      setCurrentQuestion(current => current + 1);
    } else {
      // Finish quiz
      let maxScore = -1;
      let finalResult = 'energy';
      for (const [key, value] of Object.entries(newScores) as [string, number][]) {
        if (value > maxScore) {
          maxScore = value;
          finalResult = key;
        }
      }
      // Navigate to result passing the calculated result type
      navigate(`/result?type=${finalResult}`);
    }
  };

  const q = QUESTIONS[currentQuestion];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 flex flex-col items-center justify-center p-6 relative">
      <div className="absolute top-8 text-neutral-500 text-sm font-mono">
        {currentQuestion + 1} / {QUESTIONS.length}
      </div>

      <div className="w-full max-w-xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="space-y-12"
          >
            <h2 className="text-2xl md:text-3xl text-white font-light text-center leading-relaxed">
              {q.text}
            </h2>

            <div className="space-y-4">
              {q.options.map((opt, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.1)' }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleSelect(opt.type as any)}
                  className="w-full p-6 text-left border border-neutral-800 rounded-2xl bg-neutral-900/50 hover:border-neutral-600 transition-colors duration-300 backdrop-blur-sm"
                >
                  <span className="text-neutral-300 font-light leading-relaxed">
                    {opt.text}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
