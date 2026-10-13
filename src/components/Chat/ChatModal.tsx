import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatMessage, RideRequest } from '../../types/shuttle';
import { shuttleService, SHUTTLE_INFO } from '../../services/shuttleService';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: RideRequest;
}

export const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, request }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Student Quick Replies
  const studentQuickReplies = [
    'Kami sudah di halte',
    'Mohon tunggu sebentar',
    'Barang saya tertinggal',
    'Terima kasih'
  ];

  // Subscribe to realtime messages for this request
  useEffect(() => {
    if (!isOpen || !request.id) return;

    const unsubscribe = shuttleService.subscribeChat(request.id, (msgs) => {
      setMessages(msgs);
    });

    return () => {
      unsubscribe();
    };
  }, [isOpen, request.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (textToSend?: string) => {
    const text = (textToSend ?? inputText).trim();
    if (!text) return;

    shuttleService.sendChatMessage(request.id, 'passenger', text);
    if (!textToSend) {
      setInputText('');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-xs"
          />

          {/* Chat Container */}
          <motion.div
            initial={{ y: '100%', opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl h-[88vh] flex flex-col shadow-2xl overflow-hidden z-10"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-white border-b border-[#E5E7EB] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
                      alt="Pak Budi"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#2E9E5B] border-2 border-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#1F2933]">
                    {SHUTTLE_INFO.driverName}
                  </h3>
                  <p className="text-[11px] text-[#6B7280]">
                    Sopir UISI-01 &bull; {SHUTTLE_INFO.plat}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#6B7280] hover:bg-gray-100"
                aria-label="Tutup Chat"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Sub-bar showing trip context */}
            <div className="px-4 py-1.5 bg-[#F8FAFC] border-b border-gray-100 text-[11px] text-[#6B7280] flex items-center justify-between">
              <span>Rute: {request.from} &rarr; {request.to}</span>
              <span className="text-gray-400">ID: {request.id.slice(-6)}</span>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F5F5F6]">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-[#6B7280] py-8">
                  <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">
                    forum
                  </span>
                  <p className="text-xs font-medium">Belum ada percakapan</p>
                  <p className="text-[11px] text-gray-400 mt-1 max-w-xs">
                    Kirim pesan atau gunakan balasan cepat di bawah untuk koordinasi dengan Pak Budi.
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isStudent = msg.sender === 'passenger';
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex flex-col ${isStudent ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[78%] px-3.5 py-2 rounded-2xl text-xs font-medium leading-relaxed ${
                          isStudent
                            ? 'bg-[#C8102E] text-white rounded-br-xs shadow-xs'
                            : 'bg-white text-[#1F2933] border border-[#E5E7EB] rounded-bl-xs shadow-xs'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-[#6B7280] mt-0.5 px-1">
                        {msg.time}
                      </span>
                    </motion.div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies for Students (32px chips) */}
            <div className="p-2.5 bg-white border-t border-[#E5E7EB] shrink-0">
              <div className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider mb-1.5 px-1">
                Balasan Cepat Mahasiswa:
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {studentQuickReplies.map((reply) => (
                  <button
                    key={reply}
                    onClick={() => handleSend(reply)}
                    className="h-8 px-3 rounded-full text-xs font-medium whitespace-nowrap bg-gray-100 hover:bg-[#FDECEE] text-[#1F2933] hover:text-[#C8102E] border border-gray-200 transition-colors shrink-0"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 bg-white border-t border-gray-100 flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Tulis pesan ke sopir..."
                className="flex-1 h-11 px-3.5 text-xs bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-[#C8102E] transition-colors"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="w-11 h-11 rounded-xl bg-[#C8102E] hover:bg-[#9B0D24] text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 shadow-xs shrink-0"
                aria-label="Kirim"
              >
                <span className="material-symbols-outlined text-[20px]">send</span>
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
