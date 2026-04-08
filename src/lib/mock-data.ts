import {
  Library,
  LibraryWithDistance,
  PredictionData,
  WeeklyHeatmapData,
  BikeStation,
  BusInfo,
  AccessibleTransport,
  DashboardKPI,
  RegionUsage,
  HourlyTrend,
  Review,
  StudyGroup,
} from "./types";

// ========================
// 전국 도서관 목업 데이터
// ========================
export const mockLibraries: LibraryWithDistance[] = [
  // ===== 서울특별시 =====
  {
    id: "lib-001", name: "서울중앙도서관", address: "서울시 중구 세종대로 110",
    lat: 37.5636, lng: 126.975, phone: "02-2133-0300",
    operatingHours: { weekday: "09:00~22:00", saturday: "09:00~18:00", holiday: "09:00~17:00" },
    nightOperation: true, accessible: true, reservable: true, wifi: true, parking: true,
    todayVisitors: 482, seatUsageRate: 60, congestionLevel: "보통",
    rooms: [
      { name: "일반열람실", totalSeats: 80, usedSeats: 48, availableSeats: 32, congestionLevel: "보통", congestionPercent: 60, lastUpdated: "2분 전" },
      { name: "노트북열람실", totalSeats: 60, usedSeats: 18, availableSeats: 42, congestionLevel: "여유", congestionPercent: 30, lastUpdated: "2분 전" },
      { name: "수험생열람실", totalSeats: 100, usedSeats: 88, availableSeats: 12, congestionLevel: "혼잡", congestionPercent: 88, lastUpdated: "1분 전" },
    ],
    totalSeats: 240, totalUsed: 154, totalAvailable: 86, distance: 1.2, distanceText: "도보 15분", travelMinutes: 15,
  },
  {
    id: "lib-002", name: "강남구립도서관", address: "서울시 강남구 선릉로 668",
    lat: 37.5045, lng: 127.049, phone: "02-3448-4646",
    operatingHours: { weekday: "09:00~22:00", saturday: "09:00~18:00", holiday: "휴관" },
    nightOperation: true, accessible: true, reservable: false, wifi: true, parking: false,
    todayVisitors: 325, seatUsageRate: 78, congestionLevel: "혼잡",
    rooms: [
      { name: "제1열람실", totalSeats: 60, usedSeats: 52, availableSeats: 8, congestionLevel: "혼잡", congestionPercent: 87, lastUpdated: "3분 전" },
      { name: "제2열람실", totalSeats: 40, usedSeats: 38, availableSeats: 2, congestionLevel: "혼잡", congestionPercent: 95, lastUpdated: "1분 전" },
    ],
    totalSeats: 100, totalUsed: 90, totalAvailable: 10, distance: 3.8, distanceText: "버스 20분", travelMinutes: 20,
  },
  {
    id: "lib-003", name: "마포중앙도서관", address: "서울시 마포구 성암로 137",
    lat: 37.5665, lng: 126.899, phone: "02-3153-5800",
    operatingHours: { weekday: "09:00~18:00", saturday: "09:00~18:00", holiday: "휴관" },
    nightOperation: false, accessible: true, reservable: true, wifi: true, parking: true,
    todayVisitors: 198, seatUsageRate: 25, congestionLevel: "여유",
    rooms: [
      { name: "종합열람실", totalSeats: 120, usedSeats: 30, availableSeats: 90, congestionLevel: "여유", congestionPercent: 25, lastUpdated: "1분 전" },
    ],
    totalSeats: 120, totalUsed: 30, totalAvailable: 90, distance: 0.8, distanceText: "도보 10분", travelMinutes: 10,
  },
  {
    id: "lib-004", name: "송파구립도서관", address: "서울시 송파구 올리픽로 326",
    lat: 37.5145, lng: 127.1055, phone: "02-2147-2200",
    operatingHours: { weekday: "09:00~21:00", saturday: "09:00~17:00", holiday: "휴관" },
    nightOperation: true, accessible: true, reservable: true, wifi: true, parking: true,
    todayVisitors: 312, seatUsageRate: 38, congestionLevel: "여유",
    rooms: [
      { name: "일반열람실", totalSeats: 100, usedSeats: 35, availableSeats: 65, congestionLevel: "여유", congestionPercent: 35, lastUpdated: "1분 전" },
      { name: "노트북존", totalSeats: 40, usedSeats: 18, availableSeats: 22, congestionLevel: "여유", congestionPercent: 45, lastUpdated: "3분 전" },
    ],
    totalSeats: 140, totalUsed: 53, totalAvailable: 87, distance: 5.1, distanceText: "버스 25분", travelMinutes: 25,
  },

  // ===== 경기도 =====
  {
    id: "lib-010", name: "수원시립중앙도서관", address: "경기도 수원시 팔달구 효원로 304",
    lat: 37.2636, lng: 127.0286, phone: "031-228-4700",
    operatingHours: { weekday: "09:00~22:00", saturday: "09:00~18:00", holiday: "09:00~17:00" },
    nightOperation: true, accessible: true, reservable: true, wifi: true, parking: true,
    todayVisitors: 410, seatUsageRate: 72, congestionLevel: "보통",
    rooms: [
      { name: "종합열람실", totalSeats: 150, usedSeats: 108, availableSeats: 42, congestionLevel: "보통", congestionPercent: 72, lastUpdated: "2분 전" },
      { name: "디지털열람실", totalSeats: 60, usedSeats: 30, availableSeats: 30, congestionLevel: "여유", congestionPercent: 50, lastUpdated: "3분 전" },
    ],
    totalSeats: 210, totalUsed: 138, totalAvailable: 72, distance: 32.5, distanceText: "전철 50분", travelMinutes: 50,
  },
  {
    id: "lib-011", name: "성남시립분당도서관", address: "경기도 성남시 분당구 불정로 20",
    lat: 37.3595, lng: 127.1086, phone: "031-729-4600",
    operatingHours: { weekday: "09:00~22:00", saturday: "09:00~18:00", holiday: "휴관" },
    nightOperation: true, accessible: true, reservable: true, wifi: true, parking: true,
    todayVisitors: 356, seatUsageRate: 65, congestionLevel: "보통",
    rooms: [
      { name: "일반열람실", totalSeats: 200, usedSeats: 130, availableSeats: 70, congestionLevel: "보통", congestionPercent: 65, lastUpdated: "1분 전" },
    ],
    totalSeats: 200, totalUsed: 130, totalAvailable: 70, distance: 18.2, distanceText: "전철 35분", travelMinutes: 35,
  },
  {
    id: "lib-012", name: "고양시립대화도서관", address: "경기도 고양시 일산서구 대화동 2606",
    lat: 37.6765, lng: 126.7452, phone: "031-8075-9140",
    operatingHours: { weekday: "09:00~22:00", saturday: "09:00~18:00", holiday: "휴관" },
    nightOperation: true, accessible: true, reservable: false, wifi: true, parking: true,
    todayVisitors: 278, seatUsageRate: 55, congestionLevel: "보통",
    rooms: [
      { name: "종합열람실", totalSeats: 120, usedSeats: 66, availableSeats: 54, congestionLevel: "보통", congestionPercent: 55, lastUpdated: "2분 전" },
    ],
    totalSeats: 120, totalUsed: 66, totalAvailable: 54, distance: 22.1, distanceText: "전철 40분", travelMinutes: 40,
  },

  // ===== 인천광역시 =====
  {
    id: "lib-020", name: "인천광역시립중앙도서관", address: "인천시 남동구 정각로 9",
    lat: 37.4482, lng: 126.7014, phone: "032-440-8700",
    operatingHours: { weekday: "09:00~22:00", saturday: "09:00~18:00", holiday: "09:00~17:00" },
    nightOperation: true, accessible: true, reservable: true, wifi: true, parking: true,
    todayVisitors: 389, seatUsageRate: 68, congestionLevel: "보통",
    rooms: [
      { name: "종합열람실", totalSeats: 180, usedSeats: 122, availableSeats: 58, congestionLevel: "보통", congestionPercent: 68, lastUpdated: "1분 전" },
      { name: "노트북열람실", totalSeats: 50, usedSeats: 20, availableSeats: 30, congestionLevel: "여유", congestionPercent: 40, lastUpdated: "2분 전" },
    ],
    totalSeats: 230, totalUsed: 142, totalAvailable: 88, distance: 35.0, distanceText: "전철 55분", travelMinutes: 55,
  },

  // ===== 부산광역시 =====
  {
    id: "lib-030", name: "부산시립시민도서관", address: "부산시 부산진구 중앙대로 678",
    lat: 35.1547, lng: 129.0603, phone: "051-810-8200",
    operatingHours: { weekday: "09:00~22:00", saturday: "09:00~18:00", holiday: "09:00~17:00" },
    nightOperation: true, accessible: true, reservable: true, wifi: true, parking: true,
    todayVisitors: 520, seatUsageRate: 82, congestionLevel: "혼잡",
    rooms: [
      { name: "종합열람실", totalSeats: 200, usedSeats: 170, availableSeats: 30, congestionLevel: "혼잡", congestionPercent: 85, lastUpdated: "1분 전" },
      { name: "디지털열람실", totalSeats: 80, usedSeats: 55, availableSeats: 25, congestionLevel: "보통", congestionPercent: 69, lastUpdated: "2분 전" },
    ],
    totalSeats: 280, totalUsed: 225, totalAvailable: 55, distance: 325.0, distanceText: "KTX 2시간 30분", travelMinutes: 150,
  },
  {
    id: "lib-031", name: "부산시립해운대도서관", address: "부산시 해운대구 양운로 91",
    lat: 35.1631, lng: 129.1600, phone: "051-749-6581",
    operatingHours: { weekday: "09:00~21:00", saturday: "09:00~17:00", holiday: "휴관" },
    nightOperation: true, accessible: true, reservable: true, wifi: true, parking: true,
    todayVisitors: 298, seatUsageRate: 45, congestionLevel: "여유",
    rooms: [
      { name: "일반열람실", totalSeats: 150, usedSeats: 68, availableSeats: 82, congestionLevel: "여유", congestionPercent: 45, lastUpdated: "2분 전" },
    ],
    totalSeats: 150, totalUsed: 68, totalAvailable: 82, distance: 330.0, distanceText: "KTX 2시간 40분", travelMinutes: 160,
  },

  // ===== 대구광역시 =====
  {
    id: "lib-040", name: "대구광역시립중앙도서관", address: "대구시 중구 2·28로 320",
    lat: 35.8714, lng: 128.6014, phone: "053-231-2100",
    operatingHours: { weekday: "09:00~22:00", saturday: "09:00~18:00", holiday: "09:00~17:00" },
    nightOperation: true, accessible: true, reservable: true, wifi: true, parking: true,
    todayVisitors: 445, seatUsageRate: 75, congestionLevel: "보통",
    rooms: [
      { name: "종합열람실", totalSeats: 180, usedSeats: 135, availableSeats: 45, congestionLevel: "보통", congestionPercent: 75, lastUpdated: "1분 전" },
      { name: "수험생열람실", totalSeats: 100, usedSeats: 88, availableSeats: 12, congestionLevel: "혼잡", congestionPercent: 88, lastUpdated: "2분 전" },
    ],
    totalSeats: 280, totalUsed: 223, totalAvailable: 57, distance: 237.0, distanceText: "KTX 1시간 50분", travelMinutes: 110,
  },

  // ===== 광주광역시 =====
  {
    id: "lib-050", name: "광주광역시립무등도서관", address: "광주시 동구 독립로 268",
    lat: 35.1459, lng: 126.9219, phone: "062-226-0100",
    operatingHours: { weekday: "09:00~22:00", saturday: "09:00~18:00", holiday: "09:00~17:00" },
    nightOperation: true, accessible: true, reservable: true, wifi: true, parking: true,
    todayVisitors: 367, seatUsageRate: 58, congestionLevel: "보통",
    rooms: [
      { name: "종합열람실", totalSeats: 160, usedSeats: 93, availableSeats: 67, congestionLevel: "보통", congestionPercent: 58, lastUpdated: "2분 전" },
    ],
    totalSeats: 160, totalUsed: 93, totalAvailable: 67, distance: 268.0, distanceText: "KTX 1시간 30분", travelMinutes: 90,
  },

  // ===== 대전광역시 =====
  {
    id: "lib-060", name: "대전한밭도서관", address: "대전시 서구 한밭대로 700",
    lat: 36.3504, lng: 127.3845, phone: "042-520-2345",
    operatingHours: { weekday: "09:00~22:00", saturday: "09:00~18:00", holiday: "09:00~17:00" },
    nightOperation: true, accessible: true, reservable: true, wifi: true, parking: true,
    todayVisitors: 398, seatUsageRate: 62, congestionLevel: "보통",
    rooms: [
      { name: "종합열람실", totalSeats: 200, usedSeats: 124, availableSeats: 76, congestionLevel: "보통", congestionPercent: 62, lastUpdated: "1분 전" },
      { name: "노트북열람실", totalSeats: 60, usedSeats: 25, availableSeats: 35, congestionLevel: "여유", congestionPercent: 42, lastUpdated: "3분 전" },
    ],
    totalSeats: 260, totalUsed: 149, totalAvailable: 111, distance: 140.0, distanceText: "KTX 50분", travelMinutes: 50,
  },

  // ===== 울산광역시 =====
  {
    id: "lib-070", name: "울산광역시립중앙도서관", address: "울산시 남구 중앙로 201",
    lat: 35.5384, lng: 129.3114, phone: "052-229-6100",
    operatingHours: { weekday: "09:00~22:00", saturday: "09:00~18:00", holiday: "휴관" },
    nightOperation: true, accessible: true, reservable: false, wifi: true, parking: true,
    todayVisitors: 287, seatUsageRate: 52, congestionLevel: "보통",
    rooms: [
      { name: "종합열람실", totalSeats: 140, usedSeats: 73, availableSeats: 67, congestionLevel: "보통", congestionPercent: 52, lastUpdated: "2분 전" },
    ],
    totalSeats: 140, totalUsed: 73, totalAvailable: 67, distance: 307.0, distanceText: "KTX 2시간 10분", travelMinutes: 130,
  },

  // ===== 세종특별자치시 =====
  {
    id: "lib-080", name: "세종시립도서관", address: "세종시 조치원읍 군청로 95",
    lat: 36.6040, lng: 127.0016, phone: "044-300-8800",
    operatingHours: { weekday: "09:00~22:00", saturday: "09:00~18:00", holiday: "09:00~17:00" },
    nightOperation: true, accessible: true, reservable: true, wifi: true, parking: true,
    todayVisitors: 215, seatUsageRate: 42, congestionLevel: "여유",
    rooms: [
      { name: "종합열람실", totalSeats: 120, usedSeats: 50, availableSeats: 70, congestionLevel: "여유", congestionPercent: 42, lastUpdated: "1분 전" },
    ],
    totalSeats: 120, totalUsed: 50, totalAvailable: 70, distance: 120.0, distanceText: "고속버스 1시간 30분", travelMinutes: 90,
  },

  // ===== 강원특별자치도 =====
  {
    id: "lib-090", name: "춘천시립도서관", address: "강원도 춘천시 옥천로 35",
    lat: 37.8813, lng: 127.7300, phone: "033-245-5500",
    operatingHours: { weekday: "09:00~21:00", saturday: "09:00~17:00", holiday: "휴관" },
    nightOperation: true, accessible: true, reservable: false, wifi: true, parking: true,
    todayVisitors: 178, seatUsageRate: 35, congestionLevel: "여유",
    rooms: [
      { name: "종합열람실", totalSeats: 100, usedSeats: 35, availableSeats: 65, congestionLevel: "여유", congestionPercent: 35, lastUpdated: "3분 전" },
    ],
    totalSeats: 100, totalUsed: 35, totalAvailable: 65, distance: 75.0, distanceText: "ITX 1시간 10분", travelMinutes: 70,
  },
  {
    id: "lib-091", name: "강릉시립도서관", address: "강원도 강릉시 경강로 2046",
    lat: 37.7519, lng: 128.8761, phone: "033-640-5100",
    operatingHours: { weekday: "09:00~18:00", saturday: "09:00~17:00", holiday: "휴관" },
    nightOperation: false, accessible: true, reservable: false, wifi: true, parking: true,
    todayVisitors: 132, seatUsageRate: 28, congestionLevel: "여유",
    rooms: [
      { name: "종합열람실", totalSeats: 80, usedSeats: 22, availableSeats: 58, congestionLevel: "여유", congestionPercent: 28, lastUpdated: "5분 전" },
    ],
    totalSeats: 80, totalUsed: 22, totalAvailable: 58, distance: 165.0, distanceText: "KTX 2시간", travelMinutes: 120,
  },

  // ===== 충청북도 =====
  {
    id: "lib-100", name: "청주시립도서관", address: "충북 청주시 상당구 상당로 86",
    lat: 36.6424, lng: 127.4890, phone: "043-201-4090",
    operatingHours: { weekday: "09:00~22:00", saturday: "09:00~18:00", holiday: "휴관" },
    nightOperation: true, accessible: true, reservable: true, wifi: true, parking: true,
    todayVisitors: 310, seatUsageRate: 58, congestionLevel: "보통",
    rooms: [
      { name: "종합열람실", totalSeats: 160, usedSeats: 93, availableSeats: 67, congestionLevel: "보통", congestionPercent: 58, lastUpdated: "2분 전" },
    ],
    totalSeats: 160, totalUsed: 93, totalAvailable: 67, distance: 110.0, distanceText: "고속버스 1시간 30분", travelMinutes: 90,
  },

  // ===== 충청남도 =====
  {
    id: "lib-110", name: "천안시립도서관", address: "충남 천안시 서북구 중앙로 115",
    lat: 36.8151, lng: 127.1139, phone: "041-521-2200",
    operatingHours: { weekday: "09:00~22:00", saturday: "09:00~18:00", holiday: "휴관" },
    nightOperation: true, accessible: true, reservable: true, wifi: true, parking: true,
    todayVisitors: 345, seatUsageRate: 63, congestionLevel: "보통",
    rooms: [
      { name: "종합열람실", totalSeats: 140, usedSeats: 88, availableSeats: 52, congestionLevel: "보통", congestionPercent: 63, lastUpdated: "1분 전" },
    ],
    totalSeats: 140, totalUsed: 88, totalAvailable: 52, distance: 85.0, distanceText: "KTX 30분", travelMinutes: 30,
  },

  // ===== 전라북도 =====
  {
    id: "lib-120", name: "전주시립도서관", address: "전북 전주시 완산구 전주객사5길 16",
    lat: 35.8242, lng: 127.1480, phone: "063-281-1400",
    operatingHours: { weekday: "09:00~22:00", saturday: "09:00~18:00", holiday: "09:00~17:00" },
    nightOperation: true, accessible: true, reservable: true, wifi: true, parking: true,
    todayVisitors: 290, seatUsageRate: 48, congestionLevel: "여유",
    rooms: [
      { name: "종합열람실", totalSeats: 130, usedSeats: 62, availableSeats: 68, congestionLevel: "여유", congestionPercent: 48, lastUpdated: "2분 전" },
    ],
    totalSeats: 130, totalUsed: 62, totalAvailable: 68, distance: 200.0, distanceText: "KTX 1시간 30분", travelMinutes: 90,
  },

  // ===== 전라남도 =====
  {
    id: "lib-130", name: "여수시립돌산도서관", address: "전남 여수시 돌산읍 평사리길 26",
    lat: 34.7376, lng: 127.7406, phone: "061-659-4272",
    operatingHours: { weekday: "09:00~18:00", saturday: "09:00~17:00", holiday: "휴관" },
    nightOperation: false, accessible: true, reservable: false, wifi: true, parking: true,
    todayVisitors: 156, seatUsageRate: 32, congestionLevel: "여유",
    rooms: [
      { name: "종합열람실", totalSeats: 80, usedSeats: 26, availableSeats: 54, congestionLevel: "여유", congestionPercent: 32, lastUpdated: "5분 전" },
    ],
    totalSeats: 80, totalUsed: 26, totalAvailable: 54, distance: 350.0, distanceText: "KTX+버스 3시간", travelMinutes: 180,
  },
  {
    id: "lib-131", name: "목포시립도서관", address: "전남 목포시 영산로 155",
    lat: 34.8118, lng: 126.3922, phone: "061-270-8400",
    operatingHours: { weekday: "09:00~21:00", saturday: "09:00~17:00", holiday: "휴관" },
    nightOperation: true, accessible: true, reservable: true, wifi: true, parking: true,
    todayVisitors: 198, seatUsageRate: 40, congestionLevel: "여유",
    rooms: [
      { name: "종합열람실", totalSeats: 100, usedSeats: 40, availableSeats: 60, congestionLevel: "여유", congestionPercent: 40, lastUpdated: "2분 전" },
    ],
    totalSeats: 100, totalUsed: 40, totalAvailable: 60, distance: 310.0, distanceText: "KTX 2시간 30분", travelMinutes: 150,
  },

  // ===== 경상북도 =====
  {
    id: "lib-140", name: "포항시립중앙도서관", address: "경북 포항시 남구 중앙로 72",
    lat: 36.0190, lng: 129.3435, phone: "054-270-2700",
    operatingHours: { weekday: "09:00~22:00", saturday: "09:00~18:00", holiday: "휴관" },
    nightOperation: true, accessible: true, reservable: true, wifi: true, parking: true,
    todayVisitors: 265, seatUsageRate: 55, congestionLevel: "보통",
    rooms: [
      { name: "종합열람실", totalSeats: 120, usedSeats: 66, availableSeats: 54, congestionLevel: "보통", congestionPercent: 55, lastUpdated: "2분 전" },
    ],
    totalSeats: 120, totalUsed: 66, totalAvailable: 54, distance: 270.0, distanceText: "KTX+버스 2시간 30분", travelMinutes: 150,
  },

  // ===== 경상남도 =====
  {
    id: "lib-150", name: "창원시립마산도서관", address: "경날 창원시 마산합포구 3·15대로 229",
    lat: 35.1798, lng: 128.5728, phone: "055-225-4900",
    operatingHours: { weekday: "09:00~22:00", saturday: "09:00~18:00", holiday: "휴관" },
    nightOperation: true, accessible: true, reservable: true, wifi: true, parking: true,
    todayVisitors: 342, seatUsageRate: 68, congestionLevel: "보통",
    rooms: [
      { name: "종합열람실", totalSeats: 150, usedSeats: 102, availableSeats: 48, congestionLevel: "보통", congestionPercent: 68, lastUpdated: "1분 전" },
    ],
    totalSeats: 150, totalUsed: 102, totalAvailable: 48, distance: 290.0, distanceText: "KTX 2시간", travelMinutes: 120,
  },

  // ===== 제주특별자치도 =====
  {
    id: "lib-160", name: "제주시립도서관", address: "제주시 이도2동 1719-2",
    lat: 33.4996, lng: 126.5312, phone: "064-728-8600",
    operatingHours: { weekday: "09:00~21:00", saturday: "09:00~17:00", holiday: "휴관" },
    nightOperation: true, accessible: true, reservable: true, wifi: true, parking: true,
    todayVisitors: 210, seatUsageRate: 38, congestionLevel: "여유",
    rooms: [
      { name: "종합열람실", totalSeats: 110, usedSeats: 42, availableSeats: 68, congestionLevel: "여유", congestionPercent: 38, lastUpdated: "3분 전" },
    ],
    totalSeats: 110, totalUsed: 42, totalAvailable: 68, distance: 450.0, distanceText: "비행기 1시간", travelMinutes: 60,
  },
  {
    id: "lib-161", name: "서귀포시립도서관", address: "제주 서귀포시 중앙로 105",
    lat: 33.2541, lng: 126.5600, phone: "064-760-3072",
    operatingHours: { weekday: "09:00~18:00", saturday: "09:00~17:00", holiday: "휴관" },
    nightOperation: false, accessible: true, reservable: false, wifi: true, parking: true,
    todayVisitors: 145, seatUsageRate: 25, congestionLevel: "여유",
    rooms: [
      { name: "종합열람실", totalSeats: 80, usedSeats: 20, availableSeats: 60, congestionLevel: "여유", congestionPercent: 25, lastUpdated: "5분 전" },
    ],
    totalSeats: 80, totalUsed: 20, totalAvailable: 60, distance: 460.0, distanceText: "비행기+버스 1시간 30분", travelMinutes: 90,
  },
];

