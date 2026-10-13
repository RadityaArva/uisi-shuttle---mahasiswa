import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ShuttleState, ShuttleStop } from '../../types/shuttle';
import { SHUTTLE_STOPS } from '../../services/shuttleService';

interface CampusMapProps {
  shuttleState: ShuttleState;
  selectedPickup?: string;
  selectedDestination?: string;
  onSelectStop?: (stopName: string) => void;
  interactive?: boolean;
  compact?: boolean;
  showSelectedRoute?: boolean;
  showShuttleRoute?: boolean;
  focusZoom?: boolean;
}

// Campus route path coordinates (SVG percentage 0-100)
// Connecting:
// Pos Induk A (22, 75) -> Gedung A (32, 28) -> Connecting Road -> Pos B (74, 72) -> Gedung B (82, 24)
const ROUTE_POINTS = [
  { x: 22, y: 75 }, // Pos Induk Kampus A
  { x: 26, y: 50 },
  { x: 32, y: 28 }, // Gedung Kampus A
  { x: 42, y: 35 },
  { x: 50, y: 55 }, // Link between campuses
  { x: 62, y: 65 },
  { x: 74, y: 72 }, // Pos Kampus B
  { x: 78, y: 48 },
  { x: 82, y: 24 }  // Gedung Kampus B
];

// Helper to interpolate position along route
function getPositionOnRoute(progress: number) {
  const points = ROUTE_POINTS;
  const numSegments = points.length - 1;
  const clampedProg = Math.max(0, Math.min(0.999, progress));
  const scaled = clampedProg * numSegments;
  const index = Math.floor(scaled);
  const t = scaled - index;

  const p1 = points[index];
  const p2 = points[index + 1];

  return {
    x: p1.x + (p2.x - p1.x) * t,
    y: p1.y + (p2.y - p1.y) * t
  };
}

