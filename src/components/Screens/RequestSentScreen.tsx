import React from 'react';
import { motion } from 'motion/react';
import { RideRequest } from '../../types/shuttle';

interface RequestSentScreenProps {
  request: RideRequest;
  onViewStatus: () => void;
}

export const RequestSentScreen: React.FC<RequestSentScreenProps> = ({
  request,
  onViewStatus
}) => (
  <div className="flex-1 flex flex-col justify-between bg-[#F5F5F6] p-5 overflow-y-auto">
    <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
      <motion.div
        initial={{ scale: 0.72, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 16 }}
        className="w-24 h-24 rounded-full bg-[#E8F5E9] border border-[#B7DFC5] flex items-center justify-center mb-5"
      >
        <svg viewBox="0 0 48 48" className="w-12 h-12" fill="none" aria-hidden="true">
          <motion.path
            d="M10 25.5 20 35l19-22"
            stroke="#2E9E5B"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.55, delay: 0.18, ease: 'easeOut' }}
          />
        </svg>
      </motion.div>
      <h1 className="text-xl font-bold text-[#1F2933]">Permintaan terkirim ke sopir</h1>
      <p className="mt-2 text-sm text-[#6B7280]">Menunggu sopir menerima permintaanmu</p>
    </div>

    <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 shadow-sm">
      <div className="text-xs font-semibold text-[#6B7280] mb-3">Ringkasan permintaan</div>
      <dl className="space-y-3 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-[#6B7280]">Jemput</dt>
          <dd className="text-right font-semibold text-[#1F2933]">{request.from}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-[#6B7280]">Tujuan</dt>
          <dd className="text-right font-semibold text-[#1F2933]">{request.to}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-[#6B7280]">Jumlah penumpang</dt>
          <dd className="font-semibold text-[#1F2933]">{request.passengerCount} orang</dd>
        </div>
        <div className="flex justify-between gap-4 border-t border-[#E5E7EB] pt-3">
          <dt className="text-[#6B7280]">Waktu</dt>
          <dd className="font-semibold text-[#1F2933]">{request.requestedAt}</dd>
        </div>
      </dl>
    </div>

    <div className="pt-4">
      <button
        onClick={onViewStatus}
        className="w-full h-12 bg-[#C8102E] hover:bg-[#9B0D24] text-white font-semibold rounded-xl text-sm transition-all shadow-md active:scale-[0.98]"
      >
        Lihat Status
      </button>
    </div>
  </div>
);