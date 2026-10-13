import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Check, MapPin, Minus, Plus, Send } from 'lucide-react';
import { ShuttleState, StudentUser } from '../../types/shuttle';
import { SHUTTLE_STOPS } from '../../services/shuttleService';
import { CampusMap } from '../Map/CampusMap';

interface DestinationScreenProps {
  pickupStop: string;
  shuttleState: ShuttleState;
  currentUser: StudentUser;
  onBack: () => void;
  onSubmitBooking: (bookingData: {
    from: string;
    to: string;
    passengerCount: number;
    note?: string;
    dropoffNote?: string;
  }) => void;
}

export const DestinationScreen: React.FC<DestinationScreenProps> = ({
  pickupStop,
  shuttleState,
  currentUser,
  onBack,
  onSubmitBooking
}) => {
  const otherStops = SHUTTLE_STOPS.filter((stop) => stop.name !== pickupStop);
  const [selectedDestination, setSelectedDestination] = useState(otherStops[0]?.name || '');
  const [passengerCount, setPassengerCount] = useState(1);
  const [note, setNote] = useState('');
  const [selectedDropoff, setSelectedDropoff] = useState('');
  const dropoffOptions = ['Turun di Lobi Barat', 'Turun di gerbang', 'Bebas'];

  const handleSubmit = () => {
    if (!selectedDestination) return;
    onSubmitBooking({
      from: pickupStop,
      to: selectedDestination,
      passengerCount,
      note: note.trim() || undefined,
      dropoffNote: selectedDropoff || undefined
    });
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-[#F5F5F6]">
      <header className="shrink-0 bg-white px-4 py-3 border-b border-[#E5E7EB] flex items-center gap-3">
        <button onClick={onBack} className="w-9 h-9 flex items-center justify-center" aria-label="Kembali">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-base font-bold text-[#1F2933]">Pilih Tujuan</h1>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
        <section>
          <p className="text-xs font-semibold text-[#6B7280] mb-2">Dari</p>
          <button
            onClick={onBack}
            className="min-h-10 px-3 rounded-full bg-white border border-[#C8102E]/30 inline-flex items-center gap-2 text-xs font-semibold text-[#1F2933]"
          >
            <MapPin size={15} className="text-[#C8102E]" />
            <span>{pickupStop}</span>
            <span className="ml-1 text-[#C8102E]">Ubah</span>
          </button>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-[#1F2933] mb-2">Ke</h2>
          <div className="space-y-2">
            {otherStops.map((stop) => {
              const isSelected = selectedDestination === stop.name;
              return (
                <motion.button
                  key={stop.id}
                  type="button"
                  onClick={() => setSelectedDestination(stop.name)}
                  animate={{ scale: isSelected ? 1.015 : 1, borderColor: isSelected ? '#C8102E' : '#E5E7EB' }}
                  transition={{ duration: 0.18 }}
                  className={`w-full p-3 rounded-xl border bg-white flex items-center justify-between text-left ${isSelected ? 'ring-1 ring-[#C8102E]/15' : ''}`}
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <MapPin size={18} className={isSelected ? 'text-[#C8102E]' : 'text-[#7A858C]'} />
                    <span className="min-w-0">
                      <span className="block font-heading text-sm font-semibold text-[#1F2933]">{stop.name}</span>
                      <span className="block mt-0.5 text-[11px] text-[#6B7280]">sekitar 8 menit</span>
                    </span>
                  </span>
                  <span className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'bg-[#C8102E] border-[#C8102E] text-white' : 'border-[#D1D5DB] text-transparent'}`}>
                    <Check size={13} />
                  </span>
                </motion.button>
              );
            })}
          </div>
        </section>

        <div className="h-32 overflow-hidden rounded-xl border border-[#E5E7EB]">
          <CampusMap
            shuttleState={shuttleState}
            selectedPickup={pickupStop}
            selectedDestination={selectedDestination}
            interactive={false}
            compact
            showSelectedRoute
          />
        </div>

        <section className="bg-white p-3 rounded-xl border border-[#E5E7EB] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[#1F2933]">Jumlah penumpang</h2>
            <p className="text-[11px] text-[#6B7280] mt-0.5">Maksimal 4 orang</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPassengerCount((count) => Math.max(1, count - 1))}
              disabled={passengerCount === 1}
              className="w-9 h-9 rounded-lg border border-[#E5E7EB] flex items-center justify-center disabled:opacity-40"
              aria-label="Kurangi penumpang"
            ><Minus size={16} /></button>
            <span className="w-4 text-center font-semibold">{passengerCount}</span>
            <button
              type="button"
              onClick={() => setPassengerCount((count) => Math.min(4, count + 1))}
              disabled={passengerCount === 4}
              className="w-9 h-9 rounded-lg border border-[#E5E7EB] flex items-center justify-center disabled:opacity-40"
              aria-label="Tambah penumpang"
            ><Plus size={16} /></button>
          </div>
        </section>

        <section>
          <h2 className="text-xs font-semibold text-[#1F2933] mb-2">Lokasi turun</h2>
          <div className="flex flex-wrap gap-2">
            {dropoffOptions.map((option) => {
              const isSelected = selectedDropoff === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSelectedDropoff(isSelected ? '' : option)}
                  className={`min-h-8 px-3 rounded-full border text-xs font-medium transition-colors ${isSelected ? 'bg-[#C8102E] text-white border-[#C8102E]' : 'bg-white text-[#6B7280] border-[#E5E7EB]'}`}
                >{option}</button>
              );
            })}
          </div>
        </section>

        <label className="block">
          <span className="block text-xs font-semibold text-[#1F2933] mb-2">Catatan (opsional)</span>
          <input
            type="text"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Contoh: Rombongan Lab Fisika"
            className="w-full h-11 px-3 text-sm bg-white rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#C8102E]"
          />
        </label>
        <p className="text-[11px] text-[#7A858C]">Pemesan: {currentUser.name} · {currentUser.nim}</p>
      </div>

      <div className="shrink-0 p-4 bg-white border-t border-[#E5E7EB]">
        <button
          onClick={handleSubmit}
          disabled={!selectedDestination}
          className="w-full h-12 bg-[#C8102E] hover:bg-[#9B0D24] text-white font-semibold rounded-xl text-sm transition-all shadow-md active:scale-[0.98] disabled:opacity-45 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Send size={17} />
          <span>Kirim ke Sopir</span>
        </button>
      </div>
    </div>
  );
};