export const CampusMap: React.FC<CampusMapProps> = ({
  shuttleState,
  selectedPickup,
  selectedDestination,
  onSelectStop,
  interactive = true,
  compact = false,
  showSelectedRoute = false,
  showShuttleRoute = false,
  focusZoom = false
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number | string; y: number | string }>({ x: 0, y: 0 });

  const pickupStop = SHUTTLE_STOPS.find((stop) => stop.name === selectedPickup);
  const destinationStop = SHUTTLE_STOPS.find((stop) => stop.name === selectedDestination);

  useEffect(() => {
    const focusX = pickupStop && destinationStop
      ? (pickupStop.x + destinationStop.x) / 2
      : pickupStop?.x ?? destinationStop?.x;
    const focusY = pickupStop && destinationStop
      ? (pickupStop.y + destinationStop.y) / 2
      : pickupStop?.y ?? destinationStop?.y;

    if (focusX !== undefined && focusY !== undefined) {
      setPan({ x: `${(50 - focusX) * 0.62}%`, y: `${(50 - focusY) * 0.62}%` });
    }
    setZoomLevel(focusZoom && (pickupStop || destinationStop) ? 1.16 : 1);
  }, [selectedPickup, selectedDestination, focusZoom]);

  // Calculate shuttle position
  let shuttlePos = { x: 50, y: 55 };
  if (shuttleState.atStop) {
    const matched = SHUTTLE_STOPS.find((s) => s.name === shuttleState.currentStop);
    if (matched) {
      shuttlePos = { x: matched.x, y: matched.y };
    }
  } else {
    shuttlePos = getPositionOnRoute(shuttleState.routeProgress ?? 0.35);
  }

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(1.6, Math.max(0.85, prev + delta)));
  };

  const handleRecenter = () => {
    setZoomLevel(1);
    const focusX = pickupStop && destinationStop
      ? (pickupStop.x + destinationStop.x) / 2
      : pickupStop?.x ?? destinationStop?.x;
    const focusY = pickupStop && destinationStop
      ? (pickupStop.y + destinationStop.y) / 2
      : pickupStop?.y ?? destinationStop?.y;
    setPan(focusX === undefined || focusY === undefined
      ? { x: 0, y: 0 }
      : { x: `${(50 - focusX) * 0.62}%`, y: `${(50 - focusY) * 0.62}%` });
  };

  // SVG path definition for smooth route line
  const pathD = ROUTE_POINTS.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  return (
    <div className={`relative w-full h-full overflow-hidden select-none bg-[#EBF0F5] ${compact ? 'rounded-xl' : ''}`}>
      {/* Interactive Map Canvas */}
      <motion.div
        className="w-full h-full origin-center"
        animate={{ scale: zoomLevel, x: pan.x, y: pan.y }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full object-cover"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Defs for gradients & patterns */}
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C8102E" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#9B0D24" stopOpacity="0.9" />
            </linearGradient>

            <pattern id="gridPattern" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#DCE3EB" strokeWidth="0.25" />
            </pattern>
          </defs>

          {/* Background grid */}
          <rect width="100" height="100" fill="url(#gridPattern)" />

          {/* Campus Areas (Soft green & university campus zones) */}
          {/* Kampus A Zone */}
          <rect
            x="12"
            y="18"
            width="32"
            height="68"
            rx="6"
            fill="#E2EBE5"
            stroke="#CFDCD3"
            strokeWidth="0.6"
          />
          <text
            x="28"
            y="23"
            textAnchor="middle"
            fill="#52796F"
            fontSize="3.2"
            fontWeight="bold"
            letterSpacing="0.2"
            fontFamily="Poppins"
          >
            KAMPUS A UISI
          </text>

          {/* Kampus B Zone */}
          <rect
            x="64"
            y="14"
            width="30"
            height="72"
            rx="6"
            fill="#E2EBE5"
            stroke="#CFDCD3"
            strokeWidth="0.6"
          />
          <text
            x="79"
            y="19"
            textAnchor="middle"
            fill="#52796F"
            fontSize="3.2"
            fontWeight="bold"
            letterSpacing="0.2"
            fontFamily="Poppins"
          >
            KAMPUS B UISI
          </text>

          {/* Park / Greenery Blobs */}
          <circle cx="20" cy="40" r="5" fill="#D3E5D8" opacity="0.8" />
          <circle cx="36" cy="65" r="4.5" fill="#D3E5D8" opacity="0.8" />
          <circle cx="86" cy="55" r="5.5" fill="#D3E5D8" opacity="0.8" />

          {/* Campus Road Outline (Dashed border) */}
          <path
            d={pathD}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={pathD}
            fill="none"
            stroke="#CBD5E1"
            strokeWidth="3.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Active Route Guideline */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#routeGradient)"
            strokeWidth="1.6"
            strokeDasharray="2 1.5"
            strokeLinecap="round"
            className="opacity-75"
          />

          {showSelectedRoute && pickupStop && destinationStop && (
            <motion.path
              key={`${pickupStop.id}-${destinationStop.id}`}
              d={`M ${pickupStop.x} ${pickupStop.y} L ${destinationStop.x} ${destinationStop.y}`}
              fill="none"
              stroke="#C8102E"
              strokeWidth="2.4"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0.55 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.75, ease: 'easeInOut' }}
            />
          )}

          {showShuttleRoute && pickupStop && (
            <motion.path
              key={`shuttle-${pickupStop.id}-${Math.round(shuttlePos.x)}-${Math.round(shuttlePos.y)}`}
              d={`M ${shuttlePos.x} ${shuttlePos.y} L ${pickupStop.x} ${pickupStop.y}`}
              fill="none"
              stroke="#C8102E"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeDasharray="3 1.4"
              initial={{ pathLength: 0, opacity: 0.45 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.65, ease: 'easeInOut' }}
            />
          )}

          {/* 4 STOPS PINS */}
          {SHUTTLE_STOPS.map((stop) => {
            const isPickup = selectedPickup === stop.name;
            const isDest = selectedDestination === stop.name;
            const isCurrentStop = shuttleState.currentStop === stop.name && shuttleState.atStop;
            const isNextStop = shuttleState.nextStop === stop.name;

            return (
              <g
                key={stop.id}
                onClick={() => onSelectStop && onSelectStop(stop.name)}
                className="cursor-pointer transition-transform hover:scale-110"
                style={{ transformOrigin: `${stop.x}px ${stop.y}px` }}
              >
                {/* Highlight circle if selected */}
                {(isPickup || isDest) && (
                  <circle
                    cx={stop.x}
                    cy={stop.y}
                    r="4.8"
                    fill={isPickup ? '#FDECEE' : '#E8F5E9'}
                    stroke={isPickup ? '#C8102E' : '#2E9E5B'}
                    strokeWidth="0.8"
                    className="animate-pulse"
                  />
                )}

                {/* Base Stop Pin */}
                <circle
                  cx={stop.x}
                  cy={stop.y}
                  r="2.8"
                  fill={isPickup ? '#C8102E' : isDest ? '#2E9E5B' : '#FFFFFF'}
                  stroke={isPickup ? '#9B0D24' : isDest ? '#1B5E20' : '#1F2933'}
                  strokeWidth="0.8"
                />

                <circle
                  cx={stop.x}
                  cy={stop.y}
                  r="1.1"
                  fill={isPickup || isDest ? '#FFFFFF' : '#C8102E'}
                />

                {/* Stop Label Banner */}
                <rect
                  x={stop.x - 11}
                  y={stop.y > 50 ? stop.y + 3.5 : stop.y - 7.5}
                  width="22"
                  height="4.2"
                  rx="2.1"
                  fill="#FFFFFF"
                  stroke={isPickup ? '#C8102E' : isDest ? '#2E9E5B' : '#E5E7EB'}
                  strokeWidth="0.4"
                  filter="drop-shadow(0px 1px 2px rgba(0,0,0,0.15))"
                />
                <text
                  x={stop.x}
                  y={stop.y > 50 ? stop.y + 6.4 : stop.y - 4.6}
                  textAnchor="middle"
                  fill={isPickup ? '#C8102E' : isDest ? '#2E9E5B' : '#1F2933'}
                  fontSize="2.1"
                  fontWeight="600"
                  fontFamily="Inter"
                >
                  {stop.shortName}
                </text>
              </g>
            );
          })}

          {/* UISI-01 LIVE SHUTTLE BUS MARKER */}
          <g
            style={{
              transform: `translate(${shuttlePos.x}px, ${shuttlePos.y}px)`,
              transition: 'transform 0.8s ease-out',
              opacity: shuttleState.dutyStatus === 'break' ? 0.38 : 1
            }}
          >
            {/* Pulsing ring around shuttle */}
            <circle
              cx="0"
              cy="0"
              r="4.2"
              fill="#C8102E"
              opacity="0.25"
              className="animate-ping"
            />
            <circle
              cx="0"
              cy="0"
              r="3.2"
              fill="#FFFFFF"
              stroke="#C8102E"
              strokeWidth="0.7"
              filter="drop-shadow(0px 2px 4px rgba(200,16,46,0.35))"
            />

            {/* Shuttle bus icon representation */}
            <rect
              x="-1.6"
              y="-1.5"
              width="3.2"
              height="3"
              rx="0.6"
              fill="#C8102E"
            />
            {/* Front windshield */}
            <rect
              x="-1.1"
              y="-1.1"
              width="2.2"
              height="1"
              rx="0.2"
              fill="#FFFFFF"
              opacity="0.9"
            />
            {/* Headlights */}
            <circle cx="-1" cy="0.9" r="0.25" fill="#FFD54F" />
            <circle cx="1" cy="0.9" r="0.25" fill="#FFD54F" />

            {/* Floating plate tag */}
            <rect
              x="-8"
              y="-6.4"
              width="16"
              height="3.6"
              rx="1.8"
              fill="#1F2933"
              stroke="#FFFFFF"
              strokeWidth="0.3"
              filter="drop-shadow(0px 1px 2px rgba(0,0,0,0.3))"
            />
            <text
              x="0"
              y="-4"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="1.9"
              fontWeight="700"
              fontFamily="Poppins"
            >
              UISI-01
            </text>
          </g>
        </svg>
      </motion.div>

      {/* Map Controls: 36px circles as mandated by COMPACT RULES */}
      {interactive && (
        <div className="absolute right-4 top-20 flex flex-col gap-2 z-10">
          <button
            onClick={() => handleZoom(0.2)}
            title="Perbesar"
            className="w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center text-[#1F2933] hover:bg-gray-50 active:scale-95 transition-all border border-[#E5E7EB]"
          >
            <span className="material-symbols-outlined text-[19px]">add</span>
          </button>
          <button
            onClick={() => handleZoom(-0.2)}
            title="Perkecil"
            className="w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center text-[#1F2933] hover:bg-gray-50 active:scale-95 transition-all border border-[#E5E7EB]"
          >
            <span className="material-symbols-outlined text-[19px]">remove</span>
          </button>
          <button
            onClick={handleRecenter}
            title="Pusatkan Armada"
            className="w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center text-[#C8102E] hover:bg-[#FDECEE] active:scale-95 transition-all border border-[#E5E7EB]"
          >
            <span className="material-symbols-outlined text-[19px]">my_location</span>
          </button>
        </div>
      )}
    </div>
  );
};