// ========================
// AI 예측 목업 데이터
// ========================
export const mockPrediction: PredictionData[] = [
  { hour: "06:00", congestion: 8, isPast: true },
  { hour: "07:00", congestion: 12, isPast: true },
  { hour: "08:00", congestion: 28, isPast: true },
  { hour: "09:00", congestion: 48, isPast: true },
  { hour: "10:00", congestion: 68, isPast: true },
  { hour: "11:00", congestion: 82, isPast: true },
  { hour: "12:00", congestion: 62, isPast: true },
  { hour: "13:00", congestion: 55, isPast: false },
  { hour: "14:00", congestion: 42, isPast: false },
  { hour: "15:00", congestion: 48, isPast: false },
  { hour: "16:00", congestion: 63, isPast: false },
  { hour: "17:00", congestion: 75, isPast: false },
  { hour: "18:00", congestion: 88, isPast: false },
  { hour: "19:00", congestion: 92, isPast: false },
  { hour: "20:00", congestion: 78, isPast: false },
  { hour: "21:00", congestion: 50, isPast: false },
  { hour: "22:00", congestion: 20, isPast: false },
];

export const mockWeeklyHeatmap: WeeklyHeatmapData[] = [
  { day: "월", hours: [5,10,25,50,70,85,65,45,35,42,60,78,88,80,55,30,10] },
  { day: "화", hours: [5,12,30,55,72,80,60,42,38,45,62,75,85,78,52,28,8] },
  { day: "수", hours: [8,15,32,58,75,82,58,40,35,48,65,80,90,82,58,32,12] },
  { day: "목", hours: [6,10,28,52,68,78,55,38,32,40,58,72,82,75,50,25,8] },
  { day: "금", hours: [5,8,22,45,62,72,50,35,30,38,55,68,78,70,45,22,5] },
  { day: "토", hours: [3,5,10,20,35,50,60,65,70,68,62,55,48,40,30,18,5] },
  { day: "일", hours: [2,3,8,15,25,35,42,48,52,50,45,40,35,28,20,12,3] },
];

