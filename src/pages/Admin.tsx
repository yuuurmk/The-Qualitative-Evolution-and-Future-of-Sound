import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Upload, FileAudio, RefreshCw } from 'lucide-react';

type Feedback = { id: number; result_type: string; feeling: string; created_at: string };
type AudioFile = { id: number; result_type: string; filename: string; created_at: string };

export function Admin() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [selectedType, setSelectedType] = useState('energy');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    try {
      const [fbRes, audRes] = await Promise.all([
        fetch('/api/feedback'),
        fetch('/api/audio/all')
      ]);
      if (fbRes.ok) setFeedbacks(await fbRes.json());
      if (audRes.ok) setAudioFiles(await audRes.json());
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('audioFile', file);
    formData.append('resultType', selectedType);

    setIsUploading(true);
    try {
      const res = await fetch('/api/audio/upload', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        fetchData();
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-12">
        <header className="flex justify-between items-end border-b border-neutral-300 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">展區後台系統</h1>
            <p className="text-neutral-500 mt-2">AI：聲音的質變與未來</p>
          </div>
          <button onClick={fetchData} className="flex items-center gap-2 text-sm px-4 py-2 bg-white border border-neutral-300 rounded hover:bg-neutral-50 shadow-sm transition">
            <RefreshCw className="w-4 h-4" /> 重新整理
          </button>
        </header>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Upload Section */}
          <section className="space-y-6">
            <h2 className="text-xl font-semibold border-b border-neutral-200 pb-2">上傳 AIGC 音軌</h2>
            <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm space-y-6">
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">選擇類型</label>
                <select 
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg outline-none focus:border-blue-500"
                >
                  <option value="energy">高能動態 (Energy)</option>
                  <option value="space">無垠空間 (Space)</option>
                  <option value="texture">細緻肌理 (Texture)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">選擇 MP3 檔案</label>
                <div 
                  className="border-2 border-dashed border-neutral-300 rounded-xl p-8 text-center hover:bg-neutral-50 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isUploading ? (
                    <RefreshCw className="w-6 h-6 mx-auto animate-spin text-neutral-400" />
                  ) : (
                    <Upload className="w-6 h-6 mx-auto text-neutral-400" />
                  )}
                  <p className="mt-2 text-sm text-neutral-500">
                    {isUploading ? "上傳中..." : "點擊選擇音檔 (僅支援 MP3/WAV)"}
                  </p>
                </div>
                <input 
                  type="file" 
                  accept="audio/*" 
                  ref={fileInputRef} 
                  onChange={handleUpload}
                  className="hidden" 
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
              <h3 className="text-sm font-medium mb-4">現有音檔記錄</h3>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {audioFiles.map(file => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded border border-neutral-100">
                    <div className="flex items-center gap-3">
                      <FileAudio className="w-4 h-4 text-neutral-400" />
                      <div className="text-sm truncate w-40" title={file.filename}>{file.filename}</div>
                    </div>
                    <span className="text-xs font-mono px-2 py-1 bg-neutral-200 rounded">{file.result_type}</span>
                  </div>
                ))}
                {audioFiles.length === 0 && <div className="text-sm text-neutral-500 text-center py-4">尚無音檔</div>}
              </div>
            </div>
          </section>

          {/* Feedback Section */}
          <section className="space-y-6 flex flex-col h-full">
            <h2 className="text-xl font-semibold border-b border-neutral-200 pb-2">觀眾觀後感</h2>
            <div className="flex-1 bg-white p-6 rounded-xl border border-neutral-200 shadow-sm overflow-y-auto max-h-[600px] space-y-4">
              {feedbacks.length === 0 ? (
                <div className="text-center text-neutral-500 py-10">尚無觀眾回饋</div>
              ) : (
                feedbacks.map((fb) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={fb.id} 
                    className="p-4 border border-neutral-100 bg-neutral-50 rounded-lg space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        {fb.result_type.toUpperCase()}
                      </span>
                      <span className="text-xs text-neutral-400">
                        {new Date(fb.created_at).toLocaleString('zh-TW')}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-700 leading-relaxed break-words">
                      {fb.feeling}
                    </p>
                  </motion.div>
                ))
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
