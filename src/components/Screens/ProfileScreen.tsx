import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StudentUser } from '../../types/shuttle';
import { SHUTTLE_STOPS } from '../../services/shuttleService';
import { saveStoredUser } from '../../services/authService';
import { useToast } from '../Header/ToastBanner';

interface ProfileScreenProps {
  currentUser: StudentUser;
  onUpdateUser: (user: StudentUser) => void;
  onLogout: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  currentUser,
  onUpdateUser,
  onLogout
}) => {
  const { showToast } = useToast();
  const [favoriteStop, setFavoriteStop] = useState<string>(
    currentUser.favoriteStop || 'Gedung Kampus A'
  );
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const [notifSound, setNotifSound] = useState<boolean>(true);
  const [notifNearArrival, setNotifNearArrival] = useState<boolean>(true);
  const [notifIncidents, setNotifIncidents] = useState<boolean>(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState<boolean>(false);

  const handleFavoriteStopChange = (stopName: string) => {
    setFavoriteStop(stopName);
    const updated = { ...currentUser, favoriteStop: stopName };
    onUpdateUser(updated);
    saveStoredUser(updated);
    showToast({
      type: 'success',
      message: `Halte favorit diubah ke: ${stopName}`
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F5F5F6] overflow-y-auto">
      {/* Top Header */}
      <div className="bg-white px-4 py-3.5 border-b border-[#E5E7EB] sticky top-0 z-10 shadow-xs">
        <h2 className="text-base font-bold text-[#1F2933]">Profil Mahasiswa</h2>
        <p className="text-[11px] text-[#6B7280]">
          Informasi akun & pengaturan aplikasi
        </p>
      </div>

      <div className="p-4 space-y-4 flex-1">
        {/* Profile Card */}
        <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-xs flex items-center gap-3.5">
          <div className="relative">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#C8102E] shadow-sm">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 px-1.5 py-0.2 bg-[#C8102E] text-white text-[9px] font-bold rounded-full">
              UISI
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-[#1F2933] truncate">
              {currentUser.name}
            </h3>
            <p className="text-[11px] font-semibold text-[#C8102E]">
              NIM: {currentUser.nim}
            </p>
            <p className="text-[11px] text-[#6B7280] truncate mt-0.5">
              {currentUser.programStudi}
            </p>
          </div>
        </div>

        {/* Contact & Student Details */}
        <div className="bg-white p-3.5 rounded-xl border border-[#E5E7EB] shadow-xs space-y-3">
          <h4 className="text-xs font-bold text-[#1F2933] pb-2 border-b border-gray-100 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-[#C8102E]">
              badge
            </span>
            Data Akademik & Kontak
          </h4>

          <div className="space-y-2.5 text-xs">
            <div>
              <span className="text-[#6B7280] text-[11px] block">Email Kampus:</span>
              <span className="font-semibold text-[#1F2933]">{currentUser.email}</span>
            </div>
            <div>
              <span className="text-[#6B7280] text-[11px] block">Nomor WhatsApp / Telepon:</span>
              <span className="font-semibold text-[#1F2933]">{currentUser.phone}</span>
            </div>
          </div>
        </div>

        {/* Favorite Stop Preference */}
        <div className="bg-white p-3.5 rounded-xl border border-[#E5E7EB] shadow-xs">
          <h4 className="text-xs font-bold text-[#1F2933] mb-2 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-[#C8102E]">
              star
            </span>
            Halte Favorit Utama
          </h4>
          <p className="text-[11px] text-[#6B7280] mb-2.5">
            Digunakan sebagai rekomendasi awal saat membuka pemesanan shuttle.
          </p>

          <div className="grid grid-cols-2 gap-1.5">
            {SHUTTLE_STOPS.map((st) => {
              const isSelected = favoriteStop === st.name;
              return (
                <button
                  key={st.id}
                  onClick={() => handleFavoriteStopChange(st.name)}
                  className={`p-2 rounded-xl text-xs font-medium border text-left transition-all ${
                    isSelected
                      ? 'bg-[#FDECEE] text-[#C8102E] border-[#C8102E] font-semibold'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="truncate">{st.name}</div>
                  <div className="text-[10px] text-[#6B7280] mt-0.5">Kampus {st.campus}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Language & Notifications Switches */}
        <div className="bg-white p-3.5 rounded-xl border border-[#E5E7EB] shadow-xs space-y-3">
          <h4 className="text-xs font-bold text-[#1F2933] pb-2 border-b border-gray-100 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-[#C8102E]">
              settings
            </span>
            Preferensi Aplikasi
          </h4>

          {/* Language Toggle */}
          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-[#1F2933]">Bahasa / Language</span>
              <p className="text-[11px] text-[#6B7280]">Pilihan bahasa antarmuka</p>
            </div>
            <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200 text-xs">
              <button
                onClick={() => setLang('id')}
                className={`px-2.5 py-1 rounded-md font-semibold text-[11px] transition-all ${
                  lang === 'id' ? 'bg-[#C8102E] text-white shadow-xs' : 'text-gray-600'
                }`}
              >
                ID
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 rounded-md font-semibold text-[11px] transition-all ${
                  lang === 'en' ? 'bg-[#C8102E] text-white shadow-xs' : 'text-gray-600'
                }`}
              >
                EN
              </button>
            </div>
          </div>

          {/* Switch 1: Notif Suara */}
          <div className="flex items-center justify-between text-xs pt-1">
            <div>
              <span className="font-semibold text-[#1F2933]">Suara & Getar Notifikasi</span>
              <p className="text-[11px] text-[#6B7280]">Bunyi saat penjemputan tiba</p>
            </div>
            <button
              onClick={() => setNotifSound(!notifSound)}
              className={`w-10 h-6 rounded-full transition-colors p-0.5 ${
                notifSound ? 'bg-[#2E9E5B]' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  notifSound ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Switch 2: Notif Hampir Tiba */}
          <div className="flex items-center justify-between text-xs pt-1">
            <div>
              <span className="font-semibold text-[#1F2933]">Peringatan Hampir Tiba</span>
              <p className="text-[11px] text-[#6B7280]">Banner jarak &le; 150 meter</p>
            </div>
            <button
              onClick={() => setNotifNearArrival(!notifNearArrival)}
              className={`w-10 h-6 rounded-full transition-colors p-0.5 ${
                notifNearArrival ? 'bg-[#2E9E5B]' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  notifNearArrival ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Switch 3: Notif Kendala */}
          <div className="flex items-center justify-between text-xs pt-1">
            <div>
              <span className="font-semibold text-[#1F2933]">Pemberitahuan Kendala Jalur</span>
              <p className="text-[11px] text-[#6B7280]">Info macet atau perbaikan jalan</p>
            </div>
            <button
              onClick={() => setNotifIncidents(!notifIncidents)}
              className={`w-10 h-6 rounded-full transition-colors p-0.5 ${
                notifIncidents ? 'bg-[#2E9E5B]' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  notifIncidents ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Logout Button (Secondary 40px rule) */}
        <div className="pt-2">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full h-10 border border-[#C8102E]/40 text-[#C8102E] hover:bg-[#FDECEE] font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span>Keluar dari Akun</span>
          </button>
        </div>
      </div>

      {/* LOGOUT CONFIRMATION DIALOG */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-xs bg-white rounded-2xl p-5 shadow-2xl z-10 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-red-100 text-[#C8102E] flex items-center justify-center mx-auto mb-3">
                <span className="material-symbols-outlined text-[24px]">logout</span>
              </div>
              <h4 className="text-sm font-bold text-[#1F2933]">Keluar dari Akun?</h4>
              <p className="text-xs text-[#6B7280] mt-1">
                Kamu perlu masuk kembali dengan email @student.uisi.ac.id untuk memesan shuttle.
              </p>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 h-10 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    onLogout();
                  }}
                  className="flex-1 h-10 bg-[#C8102E] hover:bg-[#9B0D24] text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  Keluar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
