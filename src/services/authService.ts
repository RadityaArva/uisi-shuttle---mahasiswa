import { StudentUser } from '../types/shuttle';

const AUTH_STORAGE_KEY = 'uisi_shuttle_current_student';

export const DEFAULT_STUDENT: StudentUser = {
  name: 'Ahmad Fauzi',
  nim: '2021001',
  email: 'ahmad.fauzi@student.uisi.ac.id',
  phone: '0812-3456-7891',
  programStudi: 'S1 Sistem Informasi',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
  favoriteStop: 'Gedung Kampus A'
};

export const DEMO_STUDENTS: StudentUser[] = [
  DEFAULT_STUDENT,
  {
    name: 'Siti Rahma Azzahra',
    nim: '2022045',
    email: 'siti.rahma@student.uisi.ac.id',
    phone: '0857-9876-5432',
    programStudi: 'S1 Manajemen Rekayasa',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    favoriteStop: 'Pos Induk Kampus A'
  },
  {
    name: 'Dimas Prasetyo',
    nim: '2020088',
    email: 'dimas.prasetyo@student.uisi.ac.id',
    phone: '0813-1122-3344',
    programStudi: 'S1 Teknik Logistik',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
    favoriteStop: 'Gedung Kampus B'
  }
];

export function getStoredUser(): StudentUser | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    //
  }
  return null;
}

export function saveStoredUser(user: StudentUser | null) {
  try {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch {
    //
  }
}
