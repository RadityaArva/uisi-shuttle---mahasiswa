export type DutyStatus = 'on' | 'off' | 'break';

export type NextStopType = 'pickup' | 'destination';

export type RequestStatus = 'pending' | 'transit' | 'completed' | 'cancelled';

export type BoardingStatus = 'waiting' | 'walking' | 'confirmed' | 'boarded';

export interface RideRequest {
  id: string;
  studentName: string;
  nim: string;
  phone: string;
  passengerCount: number; // 1-4
  from: string;
  to: string;
  note?: string;
  dropoffNote?: string;
  requestedAt: string; // e.g. "07:18 WIB"
  status: RequestStatus;
  statusLabel?: string;
  cancelReason?: string;
  boarding: BoardingStatus;
  boardedAt?: string;
  driverStep?: 'pending' | 'accepted' | 'heading' | 'arrived' | 'on_board' | 'completed';
  completedAt?: string;
}

export interface ShuttleState {
  dutyStatus: DutyStatus;
  breakReturnAt?: string; // e.g. "10.45"
  currentStop: string;
  nextStop: string;
  nextStopType: NextStopType;
  distanceMeters: number;
  seatsUsed: number;
  capacity: number; // 14
  dwell?: {
    endsAt: number; // timestamp in ms
    totalSeconds: number;
  };
  atStop?: boolean;
  // Route progress between 0 and 1 for visual animation
  routeProgress?: number;
}

export interface Incident {
  type: string; // e.g. "Macet Gerbang Utama", "Antrean Penumpang Melebihi Kuota", "Kendala Teknis Armada", "Hujan Deras / Jalur Licin", "Perbaikan Jalan Kampus"
  note: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  requestId: string;
  sender: 'driver' | 'passenger';
  text: string;
  time: string;
}

export interface ShuttleStop {
  id: string;
  name: string;
  shortName: string;
  campus: 'A' | 'B';
  x: number; // Coordinate percentage on SVG map
  y: number;
  description: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  read: boolean;
}

export interface StudentUser {
  name: string;
  nim: string;
  email: string;
  phone: string;
  programStudi: string;
  avatarUrl: string;
  favoriteStop: string;
}
