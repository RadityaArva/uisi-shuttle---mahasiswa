import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from './Header/ToastBanner';

interface OfflineBannerProps {
  isSimulatedOffline?: boolean;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ isSimulatedOffline = false }) => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const { showToast } = useToast();

  const effectivelyOffline = !isOnline || isSimulatedOffline;

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast({
        type: 'success',
        title: 'Status Jaringan',
        message: 'Koneksi kembali online'
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showToast]);

  return (
    <AnimatePresence>
      {effectivelyOffline && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-[#FFF2BF] text-[#5D4700] px-4 py-2 text-xs font-medium flex items-center justify-center gap-2 overflow-hidden border-b border-[#E7D58D] z-30"
        >
          <span className="material-symbols-outlined text-[16px] text-[#F2A900] animate-pulse">
            wifi_off
          </span>
          <span>Koneksi terputus. Data akan otomatis disinkronkan saat online kembali.</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
