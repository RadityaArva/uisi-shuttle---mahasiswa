import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft,
  BusFront,
  Check,
  CheckCircle2,
  CircleHelp,
  Clock3,
  MapPin,
  MessageCircle,
  Phone,
  Route,
  X
} from 'lucide-react';
import { RideRequest, ShuttleState, Incident } from '../../types/shuttle';
import { shuttleService, SHUTTLE_INFO } from '../../services/shuttleService';
import { CampusMap } from '../Map/CampusMap';
import { useToast } from '../Header/ToastBanner';

interface WaitingRoomScreenProps {
  request: RideRequest;
  shuttleState: ShuttleState;
  incidents: Incident[];
  onOpenChat: () => void;
  onReturnHome: () => void;
  onBookAgain: () => void;
}

const STEPS = ['Permintaan terkirim', 'Sopir menerima', 'Menuju titikmu', 'Shuttle tiba'];
const CANCEL_REASONS = [
  'Berangkat bersama teman',
  'Kelas dibatalkan',
  'Salah pilih titik',
  'Lainnya'
];

const timeToMinutes = (value?: string) => {
  if (!value) return null;
  const match = value.match(/(\d{1,2}):(\d{2})/);
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
};

const elapsedBetween = (start?: string, end?: string) => {
  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);
  if (startMinutes === null || endMinutes === null) return '—';
  return `${(endMinutes - startMinutes + 1440) % 1440} menit`;
};

const formatDepartureTime = (endsAt?: number) => {
  if (!endsAt) return '07.30';
  return new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })
    .format(new Date(endsAt))
    .replace(':', '.');
};

