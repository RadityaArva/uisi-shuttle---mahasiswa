/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShuttleState,
  RideRequest,
  Incident,
  StudentUser,
  AppNotification
} from './types/shuttle';
import {
  shuttleService,
  SHUTTLE_INFO
} from './services/shuttleService';
import {
  getStoredUser,
  saveStoredUser
} from './services/authService';
import { ToastProvider, useToast } from './components/Header/ToastBanner';
import { OfflineBanner } from './components/OfflineBanner';
import { BottomNav, MainTab } from './components/Navbar/BottomNav';
import { NotificationsModal } from './components/NotificationsModal';
import { DriverSimulatorDrawer } from './components/DriverSimulatorDrawer';
import { DashboardScreen } from './components/Screens/DashboardScreen';
import { LoginScreen } from './components/Screens/LoginScreen';
import { PickupSelectionScreen } from './components/Screens/PickupSelectionScreen';
import { DestinationScreen } from './components/Screens/DestinationScreen';
import { WaitingRoomScreen } from './components/Screens/WaitingRoomScreen';
import { RequestSentScreen } from './components/Screens/RequestSentScreen';
import { HistoryScreen } from './components/Screens/HistoryScreen';
import { ProfileScreen } from './components/Screens/ProfileScreen';
import { ChatModal } from './components/Chat/ChatModal';

export default function App() {
  return (
    <ToastProvider>
      <MainAppContent />
    </ToastProvider>
  );
}