// ========================
// 교통 목업 데이터
// ========================
export const mockBikeStations: BikeStation[] = [
  { id: "bike-001", name: "세종대로사거리 대여소", lat: 37.564, lng: 126.976, availableBikes: 5, totalDocks: 15, distance: 0.05 },
  { id: "bike-002", name: "시청역 2번출구 대여소", lat: 37.565, lng: 126.977, availableBikes: 8, totalDocks: 20, distance: 0.12 },
];

export const mockBuses: BusInfo[] = [
  { routeNumber: "302", arrivalMinutes: 3, stopName: "세종대로사거리", stopDistance: 0.2 },
  { routeNumber: "501", arrivalMinutes: 8, stopName: "세종대로사거리", stopDistance: 0.2 },
  { routeNumber: "707", arrivalMinutes: 15, stopName: "서울역", stopDistance: 0.5 },
];

export const mockAccessibleTransport: AccessibleTransport = {
  centerName: "중구 교통약자이동지원센터",
  availableVehicles: 2,
  totalVehicles: 8,
  estimatedWait: 15,
};

// ========================
// 대시보드 목업 데이터
// ========================
export const mockDashboardKPI: DashboardKPI = {
  totalLibraries: 3247,
  currentUsers: 45832,
  averageUsageRate: 67.3,
  totalAvailableSeats: 52168,
  totalSeats: 158000,
};