export const WaitingRoomScreen: React.FC<WaitingRoomScreenProps> = ({
  request,
  shuttleState,
  incidents,
  onOpenChat,
  onReturnHome,
  onBookAgain
}) => {
  const { showToast } = useToast();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedCancelReason, setSelectedCancelReason] = useState(CANCEL_REASONS[0]);
  const [dwellSecondsLeft, setDwellSecondsLeft] = useState(0);
  const [pendingSeconds, setPendingSeconds] = useState(0);
  const lastDwellTotalRef = useRef<number | undefined>(shuttleState.dwell?.totalSeconds);
  const offDutyCancelledRef = useRef<string | null>(null);

  useEffect(() => {
    const interval = window.setInterval(() => setPendingSeconds((seconds) => seconds + 1), 1000);
    return () => window.clearInterval(interval);
  }, [request.id]);

  useEffect(() => {
    if (!shuttleState.dwell) {
      setDwellSecondsLeft(0);
      return;
    }
    const updateTimer = () => {
      setDwellSecondsLeft(Math.max(0, Math.ceil((shuttleState.dwell!.endsAt - Date.now()) / 1000)));
    };
    updateTimer();
    const interval = window.setInterval(updateTimer, 250);
    return () => window.clearInterval(interval);
  }, [shuttleState.dwell]);

  useEffect(() => {
    const currentTotal = shuttleState.dwell?.totalSeconds;
    const previousTotal = lastDwellTotalRef.current;
    if (previousTotal !== undefined && currentTotal !== undefined && currentTotal > previousTotal) {
      showToast({
        type: 'info',
        title: 'Waktu tunggu diperbarui',
        message: 'Sopir menambah waktu 2 menit'
      });
    }
    lastDwellTotalRef.current = currentTotal;
  }, [shuttleState.dwell?.totalSeconds, showToast]);

  useEffect(() => {
    const canAutoCancel = request.status === 'pending' &&
      request.driverStep !== 'arrived' &&
      shuttleState.dutyStatus === 'off' &&
      offDutyCancelledRef.current !== request.id;
    if (canAutoCancel) {
      offDutyCancelledRef.current = request.id;
      shuttleService.cancelRideRequest(request.id, 'Shuttle berhenti beroperasi');
    }
  }, [request.id, request.status, request.driverStep, shuttleState.dutyStatus]);

  const driverStep = request.driverStep || 'pending';
  const isCompleted = request.status === 'completed';
  const isCancelled = request.status === 'cancelled';
  const isInTrip = request.status === 'transit' || driverStep === 'on_board';
  const isArrived = !isInTrip && request.status === 'pending' && (
    driverStep === 'arrived' || (shuttleState.atStop && shuttleState.currentStop === request.from)
  );
  const isNearArrival = !isArrived && !isInTrip && driverStep === 'heading' && shuttleState.distanceMeters <= 150;
  const currentStep = isInTrip || isCompleted
    ? 4
    : isArrived
    ? 4
    : driverStep === 'heading'
    ? 3
    : driverStep === 'accepted'
    ? 2
    : 1;
  const isLast30Seconds = dwellSecondsLeft <= 30 && dwellSecondsLeft > 0;
  const totalDwell = shuttleState.dwell?.totalSeconds || 270;
  const ringRadius = 68;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringProgress = Math.max(0, Math.min(1, dwellSecondsLeft / totalDwell));
  const ringOffset = ringCircumference * (1 - ringProgress);
  const dwellTime = `${String(Math.floor(dwellSecondsLeft / 60)).padStart(2, '0')}:${String(dwellSecondsLeft % 60).padStart(2, '0')}`;
  const etaMinutes = Math.max(1, Math.ceil(shuttleState.distanceMeters / 125));
  const latestIncident = incidents[0];
  const routeProgress = Math.max(0.06, Math.min(1, 1 - shuttleState.distanceMeters / 700));
  const isSlowToRespond = request.status === 'pending' && driverStep === 'pending' && pendingSeconds >= 60;

  const handleCancel = () => {
    shuttleService.cancelRideRequest(request.id, selectedCancelReason);
    setShowCancelModal(false);
    showToast({
      type: 'info',
      title: 'Pesanan dibatalkan',
      message: `Pesanan dibatalkan: ${selectedCancelReason}`
    });
  };

  const markWalking = () => {
    shuttleService.setBoardingStatus(request.id, 'walking');
    showToast({ type: 'info', message: 'Status diperbarui: kamu sedang menuju titik jemput' });
  };

  const markBoarded = () => {
    shuttleService.setBoardingStatus(request.id, 'boarded');
    showToast({ type: 'success', title: 'Berhasil naik', message: 'Status naik telah dikirim ke sopir' });
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-[#F5F5F6] overflow-hidden">
      <header className="shrink-0 bg-white border-b border-[#E5E7EB] px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled
            aria-label="Kembali"
            className="w-8 h-8 -ml-1 flex items-center justify-center text-[#AEB4B9] cursor-not-allowed"
          ><ArrowLeft size={20} /></button>
          <h1 className="text-base font-bold text-[#1F2933]">Status Pesanan</h1>
        </div>
        <div className="mt-2 inline-flex max-w-full items-center gap-2 rounded-full bg-[#F1F3F4] px-3 py-1.5 text-[11px] font-semibold text-[#47515A]">
          <span className="truncate">{request.from}</span>
          <span className="text-[#C8102E] shrink-0">&gt;</span>
          <span className="truncate">{request.to}</span>
          <span className="text-[#7A858C] shrink-0">• {request.passengerCount} orang</span>
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <AnimatePresence mode="wait">
          {isCancelled ? (
            <motion.section key="cancelled" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-4 space-y-4">
              <DriverCard onOpenChat={onOpenChat} />
              <StepIndicator currentStep={currentStep} />
              {request.cancelReason === 'Shuttle berhenti beroperasi' && (
                <AnimatedBanner tone="red" icon={<CircleHelp size={18} />}>
                  Shuttle berhenti beroperasi, pesananmu dibatalkan
                </AnimatedBanner>
              )}
              <div className="bg-[#ECEFF1] border border-[#D7DDE1] rounded-xl p-5 text-center">
                <div className="mx-auto w-14 h-14 rounded-full bg-[#DDE2E5] text-[#657078] flex items-center justify-center mb-3"><X size={26} /></div>
                <h2 className="text-base font-bold text-[#38434B]">Pesanan dibatalkan</h2>
                <p className="text-xs text-[#6B7280] mt-1">{request.statusLabel || 'Pesanan dibatalkan'}</p>
                {request.cancelReason && <p className="text-xs text-[#6B7280] mt-2">{request.cancelReason}</p>}
              </div>
              <button onClick={onBookAgain} className="w-full h-12 rounded-xl bg-[#C8102E] text-white font-semibold text-sm">Pesan Lagi</button>
            </motion.section>
          ) : isCompleted ? (
            <motion.section key="completed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-4">
              <DriverCard onOpenChat={onOpenChat} />
              <StepIndicator currentStep={currentStep} />
              <div className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-6 text-center">
                <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 16 }} className="mx-auto w-24 h-24 rounded-full bg-[#E8F5E9] border border-[#B7DFC5] flex items-center justify-center mb-4">
                  <svg viewBox="0 0 48 48" className="w-12 h-12" fill="none" aria-hidden="true">
                    <motion.path d="M10 25.5 20 35l19-22" stroke="#2E9E5B" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: 0.15 }} />
                  </svg>
                </motion.div>
                <h2 className="text-lg font-bold text-[#1F2933]">Kamu sudah sampai di {request.to}</h2>
                <span className="inline-flex mt-3 px-3 py-1.5 rounded-full bg-[#E8F5E9] text-[#226B40] text-xs font-semibold">
                  {request.statusLabel || `Pesanan Selesai Otomatis (${request.completedAt || '07:40 WIB'})`}
                </span>
              </div>
              <TripSummary request={request} />
              <button onClick={onReturnHome} className="w-full h-12 rounded-xl bg-[#C8102E] hover:bg-[#9B0D24] text-white font-semibold text-sm">Kembali ke Beranda</button>
            </motion.section>
          ) : (
            <motion.section key="active" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="p-3.5 space-y-3">
              <AnimatePresence>
                {shuttleState.dutyStatus === 'break' && request.status === 'pending' && (
                  <AnimatedBanner key="driver-break" tone="yellow" icon={<Clock3 size={18} />}>
                    Shuttle sedang istirahat, kembali sekitar {shuttleState.breakReturnAt || '10.45'}
                  </AnimatedBanner>
                )}
                {shuttleState.dutyStatus === 'off' && request.status === 'pending' && (
                  <AnimatedBanner key="driver-off" tone="red" icon={<CircleHelp size={18} />}>
                    Shuttle berhenti beroperasi, pesananmu dibatalkan
                  </AnimatedBanner>
                )}
                {isSlowToRespond && (
                  <AnimatedBanner key="slow-response" tone="yellow" icon={<Clock3 size={18} />}>
                    Sopir belum merespons, coba lagi atau hubungi sopir
                  </AnimatedBanner>
                )}
                {isNearArrival && (
                  <AnimatedBanner key="near-pickup" tone="green" icon={<MapPin size={20} className="animate-pulse" />}>
                    <span className="block font-bold">Shuttle hampir tiba, bersiap di titik jemput {request.from}</span>
                    <span className="block mt-0.5">{shuttleState.distanceMeters} m lagi</span>
                  </AnimatedBanner>
                )}
                {isArrived && (
                  <AnimatedBanner key="arrived-pickup" tone="green" icon={<BusFront size={19} />}>
                    Shuttle sudah tiba, pintu dibuka di {request.from}
                  </AnimatedBanner>
                )}
                {isInTrip && latestIncident && (
                  <AnimatedBanner key={`incident-${latestIncident.createdAt}`} tone="yellow" icon={<CircleHelp size={18} />}>
                    <span className="block font-bold">Shuttle terlambat: {latestIncident.type}</span>
                    <span className="block mt-0.5">{latestIncident.note}</span>
                  </AnimatedBanner>
                )}
                {isInTrip && shuttleState.distanceMeters <= 120 && (
                  <AnimatedBanner key="near-destination" tone="yellow" icon={<MapPin size={19} className="animate-pulse" />}>
                    Bersiap turun di {request.to}
                  </AnimatedBanner>
                )}
                {isInTrip && shuttleState.nextStopType === 'destination' && shuttleState.atStop === false && shuttleState.distanceMeters > 120 && (
                  <AnimatedBanner key="departed" tone="green" icon={<BusFront size={18} />}>
                    Shuttle berangkat menuju {request.to}
                  </AnimatedBanner>
                )}
              </AnimatePresence>

              <DriverCard onOpenChat={onOpenChat} />
              <StepIndicator currentStep={currentStep} />

              <div className={`relative w-full overflow-hidden rounded-xl border border-[#DCE2E1] ${isInTrip ? 'h-52' : 'h-44'}`}>
                <CampusMap
                  shuttleState={shuttleState}
                  selectedPickup={request.from}
                  selectedDestination={request.to}
                  interactive={false}
                  compact
                  showSelectedRoute={isInTrip}
                  showShuttleRoute={!isInTrip && !isArrived && driverStep === 'heading'}
                  focusZoom
                />
                <div className="absolute left-2 bottom-2 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-[#37434A] shadow-sm">
                  <BusFront size={13} className="text-[#C8102E]" /> UISI-01 di rute
                </div>
              </div>

              {!isInTrip && !isArrived && (
                <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 text-center">
                  {driverStep === 'pending' ? (
                    <>
                      <div className="mx-auto w-10 h-10 rounded-full bg-[#F1F3F4] flex items-center justify-center text-[#69747C] mb-2"><Clock3 size={20} /></div>
                      <h2 className="text-sm font-semibold text-[#1F2933]">Menunggu sopir menerima</h2>
                    </>
                  ) : driverStep === 'accepted' ? (
                    <>
                      <span className="text-xs font-semibold text-[#2E7350]">Permintaan diterima sopir</span>
                      <h2 className="text-sm font-semibold text-[#1F2933] mt-1">Sopir sedang bersiap</h2>
                    </>
                  ) : (
                    <>
                      <motion.div key={etaMinutes} initial={{ opacity: 0.3, y: 5 }} animate={{ opacity: 1, y: 0 }} className="font-heading text-[36px] leading-10 font-bold text-[#C8102E]">{etaMinutes} menit</motion.div>
                      <p className="text-xs text-[#6B7280] mt-1">{shuttleState.distanceMeters} m dari titik jemput</p>
                    </>
                  )}
                  {isNearArrival && request.boarding === 'walking' && (
                    <span className="inline-flex mt-2 px-2.5 py-1 rounded-full bg-[#E8F5E9] text-[#226B40] text-[11px] font-semibold">Sedang menuju titik</span>
                  )}
                </div>
              )}

              {isArrived && (
                <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 flex flex-col items-center text-center">
                  <div className="text-[11px] font-semibold text-[#6B7280] mb-2">Waktu menunggu keberangkatan</div>
                  <motion.div animate={isLast30Seconds ? { scale: [1, 1.025, 1] } : { scale: 1 }} transition={isLast30Seconds ? { repeat: Infinity, duration: 0.9 } : undefined} className="relative w-40 h-40 flex items-center justify-center">
                    <svg viewBox="0 0 160 160" className="absolute inset-0 -rotate-90">
                      <circle cx="80" cy="80" r={ringRadius} stroke="#EEF0F1" strokeWidth="8" fill="none" />
                      <motion.circle cx="80" cy="80" r={ringRadius} stroke={isLast30Seconds ? '#E0A000' : '#C8102E'} strokeWidth="8" strokeDasharray={ringCircumference} strokeDashoffset={ringOffset} strokeLinecap="round" fill="none" animate={{ strokeDashoffset: ringOffset }} transition={{ duration: 0.4, ease: 'linear' }} />
                    </svg>
                    <div className="relative">
                      <div className="text-[10px] text-[#6B7280]">Berangkat dalam</div>
                      <div className={`font-heading text-[25px] leading-8 font-bold ${isLast30Seconds ? 'text-[#B47C00]' : 'text-[#C8102E]'}`}>{dwellTime}</div>
                    </div>
                  </motion.div>
                  <p className="text-xs font-medium text-[#1F2933] mt-2">Berangkat pukul {formatDepartureTime(shuttleState.dwell?.endsAt)}</p>
                  <p className="text-xs text-[#6B7280] mt-1">Segera naik sebelum shuttle berangkat</p>
                  {request.boarding === 'confirmed' && (
                    <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#E8F5E9] px-3 py-1 text-[11px] font-semibold text-[#226B40]"><CheckCircle2 size={14} /> Dikonfirmasi sopir</span>
                  )}
                  {request.boarding === 'boarded' ? (
                    <div className="w-full mt-3 h-11 rounded-xl bg-[#2E9E5B] text-white font-semibold text-sm flex items-center justify-center gap-2"><CheckCircle2 size={18} /> Sudah naik</div>
                  ) : request.boarding !== 'confirmed' ? (
                    <button onClick={markBoarded} className="w-full mt-3 h-11 rounded-xl bg-[#C8102E] hover:bg-[#9B0D24] text-white font-semibold text-sm flex items-center justify-center gap-2"><BusFront size={17} /> Saya Sudah Naik</button>
                  ) : null}
                </div>
              )}

              {isInTrip && (
                <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-semibold text-[#1F2933]">Dalam perjalanan ke {request.to}</h2>
                    </div>
                    <motion.div key={etaMinutes} initial={{ opacity: 0.35, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-right shrink-0">
                      <strong className="block font-heading text-xl text-[#C8102E]">{etaMinutes} mnt</strong>
                      <span className="text-[10px] text-[#6B7280]">estimasi tiba</span>
                    </motion.div>
                  </div>
                  <div className="h-2 rounded-full bg-[#EEF0F1] overflow-hidden">
                    <motion.div className="h-full rounded-full bg-[#C8102E]" initial={{ width: '4%' }} animate={{ width: `${routeProgress * 100}%` }} transition={{ duration: 0.7, ease: 'easeOut' }} />
                  </div>
                  <div className="flex justify-between text-[10px] font-medium text-[#69747C]">
                    <span className="max-w-[45%] truncate">{request.from}</span>
                    <span className="shrink-0">{Math.max(0, shuttleState.capacity - shuttleState.seatsUsed)} kursi tersisa · {shuttleState.seatsUsed}/{shuttleState.capacity}</span>
                    <span className="max-w-[35%] truncate text-right">{request.to}</span>
                  </div>
                </div>
              )}

              {request.status === 'pending' && !isArrived && (
                <div className="space-y-2">
                  {(driverStep === 'accepted' || driverStep === 'heading') && (
                    <button
                      onClick={markWalking}
                      disabled={request.boarding === 'walking'}
                      className={`w-full h-11 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 ${request.boarding === 'walking' ? 'bg-[#E8F5E9] border-[#B7DFC5] text-[#226B40]' : 'bg-white border-[#D8DEE1] text-[#1F2933]'}`}
                    >
                      {request.boarding === 'walking' ? <Check size={17} /> : <MapPin size={17} />}
                      {request.boarding === 'walking' ? 'Sedang menuju titik' : 'Saya Menuju Titik'}
                    </button>
                  )}
                  <button onClick={() => setShowCancelModal(true)} className="w-full h-11 rounded-xl border border-[#C8102E]/35 bg-white text-[#C8102E] font-semibold text-sm">Batalkan Pesanan</button>
                </div>
              )}
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showCancelModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3">
            <motion.button aria-label="Tutup dialog" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCancelModal(false)} className="absolute inset-0 bg-black/40" />
            <motion.div initial={{ y: 36, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 36, opacity: 0 }} transition={{ type: 'spring', damping: 24, stiffness: 260 }} className="relative z-10 w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-[#1F2933]">Batalkan pesanan?</h2>
                <button onClick={() => setShowCancelModal(false)} aria-label="Tutup" className="w-8 h-8 flex items-center justify-center text-[#6B7280]"><X size={18} /></button>
              </div>
              <p className="text-xs text-[#6B7280] mt-1">Pilih alasan pembatalan</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {CANCEL_REASONS.map((reason) => (
                  <button key={reason} onClick={() => setSelectedCancelReason(reason)} className={`px-3 py-2 rounded-full border text-xs font-medium ${selectedCancelReason === reason ? 'bg-[#FDECEE] border-[#C8102E] text-[#9B0D24]' : 'bg-white border-[#E5E7EB] text-[#56616A]'}`}>{reason}</button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 mt-5">
                <button onClick={() => setShowCancelModal(false)} className="h-11 rounded-lg border border-[#D8DEE1] text-sm font-semibold text-[#47515A]">Tidak</button>
                <button onClick={handleCancel} className="h-11 rounded-lg bg-[#C8102E] text-white text-sm font-semibold">Ya, batalkan</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

function DriverCard({ onOpenChat }: { onOpenChat: () => void }) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl p-3 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-11 h-11 rounded-full overflow-hidden bg-[#E6E9EA] shrink-0">
          <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80" alt="Pak Budi Santoso" className="w-full h-full object-cover" />
        </div>
        <div className="min-w-0">
          <h2 className="text-[13px] font-bold text-[#1F2933] truncate">Pak Budi Santoso</h2>
          <p className="text-[11px] text-[#6B7280] truncate">UISI-01 • W 1948 US</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button onClick={onOpenChat} className="h-9 px-2.5 rounded-lg bg-[#FDECEE] text-[#A10E27] text-xs font-semibold flex items-center gap-1.5"><MessageCircle size={15} /> Chat</button>
        <a href={`tel:${SHUTTLE_INFO.driverPhone}`} className="h-9 px-2.5 rounded-lg bg-[#EFF2F3] text-[#35424A] text-xs font-semibold flex items-center gap-1.5"><Phone size={15} /> Telepon</a>
      </div>
    </div>
  );
}

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl px-3 py-3">
      <div className="relative grid grid-cols-4">
        <div className="absolute left-[12.5%] right-[12.5%] top-[10px] h-0.5 bg-[#E5E9EA]">
          <motion.div className="h-full bg-[#C8102E]" initial={false} animate={{ width: `${((currentStep - 1) / 3) * 100}%` }} transition={{ duration: 0.65, ease: 'easeInOut' }} />
        </div>
        {STEPS.map((step, index) => {
          const stepNumber = index + 1;
          const active = stepNumber <= currentStep;
          return (
            <div key={step} className="relative z-10 flex flex-col items-center text-center">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${active ? 'bg-[#C8102E] text-white' : 'bg-white border border-[#CBD2D6] text-[#929CA2]'}`}>
                {active ? <Check size={12} strokeWidth={3} /> : <span className="text-[9px] font-semibold">{stepNumber}</span>}
              </div>
              <span className={`mt-1.5 max-w-[72px] text-[9px] leading-3 ${active ? 'font-semibold text-[#35414A]' : 'text-[#89939A]'}`}>{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AnimatedBanner({ tone, icon, children }: { tone: 'yellow' | 'green' | 'red'; icon: React.ReactNode; children: React.ReactNode }) {
  const toneClass = tone === 'yellow'
    ? 'bg-[#FFF5D4] border-[#E8D17D] text-[#6D5300]'
    : tone === 'green'
    ? 'bg-[#E8F5E9] border-[#B7DFC5] text-[#205D39]'
    : 'bg-[#FDECEE] border-[#E6B8C0] text-[#8D1427]';
  return (
    <motion.div initial={{ y: -18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} transition={{ type: 'spring', stiffness: 280, damping: 23 }} className={`rounded-xl border px-3 py-2.5 text-xs leading-4 flex items-start gap-2.5 ${toneClass}`}>
      <span className="shrink-0 mt-0.5">{icon}</span>
      <span>{children}</span>
    </motion.div>
  );
}

function TripSummary({ request }: { request: RideRequest }) {
  const rows = [
    ['Jemput', request.from],
    ['Tujuan', request.to],
    ['Waktu naik', request.boardedAt || '—'],
    ['Durasi', elapsedBetween(request.boardedAt, request.completedAt)],
    ['Jumlah penumpang', `${request.passengerCount} orang`]
  ];
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
      <h2 className="text-sm font-bold text-[#1F2933] pb-3 border-b border-[#E5E7EB]">Ringkasan perjalanan</h2>
      <dl className="space-y-3 mt-3">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-3 text-xs">
            <dt className="text-[#6B7280]">{label}</dt>
            <dd className="text-right font-semibold text-[#1F2933]">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}