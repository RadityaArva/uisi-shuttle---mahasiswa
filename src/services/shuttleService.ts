import {
  ShuttleState,
  RideRequest,
  Incident,
  ChatMessage,
  ShuttleStop,
  BoardingStatus,
  DutyStatus
} from '../types/shuttle';

export const SHUTTLE_STOPS: ShuttleStop[] = [
  {
    id: 'stop-1',
    name: 'Pos Induk Kampus A',
    shortName: 'Pos Induk A',
    campus: 'A',
    x: 22,
    y: 75,
    description: 'Pintu Gerbang Utama Kampus A (Jl. Veteran)'
  },
  {
    id: 'stop-2',
    name: 'Gedung Kampus A',
    shortName: 'Gedung A',
    campus: 'A',
    x: 32,
    y: 28,
    description: 'Lobi Utama Rektorat & Gedung Kuliah Bersama A'
  },
  {
    id: 'stop-3',
    name: 'Pos Kampus B',
    shortName: 'Pos B',
    campus: 'B',
    x: 74,
    y: 72,
    description: 'Gerbang Masuk Kawasan Kampus B'
  },
  {
    id: 'stop-4',
    name: 'Gedung Kampus B',
    shortName: 'Gedung B',
    campus: 'B',
    x: 82,
    y: 24,
    description: 'Lobi Gedung Perkuliahan & Laboratorium Kampus B'
  }
];

export const SHUTTLE_INFO = {
  armada: 'UISI-01',
  plat: 'W 1948 US',
  driverName: 'Pak Budi Santoso',
  driverPhone: '0812-3456-7890',
  capacity: 14
};

const STORAGE_KEY_STATE = 'uisi_shuttle_state_v1';
const STORAGE_KEY_REQUESTS = 'uisi_shuttle_requests_v1';
const STORAGE_KEY_CHAT = 'uisi_shuttle_chat_v1';
const STORAGE_KEY_INCIDENTS = 'uisi_shuttle_incidents_v1';
const CHANNEL_NAME = 'uisi_shuttle_realtime_channel';

// Default initial state
const defaultShuttleState: ShuttleState = {
  dutyStatus: 'on',
  currentStop: 'Pos Induk Kampus A',
  nextStop: 'Gedung Kampus A',
  nextStopType: 'pickup',
  distanceMeters: 250,
  seatsUsed: 8,
  capacity: 14,
  atStop: false,
  routeProgress: 0.35
};

// Seed historical requests
const defaultRequests: RideRequest[] = [
  {
    id: 'req-hist-1',
    studentName: 'Ahmad Fauzi',
    nim: '2021001',
    phone: '081234567891',
    passengerCount: 1,
    from: 'Pos Induk Kampus A',
    to: 'Gedung Kampus B',
    requestedAt: '06:45 WIB',
    status: 'completed',
    statusLabel: 'Selesai Otomatis (06:58 WIB)',
    boarding: 'boarded',
    completedAt: '06:58 WIB',
    note: 'Kuliah jam 07.00'
  },
  {
    id: 'req-hist-2',
    studentName: 'Ahmad Fauzi',
    nim: '2021001',
    phone: '081234567891',
    passengerCount: 2,
    from: 'Gedung Kampus B',
    to: 'Pos Kampus B',
    requestedAt: '12:15 WIB',
    status: 'completed',
    statusLabel: 'Selesai Otomatis (12:28 WIB)',
    boarding: 'boarded',
    completedAt: '12:28 WIB'
  },
  {
    id: 'req-hist-3',
    studentName: 'Ahmad Fauzi',
    nim: '2021001',
    phone: '081234567891',
    passengerCount: 1,
    from: 'Gedung Kampus A',
    to: 'Gedung Kampus B',
    requestedAt: '14:20 WIB',
    status: 'cancelled',
    cancelReason: 'Kelas dibatalkan',
    statusLabel: 'Dibatalkan mahasiswa (14:25 WIB)',
    boarding: 'walking'
  }
];