export const mockRegionUsage: RegionUsage[] = [
  { region: "서울", usageRate: 78 },
  { region: "경기", usageRate: 72 },
  { region: "부산", usageRate: 68 },
  { region: "대구", usageRate: 65 },
  { region: "인천", usageRate: 63 },
  { region: "광주", usageRate: 60 },
  { region: "대전", usageRate: 58 },
  { region: "울산", usageRate: 55 },
  { region: "세종", usageRate: 52 },
  { region: "경남", usageRate: 50 },
  { region: "충남", usageRate: 48 },
  { region: "전남", usageRate: 45 },
  { region: "경북", usageRate: 43 },
  { region: "충북", usageRate: 42 },
  { region: "전북", usageRate: 40 },
  { region: "강원", usageRate: 38 },
  { region: "제주", usageRate: 35 },
];

export const mockHourlyTrend: HourlyTrend[] = [
  { hour: "06:00", today: 8, lastWeek: 6 },
  { hour: "07:00", today: 15, lastWeek: 12 },
  { hour: "08:00", today: 32, lastWeek: 28 },
  { hour: "09:00", today: 55, lastWeek: 50 },
  { hour: "10:00", today: 72, lastWeek: 68 },
  { hour: "11:00", today: 85, lastWeek: 80 },
  { hour: "12:00", today: 65, lastWeek: 62 },
  { hour: "13:00", today: 58, lastWeek: 55 },
  { hour: "14:00", today: 45, lastWeek: 48 },
  { hour: "15:00", today: 52, lastWeek: 50 },
  { hour: "16:00", today: 68, lastWeek: 65 },
  { hour: "17:00", today: 78, lastWeek: 72 },
  { hour: "18:00", today: 88, lastWeek: 82 },
  { hour: "19:00", today: 92, lastWeek: 85 },
  { hour: "20:00", today: 80, lastWeek: 75 },
  { hour: "21:00", today: 55, lastWeek: 50 },
  { hour: "22:00", today: 22, lastWeek: 18 },
];

