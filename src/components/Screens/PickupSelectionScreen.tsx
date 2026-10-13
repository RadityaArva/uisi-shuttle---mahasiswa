import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShuttleState } from '../../types/shuttle';
import { SHUTTLE_STOPS } from '../../services/shuttleService';
import { CampusMap } from '../Map/CampusMap';

interface PickupSelectionScreenProps {
  shuttleState: ShuttleState;
  onBack: () => void;
  onConfirmPickup: (pickupStop: string) => void;
  initialSelectedStop?: string;
}

export const PickupSelectionScreen: React.FC<PickupSelectionScreenProps> = ({
  shuttleState,
  onBack,
  onConfirmPickup,
  initialSelectedStop
}) => {
  const [selected, setSelected] = useState<string>(
    initialSelectedStop || ''
  );

  // Remaining seats
  const remainingSeats = Math.max(0, shuttleState.capacity - shuttleState.seatsUsed);

  // Helper to compute realistic ETA & distance to each stop relative to current shuttle
  const getStopDetails = (stopName: string) => {
    if (stopName === shuttleState.currentStop && shuttleState.atStop) {
      return { distance: 'Di lokasi saat ini', eta: 'Tiba sekarang' };
    }
    if (stopName === 'Pos Induk Kampus A') {
      return { distance: '180m', eta: '~1 mnt' };
    }
    if (stopName === 'Gedung Kampus A') {
      return { distance: '250m', eta: '~2 mnt' };
    }
    if (stopName === 'Pos Kampus B') {
      return { distance: '650m', eta: '~5 mnt' };
    }
    return { distance: '850m', eta: '~7 mnt' };
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F5F5F6] overflow-y-auto">
      {/* Top Header */}
      <div className="bg-white px-4 py-3 border-b border-[#E5E7EB] flex items-center justify-between sticky top-0 z-20 shadow-xs">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#1F2933] hover:bg-gray-100 active:scale-95 transition-all"
            aria-label="Kembali"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div>
            <h2 className="text-base font-bold text-[#1F2933]">Pilih Titik Jemput</h2>
            <p className="text-[11px] text-[#6B7280]">
              Tentukan halte penjemputanmu
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#FDECEE] text-[#C8102E]">
            Kursi tersisa {remainingSeats} dari {shuttleState.capacity}
          </span>
        </div>
      </div>

      {/* Mini Interactive Campus Map Preview (140px) */}
      <div className="h-[30vh] min-h-40 max-h-52 w-full relative shrink-0 border-b border-[#E5E7EB]">
        <CampusMap
          shuttleState={shuttleState}
          selectedPickup={selected || undefined}
          onSelectStop={(stopName) => setSelected(stopName)}
          interactive={false}
          compact={false}
        />
        <div className="absolute bottom-2 left-3 bg-white/85 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] text-[#6B7280] font-medium pointer-events-none">
          Ketuk kartu di bawah atau pin halte pada peta
        </div>
      </div>

      {/* Stop Cards List (Compact rules: side margin 16px, radius 12px, padding 10-12px) */}
      <div className="p-4 space-y-2.5 flex-1">
        {SHUTTLE_STOPS.map((stop) => {
          const isSelected = selected === stop.name;
          const { distance, eta } = getStopDetails(stop.name);

          return (
            <motion.div
              key={stop.id}
              onClick={() => setSelected(stop.name)}
              animate={{
                scale: isSelected ? 1.02 : 1,
                borderColor: isSelected ? '#C8102E' : '#E5E7EB'
              }}
              transition={{ duration: 0.18 }}
              className={`p-3 rounded-xl border bg-white cursor-pointer transition-shadow shadow-xs relative ${
                isSelected
                  ? 'border-[#C8102E] ring-1 ring-[#C8102E]/20 bg-[#FDECEE]/10'
                  : 'hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected
                        ? 'bg-[#C8102E] text-white'
                        : 'bg-gray-100 text-[#6B7280]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      pin_drop
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-[14px] font-bold text-[#1F2933] leading-tight">
                        {stop.name}
                      </h4>
                      <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-gray-100 text-[#6B7280]">
                        Kampus {stop.campus}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#6B7280] mt-0.5 line-clamp-1">
                      {stop.description}
                    </p>

                    <div className="flex items-center gap-3 mt-1.5 text-[11px]">
                      <span className="flex items-center gap-1 text-[#1F2933] font-semibold">
                        <span className="material-symbols-outlined text-[13px] text-[#C8102E]">
                          near_me
                        </span>
                        {distance} ({eta})
                      </span>
                      <span className="text-[#6B7280]">
                        &bull; UISI-01
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] font-medium text-[#2E7350]">
                      Kursi tersisa {remainingSeats} dari {shuttleState.capacity}
                    </p>
                  </div>
                </div>

                {/* Selection Check Icon */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors shrink-0 mt-1 ${
                    isSelected
                      ? 'bg-[#C8102E] border-[#C8102E] text-white'
                      : 'border-gray-300 bg-white text-transparent'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">check</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Sticky Bottom Action (Primary button 48px red radius 12) */}
      <div className="p-4 bg-white border-t border-[#E5E7EB] sticky bottom-0 z-20">
        <button
          onClick={() => onConfirmPickup(selected)}
          disabled={!selected}
          className="w-full h-12 bg-[#C8102E] hover:bg-[#9B0D24] text-white font-semibold rounded-xl text-sm transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
        >
          <span>Konfirmasi Titik Jemput</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};