const defaultChatMessages: ChatMessage[] = [
  {
    id: 'chat-seed-1',
    requestId: 'req-hist-1',
    sender: 'driver',
    text: 'Sudah sampai di halte!',
    time: '06:50 WIB'
  },
  {
    id: 'chat-seed-2',
    requestId: 'req-hist-1',
    sender: 'passenger',
    text: 'Kami sudah di halte',
    time: '06:51 WIB'
  }
];

class ShuttleRealtimeService {
  private channel: BroadcastChannel | null = null;
  private stateSubscribers: Set<(state: ShuttleState) => void> = new Set();
  private requestsSubscribers: Set<(reqs: RideRequest[]) => void> = new Set();
  private chatSubscribers: Map<string, Set<(msgs: ChatMessage[]) => void>> = new Map();
  private incidentSubscribers: Set<(incidents: Incident[]) => void> = new Set();

  private currentState: ShuttleState = defaultShuttleState;
  private currentRequests: RideRequest[] = defaultRequests;
  private currentChatMessages: ChatMessage[] = defaultChatMessages;
  private currentIncidents: Incident[] = [];

  constructor() {
    this.initStorage();
    this.initBroadcastChannel();
    this.initStorageListener();
    this.initRouteProgressTicker();
  }

  private initStorage() {
    try {
      const storedState = localStorage.getItem(STORAGE_KEY_STATE);
      if (storedState) {
        this.currentState = JSON.parse(storedState);
      } else {
        localStorage.setItem(STORAGE_KEY_STATE, JSON.stringify(defaultShuttleState));
      }

      const storedRequests = localStorage.getItem(STORAGE_KEY_REQUESTS);
      if (storedRequests) {
        this.currentRequests = JSON.parse(storedRequests);
      } else {
        localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(defaultRequests));
      }

      const storedChat = localStorage.getItem(STORAGE_KEY_CHAT);
      if (storedChat) {
        this.currentChatMessages = JSON.parse(storedChat);
      } else {
        localStorage.setItem(STORAGE_KEY_CHAT, JSON.stringify(defaultChatMessages));
      }

      const storedIncidents = localStorage.getItem(STORAGE_KEY_INCIDENTS);
      if (storedIncidents) {
        this.currentIncidents = JSON.parse(storedIncidents);
      } else {
        localStorage.setItem(STORAGE_KEY_INCIDENTS, JSON.stringify([]));
      }
    } catch {
      // Fallback in memory
    }
  }

  private initBroadcastChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(CHANNEL_NAME);
        this.channel.onmessage = (event) => {
          this.handleIncomingSync(event.data);
        };
      } catch (err) {
        console.warn('BroadcastChannel error, using localStorage fallback', err);
      }
    }
  }

  private initStorageListener() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY_STATE && e.newValue) {
          this.currentState = JSON.parse(e.newValue);
          this.notifyStateSubscribers();
        } else if (e.key === STORAGE_KEY_REQUESTS && e.newValue) {
          this.currentRequests = JSON.parse(e.newValue);
          this.notifyRequestsSubscribers();
        } else if (e.key === STORAGE_KEY_CHAT && e.newValue) {
          this.currentChatMessages = JSON.parse(e.newValue);
          this.notifyAllChatSubscribers();
        } else if (e.key === STORAGE_KEY_INCIDENTS && e.newValue) {
          this.currentIncidents = JSON.parse(e.newValue);
          this.notifyIncidentSubscribers();
        }
      });
    }
  }

  private broadcast(type: string, payload: unknown) {
    if (this.channel) {
      try {
        this.channel.postMessage({ type, payload, timestamp: Date.now() });
      } catch {
        // Ignored
      }
    }
  }

  private handleIncomingSync(data: { type: string; payload: unknown }) {
    if (!data || !data.type) return;

    if (data.type === 'SHUTTLE_STATE') {
      this.currentState = data.payload as ShuttleState;
      this.notifyStateSubscribers();
    } else if (data.type === 'REQUESTS_UPDATE') {
      this.currentRequests = data.payload as RideRequest[];
      this.notifyRequestsSubscribers();
    } else if (data.type === 'CHAT_UPDATE') {
      this.currentChatMessages = data.payload as ChatMessage[];
      this.notifyAllChatSubscribers();
    } else if (data.type === 'INCIDENT_UPDATE') {
      this.currentIncidents = data.payload as Incident[];
      this.notifyIncidentSubscribers();
    }
  }

  // Smooth route progression loop for the moving shuttle marker
  private initRouteProgressTicker() {
    if (typeof window === 'undefined') return;
    setInterval(() => {
      if (this.currentState.dutyStatus === 'on' && !this.currentState.atStop) {
        const nextProg = ((this.currentState.routeProgress ?? 0) + 0.015) % 1;
        this.currentState.routeProgress = parseFloat(nextProg.toFixed(3));
        this.notifyStateSubscribers();
      }
    }, 1200);
  }

  private notifyStateSubscribers() {
    this.stateSubscribers.forEach((cb) => {
      try {
        cb(this.currentState);
      } catch (err) {
        console.error(err);
      }
    });
  }

  private notifyRequestsSubscribers() {
    this.requestsSubscribers.forEach((cb) => {
      try {
        cb([...this.currentRequests]);
      } catch (err) {
        console.error(err);
      }
    });
  }

  private notifyAllChatSubscribers() {
    this.chatSubscribers.forEach((callbacks, requestId) => {
      const messagesForReq = this.currentChatMessages.filter((m) => m.requestId === requestId);
      callbacks.forEach((cb) => {
        try {
          cb([...messagesForReq]);
        } catch (err) {
          console.error(err);
        }
      });
    });
  }

  private notifyIncidentSubscribers() {
    this.incidentSubscribers.forEach((cb) => {
      try {
        cb([...this.currentIncidents]);
      } catch (err) {
        console.error(err);
      }
    });
  }

  // Public Subscriptions
  subscribeShuttleState(callback: (state: ShuttleState) => void): () => void {
    this.stateSubscribers.add(callback);
    callback(this.currentState);
    return () => {
      this.stateSubscribers.delete(callback);
    };
  }

  subscribeRideRequests(callback: (requests: RideRequest[]) => void): () => void {
    this.requestsSubscribers.add(callback);
    callback([...this.currentRequests]);
    return () => {
      this.requestsSubscribers.delete(callback);
    };
  }

  subscribeChat(requestId: string, callback: (messages: ChatMessage[]) => void): () => void {
    if (!this.chatSubscribers.has(requestId)) {
      this.chatSubscribers.set(requestId, new Set());
    }
    const set = this.chatSubscribers.get(requestId)!;
    set.add(callback);
    callback(this.currentChatMessages.filter((m) => m.requestId === requestId));

    return () => {
      set.delete(callback);
      if (set.size === 0) {
        this.chatSubscribers.delete(requestId);
      }
    };
  }

  subscribeIncidents(callback: (incidents: Incident[]) => void): () => void {
    this.incidentSubscribers.add(callback);
    callback([...this.currentIncidents]);
    return () => {
      this.incidentSubscribers.delete(callback);
    };
  }

  // State Updates
  updateShuttleState(partial: Partial<ShuttleState>) {
    this.currentState = { ...this.currentState, ...partial };
    try {
      localStorage.setItem(STORAGE_KEY_STATE, JSON.stringify(this.currentState));
    } catch {
      // Ignored
    }
    this.broadcast('SHUTTLE_STATE', this.currentState);
    this.notifyStateSubscribers();
  }

  // Ride Request mutations
  createRideRequest(params: {
    studentName: string;
    nim: string;
    phone: string;
    passengerCount: number;
    from: string;
    to: string;
    note?: string;
    dropoffNote?: string;
  }): RideRequest {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const requestedAt = `${hh}:${mm} WIB`;

    const newRequest: RideRequest = {
      id: `req-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      studentName: params.studentName,
      nim: params.nim,
      phone: params.phone,
      passengerCount: params.passengerCount,
      from: params.from,
      to: params.to,
      note: params.note,
      dropoffNote: params.dropoffNote,
      requestedAt,
      status: 'pending',
      boarding: 'waiting',
      driverStep: 'pending'
    };

    this.currentRequests = [newRequest, ...this.currentRequests];
    try {
      localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(this.currentRequests));
    } catch {
      // Ignored
    }
    this.broadcast('REQUESTS_UPDATE', this.currentRequests);
    this.notifyRequestsSubscribers();

    return newRequest;
  }

  updateRideRequest(id: string, partial: Partial<RideRequest>) {
    this.currentRequests = this.currentRequests.map((req) => {
      if (req.id === id) {
        return { ...req, ...partial };
      }
      return req;
    });

    try {
      localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(this.currentRequests));
    } catch {
      // Ignored
    }
    this.broadcast('REQUESTS_UPDATE', this.currentRequests);
    this.notifyRequestsSubscribers();
  }

  cancelRideRequest(id: string, reason: string) {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const label = `Pesanan dibatalkan (${hh}:${mm} WIB)`;

    this.updateRideRequest(id, {
      status: 'cancelled',
      cancelReason: reason,
      statusLabel: label
    });
  }

  setBoardingStatus(id: string, boarding: BoardingStatus) {
    const partial: Partial<RideRequest> = { boarding };
    if (boarding === 'boarded') {
      const now = new Date();
      partial.boardedAt = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;
    }
    this.updateRideRequest(id, partial);
  }

  // Chat
  sendChatMessage(requestId: string, sender: 'driver' | 'passenger', text: string): ChatMessage {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const time = `${hh}:${mm} WIB`;

    const msg: ChatMessage = {
      id: `chat-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      requestId,
      sender,
      text,
      time
    };

    this.currentChatMessages = [...this.currentChatMessages, msg];
    try {
      localStorage.setItem(STORAGE_KEY_CHAT, JSON.stringify(this.currentChatMessages));
    } catch {
      // Ignored
    }
    this.broadcast('CHAT_UPDATE', this.currentChatMessages);
    this.notifyAllChatSubscribers();
    return msg;
  }

  // Incidents
  reportIncident(type: string, note: string) {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const createdAt = `${hh}:${mm} WIB`;

    const incident: Incident = { type, note, createdAt };
    this.currentIncidents = [incident, ...this.currentIncidents];
    try {
      localStorage.setItem(STORAGE_KEY_INCIDENTS, JSON.stringify(this.currentIncidents));
    } catch {
      // Ignored
    }
    this.broadcast('INCIDENT_UPDATE', this.currentIncidents);
    this.notifyIncidentSubscribers();
  }

  clearIncident() {
    this.currentIncidents = [];
    try {
      localStorage.setItem(STORAGE_KEY_INCIDENTS, JSON.stringify([]));
    } catch {
      // Ignored
    }
    this.broadcast('INCIDENT_UPDATE', this.currentIncidents);
    this.notifyIncidentSubscribers();
  }

  // Driver Actions Simulation (Accessible from Companion Driver Sandbox and cross-app sync)
  driverAcceptRequest(requestId: string) {
    this.updateRideRequest(requestId, {
      driverStep: 'accepted',
      status: 'pending'
    });
  }

  driverHeadingToPickup(requestId: string, distanceMeters = 250) {
    const req = this.currentRequests.find((r) => r.id === requestId);
    this.updateShuttleState({
      nextStop: req ? req.from : 'Pos Induk Kampus A',
      nextStopType: 'pickup',
      distanceMeters,
      atStop: false
    });
    this.updateRideRequest(requestId, {
      driverStep: 'heading'
    });
  }

  driverNotifyNear(requestId: string) {
    this.updateShuttleState({
      distanceMeters: 120,
      atStop: false
    });
    // Trigger notification banner
    this.broadcast('DRIVER_NOTIFY_NEAR', { requestId });
  }

  driverArrivedAtStop(stopName: string, dwellMinutes = 3) {
    const endsAt = Date.now() + dwellMinutes * 60 * 1000;
    this.updateShuttleState({
      currentStop: stopName,
      atStop: true,
      distanceMeters: 0,
      dwell: {
        endsAt,
        totalSeconds: dwellMinutes * 60
      }
    });

    // Update requests waiting at this stop to arrived step
    this.currentRequests.forEach((req) => {
      if (req.from === stopName && req.status === 'pending') {
        this.updateRideRequest(req.id, { driverStep: 'arrived' });
      }
    });
  }

  driverAddDwellTime(extraMinutes = 2) {
    if (this.currentState.dwell) {
      const remainingMs = Math.max(0, this.currentState.dwell.endsAt - Date.now());
      const newEndsAt = Date.now() + remainingMs + extraMinutes * 60 * 1000;
      const newTotal = this.currentState.dwell.totalSeconds + extraMinutes * 60;
      this.updateShuttleState({
        dwell: {
          endsAt: newEndsAt,
          totalSeconds: newTotal
        }
      });
    }
  }

  driverConfirmPassenger(requestId: string) {
    this.updateRideRequest(requestId, {
      boarding: 'confirmed',
      boardedAt: this.currentRequests.find((request) => request.id === requestId)?.boardedAt || (() => {
        const now = new Date();
        return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;
      })()
    });
  }

  driverDepartDirectly(destinationStop = 'Gedung Kampus B') {
    this.updateShuttleState({
      atStop: false,
      dwell: undefined,
      nextStop: destinationStop,
      nextStopType: 'destination',
      distanceMeters: 450
    });

    // Update boarded requests to transit
    this.currentRequests.forEach((req) => {
      if ((req.boarding === 'boarded' || req.boarding === 'confirmed') && req.status === 'pending') {
        this.updateRideRequest(req.id, {
          status: 'transit',
          driverStep: 'on_board'
        });
      }
    });
  }

  driverNotifyNearDestination(requestId: string) {
    this.updateShuttleState({
      distanceMeters: 100
    });
    this.broadcast('DRIVER_NOTIFY_NEAR_DEST', { requestId });
  }

  driverArrivedDestination(destinationStop: string) {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const completedAt = `${hh}:${mm} WIB`;
    const label = `Pesanan Selesai Otomatis (${completedAt})`;

    // Automatically complete every request aboard with that destination
    this.currentRequests.forEach((req) => {
      if (req.to === destinationStop && (req.status === 'transit' || req.boarding === 'boarded')) {
        this.updateRideRequest(req.id, {
          status: 'completed',
          statusLabel: label,
          completedAt,
          driverStep: 'completed'
        });
      }
    });

    this.updateShuttleState({
      currentStop: destinationStop,
      atStop: true,
      distanceMeters: 0,
      dwell: undefined
    });
  }

  setDriverDuty(duty: DutyStatus, returnAt?: string) {
    this.updateShuttleState({
      dutyStatus: duty,
      breakReturnAt: returnAt
    });
  }

  setSeatsUsed(count: number) {
    this.updateShuttleState({
      seatsUsed: Math.max(0, Math.min(14, count))
    });
  }

  resetDemoData() {
    localStorage.removeItem(STORAGE_KEY_STATE);
    localStorage.removeItem(STORAGE_KEY_REQUESTS);
    localStorage.removeItem(STORAGE_KEY_CHAT);
    localStorage.removeItem(STORAGE_KEY_INCIDENTS);
    this.currentState = defaultShuttleState;
    this.currentRequests = defaultRequests;
    this.currentChatMessages = defaultChatMessages;
    this.currentIncidents = [];
    this.notifyStateSubscribers();
    this.notifyRequestsSubscribers();
    this.notifyAllChatSubscribers();
    this.notifyIncidentSubscribers();
  }
}

export const shuttleService = new ShuttleRealtimeService();
