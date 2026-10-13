import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RideRequest, ShuttleState } from '../../types/shuttle';
import { SHUTTLE_INFO } from '../../services/shuttleService';
import { CampusMap } from '../Map/CampusMap';

interface HistoryScreenProps {
  requests: RideRequest[];
  shuttleState: ShuttleState;
  onSelectRebook: (from: string, to: string) => void;
  onOpenChat: (req: RideRequest) => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  requests,
  shuttleState,
  onSelectRebook,
  onOpenChat
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'cancelled'>('all');
  const [selectedDetailReq, setSelectedDetailReq] = useState<RideRequest | null>(null);

  // Filter requests
  const filtered = requests.filter((r) => {
    if (statusFilter === 'all') return true;
    return r.status === statusFilter;
  });

  const totalCompleted = requests.filter((r) => r.status === 'completed').length;
  const totalCancelled = requests.filter((r) => r.status === 'cancelled').length;

  return (
    <div className="flex-1 flex flex-col bg-[#F5F5F6] overflow-y-auto">
      {/* Top Header */}
      <div className="bg-white px-4 py-3.5 border-b border-[#E5E7EB] sticky top-0 z-10 shadow-xs">
        <h2 className="text-base font-bold text-[#1F2933]">Riwayat Perjalanan</h2>
        <p className="text-[11px] text-[#6B7280]">
          Catatan penjemputan shuttle kampusmu
        </p>
      </div>

      <div className="p-4 space-y-4 flex-1">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white p-2.5 rounded-xl border border-[#E5E7EB] shadow-xs text-center">
            <span className="text-[10px] text-[#6B7280] font-semibold uppercase">Total</span>
            <div className="text-lg font-bold text-[#1F2933] mt-0.5">{requests.length}</div>
          </div>
          <div className="bg-[#E8F5E9]/50 p-2.5 rounded-xl border border-[#2E9E5B]/20 shadow-xs text-center">
            <span className="text-[10px] text-[#2E9E5B] font-semibold uppercase">Selesai</span>
            <div className="text-lg font-bold text-[#2E9E5B] mt-0.5">{totalCompleted}</div>
          </div>
          <div className="bg-[#FDECEE]/50 p-2.5 rounded-xl border border-[#C8102E]/20 shadow-xs text-center">
            <span className="text-[10px] text-[#C8102E] font-semibold uppercase">Batal</span>
            <div className="text-lg font-bold text-[#C8102E] mt-0.5">{totalCancelled}</div>
          </div>
        </div>

        {/* Status Filter Chips (32px chips) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setStatusFilter('all')}
            className={`h-8 px-3 rounded-full text-xs font-semibold border transition-all ${
              statusFilter === 'all'
                ? 'bg-[#1F2933] text-white border-[#1F2933]'
                : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:bg-gray-50'
            }`}
          >
            Semua ({requests.length})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`h-8 px-3 rounded-full text-xs font-semibold border transition-all ${
              statusFilter === 'completed'
                ? 'bg-[#2E9E5B] text-white border-[#2E9E5B]'
                : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:bg-gray-50'
            }`}
          >
            Selesai ({totalCompleted})
          </button>
          <button
            onClick={() => setStatusFilter('cancelled')}
            className={`h-8 px-3 rounded-full text-xs font-semibold border transition-all ${
              statusFilter === 'cancelled'
                ? 'bg-[#C8102E] text-white border-[#C8102E]'
                : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:bg-gray-50'
            }`}
          >
            Dibatalkan ({totalCancelled})
          </button>
        </div>

        {/* Requests List */}
        {filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center text-[#6B7280]">
            <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">
              history_toggle_off
            </span>
            <h4 className="text-sm font-bold text-[#1F2933]">Tidak ada riwayat</h4>
            <p className="text-xs text-gray-400 mt-1 max-w-xs">
              Belum ada data perjalanan sesuai filter yang dipilih.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map((req) => {
              const isCompleted = req.status === 'completed';
              return (
                <motion.div
                  key={req.id}
                  whileTap={{ scale: 0.99 }}
                  className="bg-white p-3 rounded-xl border border-[#E5E7EB] shadow-xs space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-[#C8102E]">
                          directions_bus
                        </span>
                        <h4 className="text-xs font-bold text-[#1F2933]">
                          {req.from} &rarr; {req.to}
                        </h4>
                      </div>
                      <div className="text-[11px] text-[#6B7280] mt-0.5 flex items-center gap-2">
                        <span>{req.requestedAt}</span>
                        <span>&bull;</span>
                        <span>{req.passengerCount} penumpang</span>
                      </div>
                    </div>

                    {/* Status Chip */}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isCompleted
                          ? 'bg-[#E8F5E9] text-[#2E9E5B]'
                          : 'bg-[#FDECEE] text-[#C8102E]'
                      }`}
                    >
                      {isCompleted ? 'Selesai' : 'Dibatalkan'}
                    </span>
                  </div>

                  {req.note && (
                    <div className="text-[11px] text-[#6B7280] bg-gray-50 px-2 py-1 rounded">
                      Catatan: {req.note}
                    </div>
                  )}

                  {/* Action buttons on card */}
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => onOpenChat(req)}
                      className="text-[#C8102E] font-semibold hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <span className="material-symbols-outlined text-[14px]">chat</span>
                      <span>Chat Sopir (Barang Tertinggal)</span>
                    </button>

                    <button
                      onClick={() => setSelectedDetailReq(req)}
                      className="text-[#1F2933] font-semibold text-[11px] hover:text-[#C8102E] flex items-center gap-0.5"
                    >
                      <span>Detail</span>
                      <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* DETAIL MODAL WITH ROUTE MAP & TIMELINE & "PESAN LAGI" */}
      <AnimatePresence>
        {selectedDetailReq && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDetailReq(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl max-h-[85vh] flex flex-col shadow-2xl z-10 overflow-hidden"
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-[#E5E7EB] flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#1F2933]">
                    Detail Perjalanan
                  </h3>
                  <p className="text-[11px] text-[#6B7280]">
                    ID: {selectedDetailReq.id}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedDetailReq(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {/* Body */}
              <div className="p-4 overflow-y-auto space-y-4">
                {/* Mini Route Map */}
                <div className="h-32 w-full rounded-xl overflow-hidden border border-[#E5E7EB]">
                  <CampusMap
                    shuttleState={shuttleState}
                    selectedPickup={selectedDetailReq.from}
                    selectedDestination={selectedDetailReq.to}
                    interactive={false}
                    compact={true}
                  />
                </div>

                {/* Timeline: Dikirim > Diterima > Dijemput > Sampai */}
                <div className="bg-[#F8FAFC] p-3 rounded-xl border border-gray-200">
                  <h4 className="text-xs font-bold text-[#1F2933] mb-3">
                    Timeline Perjalanan
                  </h4>
                  <div className="space-y-3 relative pl-4 border-l-2 border-red-200 ml-2 text-xs">
                    <div className="relative">
                      <div className="absolute -left-[21px] top-0.5 w-3 h-3 rounded-full bg-[#C8102E]" />
                      <div className="font-semibold text-[#1F2933]">Permintaan Dikirim</div>
                      <div className="text-[11px] text-[#6B7280]">{selectedDetailReq.requestedAt} &bull; {selectedDetailReq.from}</div>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[21px] top-0.5 w-3 h-3 rounded-full bg-[#C8102E]" />
                      <div className="font-semibold text-[#1F2933]">Diterima Sopir</div>
                      <div className="text-[11px] text-[#6B7280]">Pak Budi Santoso ({SHUTTLE_INFO.armada})</div>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[21px] top-0.5 w-3 h-3 rounded-full bg-[#C8102E]" />
                      <div className="font-semibold text-[#1F2933]">Dijemput di Halte</div>
                      <div className="text-[11px] text-[#6B7280]">{selectedDetailReq.passengerCount} penumpang naik</div>
                    </div>
                    <div className="relative">
                      <div className={`absolute -left-[21px] top-0.5 w-3 h-3 rounded-full ${selectedDetailReq.status === 'completed' ? 'bg-[#2E9E5B]' : 'bg-gray-400'}`} />
                      <div className="font-semibold text-[#1F2933]">
                        {selectedDetailReq.status === 'completed' ? 'Sampai di Tujuan' : 'Status Akhir'}
                      </div>
                      <div className="text-[11px] text-[#6B7280]">
                        {selectedDetailReq.statusLabel || (selectedDetailReq.status === 'completed' ? 'Selesai Otomatis' : 'Dibatalkan')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Driver Info */}
                <div className="bg-white p-3 rounded-xl border border-[#E5E7EB] flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-[#1F2933]">{SHUTTLE_INFO.driverName}</div>
                    <div className="text-[#6B7280] text-[11px]">{SHUTTLE_INFO.plat} &bull; {SHUTTLE_INFO.armada}</div>
                  </div>
                  <button
                    onClick={() => {
                      const req = selectedDetailReq;
                      setSelectedDetailReq(null);
                      onOpenChat(req);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#FDECEE] text-[#C8102E] font-semibold text-xs flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">chat</span>
                    <span>Chat Sopir</span>
                  </button>
                </div>
              </div>

              {/* Bottom "Pesan Lagi" button */}
              <div className="p-4 bg-white border-t border-[#E5E7EB]">
                <button
                  onClick={() => {
                    const from = selectedDetailReq.from;
                    const to = selectedDetailReq.to;
                    setSelectedDetailReq(null);
                    onSelectRebook(from, to);
                  }}
                  className="w-full h-12 bg-[#C8102E] hover:bg-[#9B0D24] text-white font-semibold rounded-xl text-sm transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">replay</span>
                  <span>Pesan Lagi Rute Ini</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