// ========================
// 커뮤니티 목업 데이터
// ========================
export const mockReviews: Review[] = [
  {
    id: "r1", userId: "u1", userName: "김*수",
    libraryId: "lib-001", libraryName: "서울중앙도서관", roomName: "일반열람실",
    mood: "🤫 조용해요",
    content: "3층 열람실 지금 조용하고 자리도 넉넉해요. 콘센트 자리는 거의 찼지만 일반 자리는 여유 있습니다 👍",
    helpful: 23, comments: 3, createdAt: "15분 전",
  },
  {
    id: "r2", userId: "u2", userName: "이*연",
    libraryId: "lib-003", libraryName: "마포중앙도서관", roomName: "종합열람실",
    mood: "💪 집중 잘 돼요",
    content: "오늘 여기 분위기 최고입니다. 사람도 적고 에어컨도 적절해요. 오래 앉아있기 좋아요.",
    helpful: 15, comments: 1, createdAt: "32분 전",
  },
  {
    id: "r3", userId: "u3", userName: "박*호",
    libraryId: "lib-002", libraryName: "강남구립도서관",
    mood: "😰 복잡해요",
    content: "2층 열람실 거의 만석이에요. 자리 잡으려면 일찍 오셔야 함. 니다. 1웸은 그나마 괜참았요.",
    helpful: 31, comments: 5, createdAt: "1시간 전",
  },
  {
    id: "r4", userId: "u4", userName: "최*진",
    libraryId: "lib-030", libraryName: "부산시립시민도서관", roomName: "디지털열람실",
    mood: "😊 좋아요",
    content: "디지털열람실 리모델링하고 나서 정말 좋아졌어요! 모니터도 크고 의자도 편해요.",
    helpful: 42, comments: 7, createdAt: "2시간 전",
  },
  {
    id: "r5", userId: "u5", userName: "정*현",
    libraryId: "lib-060", libraryName: "대전한밭도서관", roomName: "노툸북존",
    mood: "😊 좋아요",
    content: "노툸북존 자리 넉넜하고 콜센트 캙분합니다. 와이파이도 빠라는. 단 컴피 반입은 안됸요.",
    helpful: 18, comments: 2, createdAt: "3시간 전",
  },
];

