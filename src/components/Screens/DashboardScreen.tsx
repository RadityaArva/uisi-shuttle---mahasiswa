import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Bell, BusFront, Circle, MapPin } from 'lucide-react';
import { ShuttleState } from '../../types/shuttle';
import { CampusMap } from '../Map/CampusMap';

interface DashboardScreenProps {
  shuttleState: ShuttleState;
  unreadCount: number;
  onOpenNotifications: () => void;
  onStartBooking: () => void;
  isOffline?: boolean;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  shuttleState,
  unreadCount,
  onOpenNotifications,
  onStartBooking,
  isOffline = false
}) => {
  const isOperating = shuttleState.dutyStatus === 'on';
  const isStopped = isOperating && Boolean(shuttleState.atStop);
  const isFull = shuttleState.seatsUsed >= shuttleState.capacity;
  const canBook = isOperating && !isFull && !isOffline;
  const [secondsLeft, setSecondsLeft] = useState(200);

  useEffect(() => {
    if (!shuttleState.dwell) {
      setSecondsLeft(200);
      return;
    }
    const updateCountdown = () => {
      setSecondsLeft(Math.max(0, Math.ceil((shuttleState.dwell!.endsAt - Date.now()) / 1000)));
    };
    updateCountdown();
    const interval = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(interval);
  }, [shuttleState.dwell]);

  const timeLabel = `${String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:${String(secondsLeft % 60).padStart(2, '0')}`;
  let statusText = 'Beroperasi';
  let statusClass = 'bg-[#E8F5E9] text-[#1B5E20] border-[#B7DFC5]';
  let dotClass = 'bg-[#2E9E5B]';

  if (isStopped) {
    statusText = `Berhenti di ${shuttleState.currentStop}, berangkat dalam ${timeLabel}`;
    statusClass = 'bg-[#FFF6D8] text-[#795900] border-[#E8C85A]';
    dotClass = 'bg-[#D99A00]';
  } else if (shuttleState.dutyStatus === 'break') {
    statusText = `Sopir istirahat, kembali sekitar ${shuttleState.breakReturnAt || '10.45'}`;
    statusClass = 'bg-[#ECEFF1] text-[#4B5563] border-[#CDD3D8]';
    dotClass = 'bg-[#77818A]';
  } else if (shuttleState.dutyStatus === 'off') {
    statusText = 'Tidak beroperasi';
    statusClass = 'bg-[#8E1024] text-white border-[#6E0A1A]';
    dotClass = 'bg-white';
  }

  return (
    <div className="relative w-full h-full flex-1 overflow-hidden bg-[#E9ECEB]">
      <div className="absolute inset-0">
        {isOffline ? (
          <div className="absolute inset-0 overflow-hidden bg-[#E8ECE8] animate-pulse" aria-label="Peta sedang dimuat">
            <div className="absolute left-[8%] top-[14%] w-[36%] h-[44%] rounded-[26px] bg-[#D6DFD8]" />
            <div className="absolute right-[8%] top-[23%] w-[34%] h-[47%] rounded-[26px] bg-[#D6DFD8]" />
            <div className="absolute left-[15%] top-[61%] w-[72%] h-2 rounded-full bg-white/90 rotate-[-11deg]" />
            <div className="absolute left-[26%] top-[36%] w-[58%] h-2 rounded-full bg-white/90 rotate-[19deg]" />
            <div className="absolute left-[17%] top-[76%] w-6 h-6 rounded-full bg-white/80" />
            <div className="absolute left-[46%] top-[47%] w-6 h-6 rounded-full bg-white/80" />
            <div className="absolute right-[15%] top-[72%] w-6 h-6 rounded-full bg-white/80" />
          </div>
        ) : (
          <CampusMap shuttleState={shuttleState} interactive={true} />
        )}
      </div>

      <div className="relative z-20 px-3 pt-3 flex items-start justify-between gap-2 pointer-events-none">
        <div className={`pointer-events-auto max-w-[calc(100%-3.25rem)] min-h-8 px-3 py-2 rounded-2xl border shadow-sm flex items-start gap-2 text-xs font-semibold backdrop-blur-md ${statusClass}`}>
          <Circle size={8} fill="currentColor" className={`shrink-0 mt-1 ${dotClass}`} />
          <span>{statusText}</span>
        </div>
        <button
          onClick={onOpenNotifications}
          className="pointer-events-auto relative w-10 h-10 shrink-0 rounded-full bg-white shadow-md flex items-center justify-center text-[#1F2933] border border-[#E5E7EB]"
          aria-label="Buka notifikasi"
        >
          <Bell size={19} />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#C8102E] ring-2 ring-white" />
          {unreadCount > 0 && <span className="sr-only">{unreadCount} notifikasi belum dibaca</span>}
        </button>
      </div>

      <div className="absolute z-20 inset-x-4 bottom-4 flex flex-col gap-2 pointer-events-none">
        {shuttleState.dutyStatus === 'off' && !isOffline && (
          <p className="pointer-events-auto text-center text-xs font-medium text-[#7D1726] bg-white/90 px-3 py-2 rounded-lg shadow-sm">
            Jam operasional 07.00 - 17.00
          </p>
        )}
        {isOperating && isFull && !isOffline && (
          <motion.div
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="pointer-events-auto p-3 rounded-xl bg-[#FDECEE] border border-[#E8B5BE] text-xs text-[#9B0D24] flex items-center gap-2 font-medium shadow-sm"
          >
            <BusFront size={18} className="shrink-0" />
            <span>Armada penuh (14/14 kursi), tunggu armada berikutnya</span>
          </motion.div>
        )}
        <button
          onClick={onStartBooking}
          disabled={!canBook}
          className={`pointer-events-auto w-full h-12 rounded-xl font-semibold text-sm transition-all shadow-lg flex items-center justify-center gap-2 ${
            canBook
              ? 'bg-[#C8102E] hover:bg-[#9B0D24] text-white active:scale-[0.98] animate-pulse hover:animate-none'
              : 'bg-[#D4D7D9] text-[#697078] cursor-not-allowed shadow-none'
          }`}
        >
          {canBook ? <MapPin size={18} /> : <Circle size={16} />}
          <span>{canBook ? 'Pesan Shuttle' : 'Belum tersedia'}</span>
        </button>
      </div>
    </div>
  );
};