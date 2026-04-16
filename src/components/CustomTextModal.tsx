import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface CustomTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (text: string) => void;
}

export function CustomTextModal({ isOpen, onClose, onConfirm }: CustomTextModalProps) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setError('Please enter some text to practice.');
      return;
    }
    onConfirm(text.trim());
    setText('');
    setError('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-bg/90 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-lg bg-surface border border-border-theme rounded-2xl p-8 shadow-2xl relative"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-text-dim hover:text-text-main transition-colors"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold mb-4 text-text-main">Custom Practice Text</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <textarea
                  autoFocus
                  className="w-full h-40 bg-bg border border-border-theme rounded-xl p-4 text-text-main focus:border-accent-blue outline-none transition-colors resize-none font-mono"
                  placeholder="Paste your text here..."
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                    if (error) setError('');
                  }}
                />
                {error && <p className="text-accent-red text-xs mt-1 font-medium">{error}</p>}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-accent-blue text-white rounded-xl font-bold uppercase tracking-widest hover:brightness-110 transition-all font-sans"
              >
                Start Practice
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