export const mockStudyGroups: StudyGroup[] = [
  {
    id: "sg1", title: "공무원 시험 스터디",
    libraryName: "서울중앙도서관", location: "3층 열람실",
    currentMembers: 4, maxMembers: 6,
    schedule: "매주 월·수·금", time: "09:00~13:00",
    description: "행정법, 헌법 같이 공부하시면 분 모집합니다. 서로 질문하고 모의고사 함께 퐀어요!",
    tags: ["공분�", "ى정법", "헌법"],
  },
  {
    id: "sg2", title: "수능 수학 스터디",
    libraryName: "마포중앙도서관", location: "종합열람실",
    currentMembers: 3, maxMembers: 5,
    schedule: "매일", time: "14:00~18:00",
    description: "수능 수학 기초 풀이 스터디입니다. 키리큐러합 함께 도전해요.",
    tags: ["수능", "수학", "기초"],
  },
  {
    id: "sg3", title: "토익 900+ 목표반",
    libraryName: "강남구립도서관", location: "제1열람실",
    currentMembers: 5, maxMembers: 8,
    schedule: "매주 화·목·토", time: "10:00~12:00",
    description: "토익 900점 이상 목표! LC/RC 파트별로 번갈아 스터디합니다.",
    tags: ["토익", "영어", "TOEIC"],
  },
  {
    id: "sg4", title: "📖 인문학 독서 모임",
    libraryName: "송파구립도서관", location: "자유열람실",
    currentMembers: 6, maxMembers: 10,
    schedule: "격주 일요일", time: "14:00~16:00",
    description: "한 달에 2권 인문학 책을 읽고 토론합니다. 편하게 오세요!",
    tags: ["독서", "인문학", "토론"],
  },
];
