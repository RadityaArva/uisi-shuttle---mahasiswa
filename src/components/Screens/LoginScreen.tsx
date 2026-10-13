import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff } from 'lucide-react';
import { StudentUser } from '../../types/shuttle';
import { DEFAULT_STUDENT, DEMO_STUDENTS, saveStoredUser } from '../../services/authService';

interface LoginScreenProps {
  onLoginSuccess: (user: StudentUser) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setErrorMessage('Email tidak boleh kosong');
      return;
    }

    if (!trimmed.endsWith('@student.uisi.ac.id')) {
      setErrorMessage('Gunakan email mahasiswa @student.uisi.ac.id');
      return;
    }

    if (!password) {
      setErrorMessage('Kata sandi tidak boleh kosong');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Find matching demo student or construct one
      const matched = DEMO_STUDENTS.find((s) => s.email.toLowerCase() === trimmed);
      const student: StudentUser = matched || {
        ...DEFAULT_STUDENT,
        email: trimmed,
        name: trimmed.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      };

      saveStoredUser(student);
      setIsLoading(false);
      onLoginSuccess(student);
    }, 700);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F6] flex items-center justify-center p-5 w-full">
      <motion.div
        initial={{ y: 14, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm"
      >
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-[76px] h-[76px] rounded-2xl bg-white border border-[#E5E7EB] shadow-sm flex items-center justify-center mb-5">
            <span className="font-heading text-[23px] font-bold text-[#C8102E] tracking-tight">UISI</span>
          </div>
          <h1 className="text-[22px] leading-7 font-bold text-[#1F2933]">Masuk ke UISI Shuttle</h1>
          <p className="text-sm text-[#6B7280] mt-1">Gunakan email mahasiswa</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-sm">
          {/* Email field */}
          <div>
            <label className="block text-xs font-semibold text-[#1F2933] mb-1.5">
              Email Mahasiswa
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="nama@student.uisi.ac.id"
                className={`w-full h-11 px-3.5 pr-10 text-sm bg-white rounded-xl border focus:outline-none transition-colors ${
                  errorMessage
                    ? 'border-[#C8102E] focus:ring-1 focus:ring-[#C8102E]'
                    : 'border-[#E5E7EB] focus:border-[#C8102E]'
                }`}
              />
              <span className="material-symbols-outlined absolute right-3 top-3 text-[18px] text-gray-400">mail</span>
            </div>
          </div>

          {/* Password field */}
          <div>
            <label className="block text-xs font-semibold text-[#1F2933] mb-1.5">
              Kata Sandi
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="Masukkan kata sandi..."
                className="w-full h-11 px-3.5 pr-10 text-sm bg-white rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#C8102E] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute right-2 top-2 w-7 h-7 flex items-center justify-center text-gray-500 hover:text-[#1F2933]"
                aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Red error alert if invalid */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-medium text-[#C8102E]"
            >
              <span className="material-symbols-outlined text-[16px] shrink-0">
                error
              </span>
              <span>{errorMessage}</span>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-[#C8102E] hover:bg-[#9B0D24] text-white font-semibold rounded-xl text-sm transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                <span>Memverifikasi...</span>
              </>
            ) : (
              <span>Masuk</span>
            )}
          </button>
          <div className="text-center -mt-1">
            <button type="button" className="text-xs font-medium text-[#C8102E] hover:underline">Lupa kata sandi?</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