function MainAppContent() {
  const { showToast } = useToast();

  // Authentication State
  const [currentUser, setCurrentUser] = useState<StudentUser | null>(() => {
    return getStoredUser();
  });

  // App Navigation & Tabs
  const [currentTab, setCurrentTab] = useState<MainTab>('shuttle');
  const [bookingStep, setBookingStep] = useState<'idle' | 'pickup' | 'destination'>('idle');
  const [selectedPickupStop, setSelectedPickupStop] = useState<string>('');

  // Realtime Shuttle Service States
  const [shuttleState, setShuttleState] = useState<ShuttleState>({
    dutyStatus: 'on',
    currentStop: 'Pos Induk Kampus A',
    nextStop: 'Gedung Kampus A',
    nextStopType: 'pickup',
    distanceMeters: 250,
    seatsUsed: 8,
    capacity: 14,
    atStop: false,
    routeProgress: 0.35
  });

  const [requests, setRequests] = useState<RideRequest[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [activeRideRequest, setActiveRideRequest] = useState<RideRequest | null>(null);
  const [isRequestSent, setIsRequestSent] = useState(false);

  // Chat & Notifications Modals
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [chatTargetRequest, setChatTargetRequest] = useState<RideRequest | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif-welcome',
      title: 'Selamat Datang',
      message: 'Layanan UISI Shuttle beroperasi normal melayani rute Kampus A & B.',
      time: '07:00 WIB',
      type: 'info',
      read: true
    }
  ]);

  // Offline Simulation
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);

  // Track previous driver steps to show accurate push toasts
  const prevDriverStepRef = useRef<string | undefined>(undefined);
  const prevDutyStatusRef = useRef<string | undefined>(undefined);

  // Subscribe to Realtime Data
  useEffect(() => {
    const unsubState = shuttleService.subscribeShuttleState((state) => {
      setShuttleState(state);

      // Trigger notification if duty status changes
      if (prevDutyStatusRef.current && prevDutyStatusRef.current !== state.dutyStatus) {
        if (state.dutyStatus === 'break') {
          addNotification({
            title: 'Sopir Istirahat',
            message: `Armada istirahat, kembali pukul ${state.breakReturnAt || 'sebentar'}.`,
            type: 'warning'
          });
        } else if (state.dutyStatus === 'off') {
          addNotification({
            title: 'Armada Tidak Beroperasi',
            message: 'Armada UISI-01 saat ini sedang Off Duty.',
            type: 'alert'
          });
        } else if (state.dutyStatus === 'on') {
          addNotification({
            title: 'Armada Beroperasi Kembali',
            message: 'Armada UISI-01 telah aktif dan siap melayani.',
            type: 'success'
          });
        }
      }
      prevDutyStatusRef.current = state.dutyStatus;
    });

    const unsubRequests = shuttleService.subscribeRideRequests((reqs) => {
      setRequests(reqs);

      // Find current active user ride request (pending or transit)
      if (currentUser) {
        const active = reqs.find(
          (r) =>
            r.nim === currentUser.nim &&
            (r.status === 'pending' || r.status === 'transit')
        );

        if (active) {
          // Check step change for toast
          if (
            prevDriverStepRef.current &&
            prevDriverStepRef.current !== active.driverStep
          ) {
            if (active.driverStep === 'accepted') {
              showToast({
                type: 'success',
                title: 'Permintaan Diterima',
                message: 'Permintaan diterima sopir'
              });
              addNotification({
                title: 'Permintaan Diterima Sopir',
                message: `Pak Budi menerima penjemputanmu di ${active.from}`,
                type: 'success'
              });
            } else if (active.driverStep === 'heading') {
              showToast({
                type: 'info',
                title: 'Sopir Menuju Titikmu',
                message: 'Sopir menuju titikmu, estimasi tiba 2 menit'
              });
              addNotification({
                title: 'Sopir Menuju Titikmu',
                message: `Estimasi tiba ~2 menit di ${active.from}`,
                type: 'info'
              });
            } else if (active.driverStep === 'arrived') {
              showToast({
                type: 'success',
                title: 'Shuttle Sudah Tiba',
                message: `Shuttle sudah tiba, pintu dibuka di ${active.from}`
              });
              addNotification({
                title: 'Shuttle Sudah Tiba',
                message: `Pintu armada dibuka di ${active.from}. Segera naik.`,
                type: 'success'
              });
            } else if (active.driverStep === 'on_board') {
              showToast({
                type: 'info',
                title: 'Shuttle Berangkat',
                message: `Shuttle berangkat menuju ${active.to}`
              });
              addNotification({
                title: 'Shuttle Berangkat',
                message: `Perjalanan menuju ${active.to} dimulai.`,
                type: 'info'
              });
            }
          }
          prevDriverStepRef.current = active.driverStep;
          setActiveRideRequest(active);
        } else {
          // If previous was active and now completed
          if (activeRideRequest && activeRideRequest.status !== 'completed') {
            const completedMatch = reqs.find((r) => r.id === activeRideRequest.id);
            if (completedMatch) {
              setActiveRideRequest(completedMatch);
              if (completedMatch.status === 'completed') {
                showToast({
                  type: 'success',
                  title: 'Sampai di Tujuan',
                  message: `Kamu sudah sampai di ${completedMatch.to}`
                });
                addNotification({
                  title: 'Perjalanan Selesai',
                  message: `Kamu sudah sampai di ${completedMatch.to}. ${completedMatch.statusLabel || ''}`,
                  type: 'success'
                });
              }
            }
          }
        }
      }
    });

    const unsubIncidents = shuttleService.subscribeIncidents((incs) => {
      setIncidents(incs);
      if (incs.length > 0) {
        const latest = incs[0];
        addNotification({
          title: `Kendala: ${latest.type}`,
          message: latest.note,
          type: 'warning'
        });
      }
    });

    return () => {
      unsubState();
      unsubRequests();
      unsubIncidents();
    };
  }, [currentUser, showToast, activeRideRequest]);

  // Helper to append a notification
  const addNotification = (item: {
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'alert';
  }) => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const time = `${hh}:${mm} WIB`;

    const newNotif: AppNotification = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: item.title,
      message: item.message,
      time,
      type: item.type,
      read: false
    };

    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Notification actions
  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Login handler
  const handleLoginSuccess = (user: StudentUser) => {
    setCurrentUser(user);
    saveStoredUser(user);
    showToast({
      type: 'success',
      title: 'Selamat Datang',
      message: `Berhasil masuk sebagai ${user.name}`
    });
  };

  // Logout handler
  const handleLogout = () => {
    setCurrentUser(null);
    saveStoredUser(null);
    setActiveRideRequest(null);
    setBookingStep('idle');
    setCurrentTab('shuttle');
    showToast({
      type: 'info',
      message: 'Kamu telah keluar dari akun.'
    });
  };

  // Booking Flow Actions
  const handleStartBooking = () => {
    if (currentUser?.favoriteStop) {
      setSelectedPickupStop(currentUser.favoriteStop);
    } else {
      setSelectedPickupStop('');
    }
    setBookingStep('pickup');
  };

  const handleConfirmPickup = (stop: string) => {
    setSelectedPickupStop(stop);
    setBookingStep('destination');
  };

  const handleSubmitBooking = (bookingData: {
    from: string;
    to: string;
    passengerCount: number;
    note?: string;
    dropoffNote?: string;
  }) => {
    if (!currentUser) return;

    const newReq = shuttleService.createRideRequest({
      studentName: currentUser.name,
      nim: currentUser.nim,
      phone: currentUser.phone,
      passengerCount: bookingData.passengerCount,
      from: bookingData.from,
      to: bookingData.to,
      note: bookingData.note,
      dropoffNote: bookingData.dropoffNote
    });

    setActiveRideRequest(newReq);
    setIsRequestSent(true);
    setBookingStep('idle');

    showToast({
      type: 'success',
      title: 'Permintaan Dikirim',
      message: 'Permintaan terkirim ke antrean sopir UISI-01'
    });

    addNotification({
      title: 'Permintaan Terkirim',
      message: `Menunggu konfirmasi sopir untuk rute ${bookingData.from} ke ${bookingData.to}`,
      type: 'info'
    });
  };

  // Return home from waiting room / completed screen
  const handleReturnHome = () => {
    setActiveRideRequest(null);
    setIsRequestSent(false);
    setBookingStep('idle');
    setCurrentTab('shuttle');
  };

  const handleBookAgain = () => {
    setActiveRideRequest(null);
    setIsRequestSent(false);
    setSelectedPickupStop(currentUser?.favoriteStop || '');
    setCurrentTab('shuttle');
    setBookingStep('pickup');
  };

  // Rebook from History
  const handleSelectRebook = (from: string, to: string) => {
    setSelectedPickupStop(from);
    setBookingStep('destination');
    setCurrentTab('shuttle');
  };

  // Chat openers
  const handleOpenActiveChat = () => {
    if (activeRideRequest) {
      setChatTargetRequest(activeRideRequest);
      setIsChatOpen(true);
    }
  };

  const handleOpenHistoryChat = (req: RideRequest) => {
    setChatTargetRequest(req);
    setIsChatOpen(true);
  };

  // If user is not logged in: display Login Screen (no bottom navbar)
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // Determine whether bottom nav should be visible:
  // "Bottom nav (Shuttle, Riwayat, Profil) only on the 3 main tabs; hidden on Login and during the whole order flow."
  const isOrderFlowActive = bookingStep !== 'idle' || activeRideRequest !== null;

  const showBottomNav = !isOrderFlowActive;

  return (
    <div className="flex justify-center min-h-screen bg-[#E5E7EB]">
      {/* Mobile-first compact container (max-w-md, 360-440px) */}
      <div className="w-full max-w-md bg-[#F5F5F6] flex flex-col h-screen overflow-hidden shadow-2xl relative border-x border-[#E5E7EB]">
        

        {/* Driver Companion Sandbox Drawer for interactive review */}
        {import.meta.env.DEV && (
          <DriverSimulatorDrawer
            shuttleState={shuttleState}
            activeRequest={activeRideRequest}
            isSimulatedOffline={isSimulatedOffline}
            onSimulateOfflineToggle={() => setIsSimulatedOffline(!isSimulatedOffline)}
          />
        )}

        {/* Main Body View */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <AnimatePresence mode="wait">
            {/* 1. ORDER FLOW: WAITING ROOM SCREEN */}
            {isRequestSent && activeRideRequest ? (
              <motion.div
                key="request-sent"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.22 }}
                className="flex-1 flex flex-col overflow-hidden"
              >
                <RequestSentScreen
                  request={activeRideRequest}
                  onViewStatus={() => setIsRequestSent(false)}
                />
              </motion.div>
            ) : activeRideRequest ? (
              <motion.div
                key="waiting-room"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col overflow-hidden"
              >
                <WaitingRoomScreen
                  request={activeRideRequest}
                  shuttleState={shuttleState}
                  incidents={incidents}
                  onOpenChat={handleOpenActiveChat}
                  onReturnHome={handleReturnHome}
                  onBookAgain={handleBookAgain}
                />
              </motion.div>
            ) : bookingStep === 'pickup' ? (
              /* 2. ORDER FLOW: PICKUP SELECTION SCREEN */
              <motion.div
                key="pickup-screen"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col overflow-hidden"
              >
                <PickupSelectionScreen
                  shuttleState={shuttleState}
                  initialSelectedStop={selectedPickupStop}
                  onBack={() => setBookingStep('idle')}
                  onConfirmPickup={handleConfirmPickup}
                />
              </motion.div>
            ) : bookingStep === 'destination' ? (
              /* 3. ORDER FLOW: DESTINATION & DETAILS SCREEN */
              <motion.div
                key="destination-screen"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col overflow-hidden"
              >
                <DestinationScreen
                  pickupStop={selectedPickupStop}
                  shuttleState={shuttleState}
                  currentUser={currentUser}
                  onBack={() => setBookingStep('pickup')}
                  onSubmitBooking={handleSubmitBooking}
                />
              </motion.div>
            ) : currentTab === 'shuttle' ? (
              /* 4. MAIN TAB: DASHBOARD (MINIMAL MAP) */
              <motion.div
                key="tab-shuttle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex-1 flex flex-col overflow-hidden"
              >
                <DashboardScreen
                  shuttleState={shuttleState}
                  isOffline={isSimulatedOffline}
                  unreadCount={unreadCount}
                  onOpenNotifications={() => setIsNotificationsOpen(true)}
                  onStartBooking={handleStartBooking}
                />
              </motion.div>
            ) : currentTab === 'riwayat' ? (
              /* 5. MAIN TAB: RIWAYAT PERJALANAN */
              <motion.div
                key="tab-riwayat"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex-1 flex flex-col overflow-hidden"
              >
                <HistoryScreen
                  requests={requests.filter((r) => r.nim === currentUser.nim)}
                  shuttleState={shuttleState}
                  onSelectRebook={handleSelectRebook}
                  onOpenChat={handleOpenHistoryChat}
                />
              </motion.div>
            ) : (
              /* 6. MAIN TAB: PROFIL MAHASISWA */
              <motion.div
                key="tab-profil"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex-1 flex flex-col overflow-hidden"
              >
                <ProfileScreen
                  currentUser={currentUser}
                  onUpdateUser={(updated) => setCurrentUser(updated)}
                  onLogout={handleLogout}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 72px Bottom Navigation: strictly shown on the 3 main tabs only */}
        {showBottomNav && (
          <BottomNav
            currentTab={currentTab}
            onTabChange={(tab) => setCurrentTab(tab)}
            unreadCount={unreadCount}
          />
        )}

        {/* Notifications Modal */}
        <NotificationsModal
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
          notifications={notifications}
          onMarkAsRead={handleMarkAsRead}
          onClearAll={handleClearNotifications}
        />

        {/* Chat with Driver Modal */}
        {chatTargetRequest && (
          <ChatModal
            isOpen={isChatOpen}
            onClose={() => {
              setIsChatOpen(false);
              setChatTargetRequest(null);
            }}
            request={chatTargetRequest}
          />
        )}
      </div>
    </div>
  );
}
