import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShuttleState, RideRequest, DutyStatus } from '../types/shuttle';
import { shuttleService } from '../services/shuttleService';

interface DriverSimulatorDrawerProps {
  shuttleState: ShuttleState;
  activeRequest?: RideRequest | null;
  onSimulateOfflineToggle?: () => void;
  isSimulatedOffline?: boolean;
}

export const DriverSimulatorDrawer: React.FC<DriverSimulatorDrawerProps> = ({
  shuttleState,
  activeRequest,
  onSimulateOfflineToggle,
  isSimulatedOffline = false
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const incidentsList = [
    'Macet Gerbang Utama',
    'Antrean Penumpang Melebihi Kuota',
    'Kendala Teknis Armada',
    'Hujan Deras / Jalur Licin',
    'Perbaikan Jalan Kampus'
  ];

  return (
    <>
      {/* Floating trigger button on top-left or bottom side */}
      <div className="fixed top-3 left-3 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#1F2933] text-white text-[11px] font-semibold rounded-lg shadow-md hover:bg-black transition-transform active:scale-95 border border-white/20"
          title="Buka panel simulasi aksi sopir untuk pengujian realtime"
        >
          <span className="material-symbols-outlined text-[15px] text-[#2E9E5B] animate-pulse">
            sensors
          </span>
          <span>Simulasi Sopir</span>
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 320 }}
              className="relative w-full max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 bg-[#1F2933] text-white flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#F2A900] text-[20px]">
                      tune
                    </span>
                    <h3 className="font-semibold text-sm">Sandbox Aksi Sopir</h3>
                  </div>
                  <p className="text-[11px] text-gray-300 mt-0.5">
                    UISI-01 &bull; Pak Budi Santoso
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {/* Scrollable controls */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                {/* Active Ride Controls */}
                <div className="bg-[#F5F5F6] p-3 rounded-xl border border-[#E5E7EB]">
                  <h4 className="font-semibold text-[#1F2933] mb-1.5 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#C8102E]">
                      hail
                    </span>
                    Aksi Pesanan Aktif
                  </h4>

                  {activeRequest ? (
                    <div className="space-y-2">
                      <div className="bg-white p-2 rounded-lg border border-gray-200 text-[11px]">
                        <div className="font-semibold text-[#1F2933]">{activeRequest.studentName}</div>
                        <div className="text-gray-500">
                          {activeRequest.from} &rarr; {activeRequest.to}
                        </div>
                        <div className="mt-1 flex gap-2 text-[10px]">
                          <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-700 font-medium">
                            Status: {activeRequest.status}
                          </span>
                          <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded font-medium">
                            Step: {activeRequest.driverStep || 'pending'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-1.5 pt-1">
                        <button
                          onClick={() => {
                            shuttleService.driverAcceptRequest(activeRequest.id);
                          }}
                          className="w-full py-1.5 px-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 active:scale-98 text-left flex items-center justify-between"
                        >
                          <span>1. Terima Penjemputan</span>
                          <span className="material-symbols-outlined text-[14px]">check</span>
                        </button>

                        <button
                          onClick={() => {
                            shuttleService.driverHeadingToPickup(activeRequest.id, 250);
                          }}
                          className="w-full py-1.5 px-2 bg-indigo-600 text-white rounded font-medium hover:bg-indigo-700 active:scale-98 text-left flex items-center justify-between"
                        >
                          <span>2. Menuju Titik Jemput</span>
                          <span className="material-symbols-outlined text-[14px]">near_me</span>
                        </button>

                        <button
                          onClick={() => {
                            shuttleService.driverNotifyNear(activeRequest.id);
                          }}
                          className="w-full py-1.5 px-2 bg-amber-600 text-white rounded font-medium hover:bg-amber-700 active:scale-98 text-left flex items-center justify-between"
                        >
                          <span>3. Beri Tahu (Hampir Tiba &le;150m)</span>
                          <span className="material-symbols-outlined text-[14px]">notifications_active</span>
                        </button>

                        <div className="grid grid-cols-2 gap-1">
                          <button
                            onClick={() => {
                              shuttleService.driverArrivedAtStop(activeRequest.from, 4.5);
                            }}
                            className="py-1.5 px-2 bg-emerald-600 text-white rounded font-medium hover:bg-emerald-700 active:scale-98 text-center"
                          >
                            4. Sudah Tiba (4:30)
                          </button>
                          <button
                            onClick={() => {
                              shuttleService.driverArrivedAtStop(activeRequest.from, 5);
                            }}
                            className="py-1.5 px-2 bg-emerald-700 text-white rounded font-medium hover:bg-emerald-800 active:scale-98 text-center"
                          >
                            Tiba (5m)
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-1">
                          <button
                            onClick={() => {
                              shuttleService.driverAddDwellTime(2);
                            }}
                            className="py-1.5 px-2 bg-teal-600 text-white rounded font-medium hover:bg-teal-700 active:scale-98 text-center"
                          >
                            +2 Menit Tunggu
                          </button>
                          <button
                            onClick={() => {
                              shuttleService.driverConfirmPassenger(activeRequest.id);
                            }}
                            className="py-1.5 px-2 bg-purple-600 text-white rounded font-medium hover:bg-purple-700 active:scale-98 text-center"
                          >
                            Konfirmasi Naik
                          </button>
                        </div>

                        <button
                          onClick={() => {
                            shuttleService.driverDepartDirectly(activeRequest.to);
                          }}
                          className="w-full py-1.5 px-2 bg-sky-600 text-white rounded font-medium hover:bg-sky-700 active:scale-98 text-left flex items-center justify-between"
                        >
                          <span>5. Langsung Berangkat / Melaju</span>
                          <span className="material-symbols-outlined text-[14px]">directions_bus</span>
                        </button>

                        <button
                          onClick={() => {
                            shuttleService.driverNotifyNearDestination(activeRequest.id);
                          }}
                          className="w-full py-1.5 px-2 bg-orange-600 text-white rounded font-medium hover:bg-orange-700 active:scale-98 text-left flex items-center justify-between"
                        >
                          <span>6. Beri Tahu (Hampir Sampai Tujuan)</span>
                          <span className="material-symbols-outlined text-[14px]">campaign</span>
                        </button>

                        <button
                          onClick={() => {
                            shuttleService.driverArrivedDestination(activeRequest.to);
                          }}
                          className="w-full py-1.5 px-2 bg-green-700 text-white rounded font-semibold hover:bg-green-800 active:scale-98 text-left flex items-center justify-between shadow-sm"
                        >
                          <span>7. Sudah Sampai (Selesai Otomatis)</span>
                          <span className="material-symbols-outlined text-[14px]">task_alt</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-[11px] italic">
                      Tidak ada pesanan aktif. Pesan shuttle terlebih dahulu untuk menguji alur penjemputan.
                    </p>
                  )}
                </div>

                {/* Duty Status Simulation */}
                <div className="bg-[#F5F5F6] p-3 rounded-xl border border-[#E5E7EB]">
                  <h4 className="font-semibold text-[#1F2933] mb-2 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-blue-600">
                      badge
                    </span>
                    Status Sopir (Duty)
                  </h4>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => shuttleService.setDriverDuty('on')}
                      className={`py-1.5 rounded font-medium border text-center transition-all ${
                        shuttleState.dutyStatus === 'on'
                          ? 'bg-[#2E9E5B] text-white border-[#2E9E5B]'
                          : 'bg-white text-gray-700 border-gray-300'
                      }`}
                    >
                      On Duty
                    </button>
                    <button
                      onClick={() => shuttleService.setDriverDuty('break', '10.45')}
                      className={`py-1.5 rounded font-medium border text-center transition-all ${
                        shuttleState.dutyStatus === 'break'
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-white text-gray-700 border-gray-300'
                      }`}
                    >
                      Istirahat
                    </button>
                    <button
                      onClick={() => shuttleService.setDriverDuty('off')}
                      className={`py-1.5 rounded font-medium border text-center transition-all ${
                        shuttleState.dutyStatus === 'off'
                          ? 'bg-[#C8102E] text-white border-[#C8102E]'
                          : 'bg-white text-gray-700 border-gray-300'
                      }`}
                    >
                      Off Duty
                    </button>
                  </div>
                </div>

                {/* Capacity & Seats Simulation */}
                <div className="bg-[#F5F5F6] p-3 rounded-xl border border-[#E5E7EB]">
                  <h4 className="font-semibold text-[#1F2933] mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-purple-600">
                        airline_seat_recline_normal
                      </span>
                      Kursi Terpakai
                    </span>
                    <span className="font-bold text-[#C8102E]">
                      {shuttleState.seatsUsed} / {shuttleState.capacity}
                    </span>
                  </h4>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="14"
                      value={shuttleState.seatsUsed}
                      onChange={(e) => shuttleService.setSeatsUsed(parseInt(e.target.value, 10))}
                      className="w-full accent-[#C8102E]"
                    />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => shuttleService.setSeatsUsed(8)}
                      className="flex-1 py-1 bg-white border border-gray-200 rounded text-[10px] text-gray-700"
                    >
                      Normal (8/14)
                    </button>
                    <button
                      onClick={() => shuttleService.setSeatsUsed(14)}
                      className="flex-1 py-1 bg-red-50 border border-red-200 rounded text-[10px] text-red-700 font-semibold"
                    >
                      Penuh (14/14)
                    </button>
                  </div>
                </div>

                {/* Driver Incidents */}
                <div className="bg-[#F5F5F6] p-3 rounded-xl border border-[#E5E7EB]">
                  <h4 className="font-semibold text-[#1F2933] mb-1.5 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#F2A900]">
                      warning
                    </span>
                    Kirim Kendala / Incident
                  </h4>
                  <div className="space-y-1">
                    {incidentsList.map((inc) => (
                      <button
                        key={inc}
                        onClick={() =>
                          shuttleService.reportIncident(
                            inc,
                            'Keterlambatan sekitar 5-10 menit. Mohon menunggu.'
                          )
                        }
                        className="w-full py-1 px-2 text-left bg-white hover:bg-amber-50 border border-gray-200 rounded text-[11px] truncate transition-colors"
                      >
                        {inc}
                      </button>
                    ))}
                    <button
                      onClick={() => shuttleService.clearIncident()}
                      className="w-full py-1 px-2 text-center text-gray-500 hover:text-gray-800 text-[10px] mt-1 font-medium"
                    >
                      Bersihkan Kendala
                    </button>
                  </div>
                </div>

                {/* Driver Quick Chat messages */}
                {activeRequest && (
                  <div className="bg-[#F5F5F6] p-3 rounded-xl border border-[#E5E7EB]">
                    <h4 className="font-semibold text-[#1F2933] mb-1.5 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-emerald-600">
                        chat
                      </span>
                      Kirim Chat dari Sopir
                    </h4>
                    <div className="space-y-1">
                      {[
                        'Sudah sampai di halte!',
                        'Pintu dibuka, silakan naik.',
                        'Menunggu 2 menit lagi.',
                        'Shuttle segera melaju.'
                      ].map((txt) => (
                        <button
                          key={txt}
                          onClick={() => shuttleService.sendChatMessage(activeRequest.id, 'driver', txt)}
                          className="w-full py-1 px-2 text-left bg-white hover:bg-emerald-50 border border-gray-200 rounded text-[11px] truncate transition-colors"
                        >
                          "{txt}"
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Offline Simulation toggle */}
                {onSimulateOfflineToggle && (
                  <div className="pt-2">
                    <button
                      onClick={onSimulateOfflineToggle}
                      className={`w-full py-2 px-3 rounded-lg font-medium text-xs flex items-center justify-center gap-1.5 border transition-all ${
                        isSimulatedOffline
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {isSimulatedOffline ? 'wifi_off' : 'wifi'}
                      </span>
                      <span>
                        {isSimulatedOffline ? 'Matikan Mode Offline' : 'Simulasi Mode Offline'}
                      </span>
                    </button>
                  </div>
                )}

                {/* Reset Data */}
                <div className="pt-1">
                  <button
                    onClick={() => {
                      if (confirm('Reset ulang data simulasi ke awal?')) {
                        shuttleService.resetDemoData();
                      }
                    }}
                    className="w-full py-1.5 text-center text-xs text-red-600 hover:text-red-700 font-medium"
                  >
                    Reset Data Demo
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
