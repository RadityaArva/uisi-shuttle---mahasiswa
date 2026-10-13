import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'alert' | 'info';
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (msg: Omit<ToastMessage, 'id'>) => void;
  activeToast: ToastMessage | null;
  dismissToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeToast, setActiveToast] = useState<ToastMessage | null>(null);

  const dismissToast = useCallback(() => {
    setActiveToast(null);
  }, []);

  const showToast = useCallback((msg: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}`;
    const newToast: ToastMessage = { ...msg, id };
    setActiveToast(newToast);

    const dur = msg.duration ?? 4500;
    setTimeout(() => {
      setActiveToast((curr) => (curr?.id === id ? null : curr));
    }, dur);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, activeToast, dismissToast }}>
      <div className="min-h-screen flex flex-col w-full bg-[#F5F5F6]">
        {/* Push-banner: sits in normal document flow and pushes content down */}
        <AnimatePresence mode="wait">
          {activeToast && (
            <motion.div
              key={activeToast.id}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="overflow-hidden border-b border-black/5"
            >
              <div
                className={`px-4 py-3 flex items-start justify-between gap-3 text-sm font-medium ${
                  activeToast.type === 'success'
                    ? 'bg-[#E8F5E9] text-[#1B5E20] border-l-4 border-[#2E9E5B]'
                    : activeToast.type === 'warning'
                    ? 'bg-[#FFF8E1] text-[#E65100] border-l-4 border-[#F2A900]'
                    : activeToast.type === 'alert'
                    ? 'bg-[#FDECEE] text-[#9B0D24] border-l-4 border-[#C8102E]'
                    : 'bg-[#E1F5FE] text-[#01579B] border-l-4 border-[#0288D1]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[20px] shrink-0">
                    {activeToast.type === 'success'
                      ? 'check_circle'
                      : activeToast.type === 'warning'
                      ? 'warning'
                      : activeToast.type === 'alert'
                      ? 'error'
                      : 'info'}
                  </span>
                  <div>
                    {activeToast.title && (
                      <div className="font-semibold text-xs tracking-wide uppercase opacity-90">
                        {activeToast.title}
                      </div>
                    )}
                    <div className="text-[13px] leading-snug">{activeToast.message}</div>
                  </div>
                </div>
                <button
                  onClick={dismissToast}
                  className="p-1 rounded hover:bg-black/5 text-current opacity-70 hover:opacity-100 transition-opacity"
                  aria-label="Tutup"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main page content smoothly pushed down */}
        <div className="flex-1 flex flex-col">{children}</div>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};
