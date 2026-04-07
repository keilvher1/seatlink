// ========================
// 도서관 관련 타입
// ========================
export interface ReadingRoom {
  name: string;
  totalSeats: number;
  usedSeats: number;
  availableSeats: number;
  congestionLevel: CongestionLevel;
  congestionPercent: number;
  lastUpdated: string;
}

export type CongestionLevel = "여유" | "보통" | "혼잡";

export interface Library {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  operatingHours: {
    weekday: string;
    saturday: string;
    holiday: string;
  };
  nightOperation: boolean;
  accessible: boolean;
  reservable: boolean;
  wifi: boolean;
  parking: boolean;
  todayVisitors: number;
  seatUsageRate: number;
  congestionLevel: CongestionLevel;
  rooms: ReadingRoom[];
  totalSeats: number;
  totalUsed: number;
  totalAvailable: number;
}

export interface LibraryWithDistance extends Library {
  distance: number; // km
  distanceText: string;
  travelMinutes: number;
}

// ========================
// AI 예측 관련 타입
// ========================
export interface PredictionData {
  hour: string;
  congestion: number;
  isPast: boolean;
}

export interface WeeklyHeatmapData {
  day: string;
  hours: number[]; // 06:00~22:00 혼잡도 (0-100)
}

// ========================
// 추천 관련 타입
// ========================
export interface RecommendationScore {
  total: number;
  seatScore: number;
  distanceScore: number;
  accessScore: number;
  facilityScore: number;
}

export interface RecommendedLibrary extends LibraryWithDistance {
  rank: number;
  score: RecommendationScore;
  prediction: {
    oneHourLater: number;
    trend: "up" | "down" | "stable";
    optimalTime: string;
  };
  transport: TransportInfo;
}

// ========================
// 교통 관련 타입
// ========================
export interface BikeStation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  availableBikes: number;
  totalDocks: number;
  distance: number;
}

export interface BusInfo {
  routeNumber: string;
  arrivalMinutes: number;
  stopName: string;
  stopDistance: number;
}

export interface AccessibleTransport {
  centerName: string;
  availableVehicles: number;
  totalVehicles: number;
  estimatedWait: number;
}

export interface TransportInfo {
  bikes: BikeStation[];
  buses: BusInfo[];
  accessibleTransport: AccessibleTransport | null;
}

// ========================
// 대시보드 관련 타입
// ========================
export interface DashboardKPI {
  totalLibraries: number;
  currentUsers: number;
  averageUsageRate: number;
  totalAvailableSeats: number;
  totalSeats: number;
}

export interface RegionUsage {
  region: string;
  usageRate: number;
}

export interface HourlyTrend {
  hour: string;
  today: number;
  lastWeek: number;
}

// ========================
// 커뮤니티 관련 타입
// ========================
export interface Review {
  id: string;
  userId: string;
  userName: string;
  libraryId: string;
  libraryName: string;
  roomName?: string;
  mood: string;
  content: string;
  rating?: number;
  helpful: number;
  comments: number;
  createdAt: string;
}

export interface StudyGroup {
  id: string;
  title: string;
  libraryName: string;
  location: string;
  currentMembers: number;
  maxMembers: number;
  schedule: string;
  time: string;
  description: string;
  tags: string[];
}
