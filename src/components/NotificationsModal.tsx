import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppNotification } from '../types/shuttle';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onClearAll
}) => {
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

          {/* Modal Content */}
          <motion.div
            initial={{ y: '100%', opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden z-10"
          >
            {/* Header */}
            <div className="px-4 py-3.5 border-b border-[#E5E7EB] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#C8102E] text-[22px]">
                  notifications
                </span>
                <h3 className="font-semibold text-[16px] text-[#1F2933]">Notifikasi</h3>
                {notifications.filter((n) => !n.read).length > 0 && (
                  <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-[#FDECEE] text-[#C8102E]">
                    {notifications.filter((n) => !n.read).length} baru
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {notifications.length > 0 && (
                  <button
                    onClick={onClearAll}
                    className="text-xs text-[#6B7280] hover:text-[#C8102E] px-2 py-1 font-medium"
                  >
                    Hapus Semua
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#6B7280] hover:bg-gray-100"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            </div>

            {/* List */}
            <div className="overflow-y-auto p-3 flex-1 flex flex-col gap-2">
              {notifications.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center text-[#6B7280]">
                  <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">
                    notifications_off
                  </span>
                  <p className="text-sm font-medium">Belum ada notifikasi</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Pemberitahuan armada dan pesanan akan muncul di sini.
                  </p>
                </div>
              ) : (
                notifications.map((item) => (
                  <motion.div
                    key={item.id}
                    onClick={() => onMarkAsRead(item.id)}
                    whileTap={{ scale: 0.98 }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer relative ${
                      !item.read
                        ? 'bg-[#FDECEE]/40 border-[#C8102E]/30'
                        : 'bg-white border-[#E5E7EB] hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          item.type === 'alert'
                            ? 'bg-red-100 text-[#C8102E]'
                            : item.type === 'warning'
                            ? 'bg-amber-100 text-[#F2A900]'
                            : item.type === 'success'
                            ? 'bg-emerald-100 text-[#2E9E5B]'
                            : 'bg-blue-100 text-blue-600'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[17px]">
                          {item.type === 'alert'
                            ? 'error'
                            : item.type === 'warning'
                            ? 'warning'
                            : item.type === 'success'
                            ? 'check'
                            : 'directions_bus'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center justify-between">
                          <h4
                            className={`text-[13px] font-semibold truncate ${
                              !item.read ? 'text-[#C8102E]' : 'text-[#1F2933]'
                            }`}
                          >
                            {item.title}
                          </h4>
                          <span className="text-[11px] text-[#6B7280] shrink-0">{item.time}</span>
                        </div>
                        <p className="text-[12px] text-[#6B7280] mt-0.5 leading-snug">
                          {item.message}
                        </p>
                      </div>

                      {/* Unread red dot */}
                      {!item.read && (
                        <div className="absolute top-3.5 right-3 w-2 h-2 rounded-full bg-[#C8102E]" />
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
