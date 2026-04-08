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
// ì êµ­ ëìê´ ëª©ì ë°ì´í°
// ========================
export const mockLibraries: LibraryWithDistance[] = [
  // ===== ìì¸í¹ë³ì =====
  {
    id: "lib-001", name: "ìì¸ì¤ìëìê´", address: "ìì¸ì ì¤êµ¬ ì¸ì¢ëë¡ 110",
    lat: 37.5636, lng: 126.975, phone: "02-2133-0300",
    operatingHours: { weekday: "09:00~22:00", saturday: "09:00~18:00", holiday: "09:00~17:00" },
    nightOperation: true, accessible: true, reservable: true, wifi: true, parking: true,
    todayVisitors: 482, seatUsageRate: 60, congestionLevel: "ë³´íµ",
    rooms: [
      { name: "ì¼ë°ì´ëì¤", totalSeats: 80, usedSeats: 48, availableSeats: 32, congestionLevel: "ë³´íµ", congestionPercent: 60, lastUpdated: "2ë¶ ì " },
      { name: "ë¸í¸ë¶ì´ëì¤", totalSeats: 60, usedSeats: 18, availableSeats: 42, congestionLevel: "ì¬ì ", congestionPercent: 30, lastUpdated: "2ë¶ ì " },
      { name: "ìíìì´ëì¤", totalSeats: 100, usedSeats: 88, availableSeats: 12, congestionLevel: "í¼ì¡", congestionPercent: 88, lastUpdated: "1ë¶ ì " },
    ],
    totalSeats: 240, totalUsed: 154, totalAvailable: 86, distance: 1.2, distanceText: "ëë³´ 15ë¶", travelMinutes: 15,
  },
  {
    id: "lib-002", name: "ê°ë¨êµ¬ë¦½ëìê´", address: "ìì¸ì ê°ë¨êµ¬ ì ë¦ë¡ 668",
    lat: 37.5045, lng: 127.049, phone: "02-3448-4646",
    operatingHours: { weekday: "09:00~22:00", saturday: "09:00~18:00", holiday: "í´ê´" },
    nightOperation: true, accessible: true, reservable: false, wifi: true, parking: false,
    todayVisitors: 325, seatUsageRate: 78, congestionLevel: "í¼ì¡",
    rooms: [
      { name: "ì 1ì´ëì¤", totalSeats: 60, usedSeats: 52, availableSeats: 8, congestionLevel: "í¼ì¡", congestionPercent: 87, lastUpdated: "3ë¶ ì " },
      { name: "ì 2ì´ëì¤", totalSeats: 40, usedSeats: 38, availableSeats: 2, congestionLevel: "í¼ì¡", congestionPercent: 95, lastUpdated: "1ë¶ ì " },
    ],
    totalSeats: 100, totalUsed: 90, totalAvailable: 10, distance: 3.8, distanceText: "ë²ì¤ 20ë¶", travelMinutes: 20,
  },
  {
    id: "lib-003", name: "ë§í¬ì¤ìëìê´", address: "ìì¸ì ë§í¬êµ¬ ì±ìë¡ 137",
    lat: 37.5665, lng: 126.899, phone: "02-3153-5800",
    operatingHours: { weekday: "09:00~18:00", saturday: "09:00~18:00", holiday: "í´ê´" },
    nightOperation: false, accessible: true, reservable: true, wifi: true, parking: true,
    todayVisitors: 198, seatUsageRate: 25, congestionLevel: "ì¬ì ",
    rooms: [
      { name: "ì¢í©ì´ëì¤", totalSeats: 120, usedSeats: 30, availableSeats: 90, congestionLevel: "ì¬ì ", congestionPercent: 25, lastUpdated: "1ë¶ ì " },
    ],
    totalSeats: 120, totalUsed: 30, totalAvailable: 90, distance: 0.8, distanceText: "ëë³´ 10ë¶", travelMinutes: 10,
  },
  {
    id: "lib-004", name: "ì¡íêµ¬ë¦½ëìê´", address: "ìì¸ì ì¡íêµ¬ ì¬ë¦¼í½ë¡ 326",
    lat: 37.5145, lng: 127.1055, phone: "02-2147-2200",
    operatingHours: { weekday: "09:00~21:00", saturday: "09:00~17:00", holiday: "í´ê´" },
    nightOperation: true, accessible: true, reservable: true, wifi: true, parking: true,
    todayVisitors: 312, seatUsageRate: 38, congestionLevel: "ì¬ì ",
    rooms: [
      { name: "ì¼ë°ì´ëì¤", totalSeats: 100, usedSeats: 35, availableSeats: 65, congestionLevel: "ì¬ì ", congestionPercent: 35, lastUpdated: "1ë¶ ì " },
      { name: "ë¸í¸ë¶ì¡´", totalSeats: 40, usedSeats: 18, availableSeats: 22, congestionLevel: "ì¬ì ", congestionPercent: 45, lastUpdated: "3ë¶ ì " },
    ],
    totalSeats: 140, totalUsed: 53, totalAvailable: 87, distance: 5.1, distanceText: "ë²ì¤ 25ë¶", travelMinutes: 25,
  },

  // ===== ê²½ê¸°ë =====
  {
    id: "lib-010", name: "ìììë¦½ì¤ìëìê´", address: "ê²½ê¸°ë ììì íë¬êµ¬ í¨ìë¡ 304",
    lat: 37.2636, lng: 127.0286, phone: "031-228-4700",
    operatingHours: { weekday: "09:00~22:00", saturday: "09:00~18:00", holiday: "09:00~17:00" },
    nightOperation: true, accessible: true, reservable: true, wifi: true, parking: true,
    todayVisitors: 410, seatUsageRate: 72, congestionLevel: "ë³´íµ",
    rooms: [
      { name: "ì¢í©ì´ëì¤", totalSeats: 150, usedSeats: 108, availableSeats: 42, congestionLevel: "ë³´íµ", congestionPercent: 72, lastUpdated: "2ë¶ ì " },
      { name: "ëì§í¸ì´ëì¤", totalSeats: 60, usedSeats: 30, availableSeats: 30, congestionLevel: "ì¬ì ", congestionPercent: 50, lastUpdated: "3ë¶ ì " },
    ],
    totalSeats: 210, totalUsed: 138, totalAvailable: 72, distance: 32.5, distanceText: "ì ì²  50ë¶", travelMinutes: 50,
  },
  {
    id: "lib-011", name: "ì±ë¨ìë¦½ë¶ë¹ëìê´", address: "ê²½ê¸°ë ì±ë¨ì ë¶ë¹êµ¬ ë¶ì ë¡ 20",
    lat: 37.3595, lng: 127.1086, phone: "031-729-4600",
    operatingHours: { weekday: "09:00~22:00", saturday: "09:00~18:00", holiday: "í´ê´" },
    nightOperation: true, accessible: true, reservable: true, wifi: true, parking: true,
    todayVisitors: 356, seatUsageRate: 65, congestionLevel: "ë³´íµ",
    rooms: [
      { name: "ì¼ë°ì´ëì¤", totalSeats: 200, usedSeats: 130, availableSeats: 70, congestionLevel: "ë³´íµ", congestionPercent: 65, lastUpdated: "1ë¶ ì " },
    ],
    totalSeats: 200, totalUsed: 130, totalAvailable: 70, distance: 18.2, distanceText: "ì ì²  35ë¶", travelMinutes: 35,
  },
  {
    id: "lib-012", name: "ê³ ììë¦½ëíëìê´", address: "ê²½ê¸°ë ê³ ìì ì¼ì°ìêµ¬ ëíë 2606",
    lat: 37.6765, lng: 126.7452, phone: "031-8075-9140",
    operatingHours: { weekday: "09:00~22:00", saturday: "09:00~18:00", holiday: "í´ê´" },
    nightOperation: true, accessible: true, reservable: false, wifi: true, parking: true,
    todayVisitors: 278, seatUsageRate: 55, congestionLevel: "ë³´íµ",
    rooms: [
      { name: "ì¢í©ì´ëì¤", totalSeats: 120, usedSeats: 66, availableSeats: 54, congestionLevel: "ë³´íµ", congestionPercent: 55, lastUpdated: "2ë¶ ì " },
    ],
    totalSeats: 120, totalUsed: 66, totalAvailable: 54, distance: 22.1, distanceText: "ì ì²  40ë¶", travelMinutes: 40,
  },

  // ===== ì¸ì²ê´ì­ì =====
  {
    id: "lib-020", name: "ì¸ì²ê´ì­ìë¦½ì¤ìëìê´", address: "ì¸ì²ì ë¨ëêµ¬ ì ê°ë¡ 9",
    lat: 37.4482, lng: 126.7014, phone: "032-440-8700",
    operatingHours: { weekday: "09:00~22:00", saturday: "09:00~18:00", holiday: "09:00~17:00" },
    nightOperation: true, accessible: true, reservable: true, wifi: true, parking: true,
    todayVisitors: 389, seatUsageRate: 68, congestionLevel: "ë³´íµ",
    rooms: [
      { name: "ì¢í©ì´ëì¤", totalSeats: 180, usedSeats: 122, availableSeats: 58, congestionLevel: "ë³´íµ", congestionPercent: 68, lastUpdated: "1ë¶ ì " },
      { name: "ë¸í¸ë¶ì´ëì¤", totalSeats: 50, usedSeats: 20, availableSeats: 30, congestionLevel: "ì¬ì ", congestionPercent: 40, lastUpdated: "2ë¶ ì " },
    ],
    totalSeats: 230, totalUsed: 142, totalAvailable: 88, distance: 35.0, distanceText: "ì ì²  55ë¶", travelMinutes: 55,
  },

  // ===== ë¶ì°ê´ì­ì =====
  {
    id: "lib-030", name: "ë¶ì°ìë¦½ìë¯¼ëìê´", address: "ë¶ì°ì ë¶ì°ì§êµ¬ ì¤ìëë¡ 678",
    lat: 35.1547, lng: 129.0603, phone: "051-810-8200",
    operatingHours: { weekday: "09:00~22:00", saturday: "09:00~18:00", holiday: "09:00~17:00" },
    nightOperation: true, accessible: true, reservable: true, wifi: true, parking: true,
    todayVisitors: 520, seatUsageRate: 82, congestionLevel: "í¼ì¡",
    rooms: [
      { name: "ì¢í©ì´ëì¤", totalSeats: 200, usedSeats: 170, availableSeats: 30, congestionLevel: "í¼ì¡", congestionPercent: 85, lastUpdated: "1ë¶ ì " },
      { name: "ëì§í¸ì´ëì¤", totalSeats: 80, usedSeats: 55, availableSeats: 25, congestionLevel: "ë³´íµ", congestionPercent: 69, lastUpdated: "2ë¶ ì " },
    ],
    totalSeats: 280, totalUsed: 225, totalAvailable: 55, distance: 325.0, distanceText: "KTX 2ìê° 30ë¶", travelMinutes: 150,
  },
  {
    id: "lib-031", name: "ë¶ì°ìë¦½í´ì´ëëìê´", address: "ë¶ì°ì í´ì´ëêµ¬ ìì´ë¡ 91",
    lat: 35.1631, lng: 129.1600, phone: "051-749-6581",
    operatingHours: { weekday: "09:00~21:00", saturday: "09:00~17:00", holiday: "í´ê´" },
    nightOperation: true, accessible: true, reservable: true, wifi: true, parking: true,
    todayVisitors: 298, seatUsageRate: 45, congestionLevel: "ì¬ì ",
    rooms: [
      { name: "ì¼ë°ì´ëì¤", totalSeats: 150, usedSeats: 68, availableSeats: 82, congestionLevel: "ì¬ì ", congestionPercent: 45, lastUpdated: "2ë¶ ì " },
    ],
    totalSeats: 150, totalUsed: 68, totalAvailable: 82, distance: 330.0, distanceText: "KTX 2ìê° 40ë¶", travelMinutes: 160,
  },

  // ===== ëêµ¬ê´ì­ì =====
  {
    id: "lib-040", name: "ëêµ¬ê´ì­ìë¦½ì¤ìëìê´", address: "ëêµ¬ì ì¤êµ¬ 2Â·28ë¡ 320",
    lat: 35.8714, lng: 128.6014, phone: "053-231-2100",
    operatingHours: { weekday: "09:00~22:00", saturday: "09:00~18:00", holiday: "09:00~17:00" },
    nightOperation: true, accessible: true, reservable: true, wifi: true, parking: true,
    todayVisitors: 445, seatUsageRate: 75, congestionLevel: "ë³´íµ",
    rooms: [
      { name: "ì¢í©ì´ëì¤", totalSeats: 180, usedSeats: 135, availableSeats: 45, congestionLevel: "ë³´íµ", congestionPercent: 75, lastUpdated: "1ë¶ ì " },
      { name: "ìíìì´ëì¤", totalSeats: 100, usedSeats: 88, availableSeats: 12, congestionLevel: "í¼ì¡", congestionPercent: 88, lastUpdated: "2ë¶ ì " },
    ],
    totalSeats: 280, totalUsed: 223, totalAvailable: 57, distance: 237.0, distanceText: "KTX 1ìê° 50ë¶", travelMinutes: 110,
  },

  // ===== ê´ì£¼ê´ì­ì =====
  {
    id: "lib-050", name: "ê´ì£¼ê´ì­ìë¦½ë¬´ë±ëìê´", address: "ê´ì£¼ì ëêµ¬ ëë¦½ë¡ 268",
    lat: 35.1459, lng: 126.9219, phone: "062-226-0100",
    operatingHours: { weekday: "09:00~22:00", saturday: "09:00~18:00", holiday: "09:00~17:00" },
    nightOperation: true, accessible: true, reservable: true, wifi: true, parking: true,
    todayVisitors: 367, seatUsageRate: 58, congestionLevel: "ë³´íµ",
    rooms: [
      { name: "ì¢í©ì´ëì¤", totalSeats: 160, usedSeats: 93, availableSeats: 67, congestionLevel: "ë³´íµ", congestionPercent: 58, lastUpdated: "2ë¶ ì " },
    ],
    totalSeats: 160, totalUsed: 93, totalAvailable: 67, distance: 268.0, distanceText: "KTX 1ìê° 30ë¶", travelMinutes: 90,
  },

  // ===== ëì ê´ì­ì =====
  {
    id: "lib-060", name: "ëì íë°­ëìê´", address: "ëì ì ìêµ¬ íë°­ëë¡ 700",
    lat: 36.3504, lng: 127.3845, phone: "042-520-2345",
    operatingHours: { weekday: "09:00~22:00", saturday: "09:00~18:00", holiday: "09:00~17:00" },
    nightOperation: true, accessible: true, reservable: true, wifi: true, parking: true,
    todayVisitors: 398, seatUsageRate: 62, congestionLevel: "ë³´íµ",
    rooms: [
      { name: "ì¢í©ì´ëì¤", totalSeats: 200, usedSeats: 124, availableSeats: 76, congestionLevel: "ë³´íµ", congestionPercent: 62, lastUpdated: "1ë¶ ì " },
      { name: "ë¸í¸ë¶ì´ëì¤", totalSeats: 60, usedSeats: 25, availableSeats: 35, congestionLevel: "ì¬ì ", congestionPercent: 42, lastUpdated: "3ë¶ ì " },
    ],
    totalSeats: 260, totalUsed: 149, totalAvailable: 111, distance: 140.0, distanceText: "KTX 50ë¶", travelMinutes: 50,
  },

  // ===== ì¸ì°ê´ì­ì =====
  {
    id: "lib-070", name: "ì¸ì°ê´ì­ìë¦½ì¤ìëìê´", address: "ì¸ì°ì ë¨êµ¬ ì¤ìë¡ 201",
    lat: 35.5384, lng: 129.3114, phone: "052-229-6100",
    operatingHours: { weekday: "09:00~22:00", saturday: "09:00~18:00", holiday: "í´ê´" },
    nightOperation: true, accessible: true, reservable: false, wifi: true, parking: true,
    todayVisitors: 287, seatUsageRate: 52, congestionLevel: "ë³´íµ",
    rooms: [
      { name: "ì¢í©ì´ëì¤", totalSeats: 140, usedSeats: 73, availableSeats: 67, congestionLevel: "ë³´íµ", congestionPercent: 52, lastUpdated: "2ë¶ ì " },
    ],
    totalSeats: 140, totalUsed: 73, totalAvailable: 67, distance: 307.0, distanceText: "KTX 2ìê° 10ë¶", travelMinutes: 130,
  },

  // ===== ì¸ì¢í¹ë³ìì¹ì =====
  {
    id: "lib-080", name: "ì¸ì¢ìë¦½ëìê´", address: "ì¸ì¢ì ì¡°ì¹ìì êµ°ì²­ë¡ 95",
    lat: 36.6040, lng: 127.0016, phone: "044-300-8800",
    operatingHours: { weekday: "09:00~22:00", saturday: "09:00~18:00", holiday: "09:00~17:00" },
    nightOperation: true, accessible: true, reservable: true, wifi: true, parking: true,
    todayVisitors: 215, seatUsageRate: 42, congestionLevel: "ì¬ì ",
    rooms: [
      { name: "ì¢í©ì´ëì¤", totalSeats: 120, usedSeats: 50, availableSeats: 70, congestionLevel: "ì¬ì ", congestionPercent: 42, lastUpdated: "1ë¶ ì " },
    ],
    totalSeats: 120, totalUsed: 50, totalAvailable: 70, distance: 120.0, distanceText: "ê³ ìë²ì¤ 1ìê° 30ë¶", travelMinutes: 90,
  },

  // ===== ê°ìí¹ë³ìì¹ë =====
  {
    id: "lib-090", name: "ì¶ì²ìë¦½ëìê´", address: "ê°ìë ì¶ì²ì ì¥ì²ë¡ 35",
    lat: 37.8813, lng: 127.7300, phone: "033-245-5500",
    operatingHours: { weekday: "09:00~21:00", saturday: "09:00~17:00", holiday: "í´ê´" },
    nightOperation: true, accessible: true, reservable: false, wifi: true, parking: true,
    todayVisitors: 178, seatUsageRate: 35, congestionLevel: "ì¬ì ",
    rooms: [
      { name: "ì¢í©ì´ëì¤", totalSeats: 100, usedSeats: 35, availableSeats: 65, congestionLevel: "ì¬ì ", congestionPercent: 35, lastUpdated: "3ë¶ ì " },
    ],
    totalSeats: 100, totalUsed: 35, totalAvailable: 65, distance: 75.0, distanceText: "ITX 1ìê° 10ë¶", travelMinutes: 70,
  },
  {
    id: "lib-091", name: "ê°ë¦ìë¦½ëìê´", address: "ê°ìë ê°ë¦ì ê²½ê°ë¡ 2046",
    lat: 37.7519, lng: 128.8761, phone: "033-640-5100",
    operatingHours: { weekday: "09:00~18:00", saturday: "09:00~17:00", holiday: "í´ê´" },
    nightOperation: false, accessible: true, reservable: false, wifi: true, parking: true,
    todayVisitors: 132, seatUsageRate: 28, congestionLevel: "ì¬ì ",
    rooms: [
      { name: "ì¢í©ì´ëì¤", totalSeats: 80, usedSeats: 22, availableSeats: 58, congestionLevel: "ì¬ì ", congestionPercent: 28, lastUpdated: "5ë¶ ì " },
    ],
    totalSeats: 80, totalUsed: 22, totalAvailable: 58, distance: 165.0, distanceText: "KTX 2ìê°", travelMinutes: 120,
  },

  // ===== ì¶©ì²­ë¶ë =====
  {
    id: "lib-100", name: "ì²­ì£¼ìë¦½ëìê´", address: "ì¶©ë¶ ì²­ì£¼ì ìë¹êµ¬ ìë¹ë¡ 86",
    lat: 36.6424, lng: 127.4890, phone: "043-201-4090",
    operatingHours: { weekday: "09:00~22:00", saturday: "09:00~18:00", holiday: "í´ê´" },
    nightOperation: true, accessible: true, reservable: true, wifi: true, parking: true,
    todayVisitors: 310, seatUsageRate: 58, congestionLevel: "ë³´íµ",
    rooms: [
      { name: "ì¢í©ì´ëì¤", totalSeats: 160, usedSeats: 93, availableSeats: 67, congestionLevel: "ë³´íµ", congestionPercent: 58, lastUpdated: "2ë¶ ì " },
    ],
    totalSeats: 160, totalUsed: 93, totalAvailable: 67, distance: 110.0, distanceText: "ê³ ìë²ì¤ 1ìê° 30ë¶", travelMinutes: 90,
  },

  // ===== ì¶©ì²­ë¨ë =====
  {
    id: "lib-110", name: "ì²ììë¦½ëìê´", address: "ì¶©ë¨ ì²ìì ìë¶êµ¬ ì¤ìë¡ 115",
    lat: 36.8151, lng: 127.1139, phone: "041-521-2200",
    operatingHours: { weekday: "09:00~22:00", saturday: "09:00~18:00", holiday: "í´ê´" },
    nightOperation: true, accessible: true, reservable: true, wifi: true, parking: true,
    todayVisitors: 345, seatUsageRate: 63, congestionLevel: "ë³´íµ",
    rooms: [
      { name: "ì¢í©ì´ëì¤", totalSeats: 140, usedSeats: 88, availableSeats: 52, congestionLevel: "ë³´íµ", congestionPercent: 63, lastUpdated: "1ë¶ ì " },
    ],
    totalSeats: 140, totalUsed: 88, totalAvailable: 52, distance: 85.0, distanceText: "KTX 30ë¶", travelMinutes: 30,
  },

  // ===== ì ë¼ë¶ë =====
  {
    id: "lib-120", name: "ì ì£¼ìë¦½ëìê´", address: "ì ë¶ ì ì£¼ì ìì°êµ¬ ì ì£¼ê°ì¬5ê¸¸ 16",
    lat: 35.8242, lng: 127.1480, phone: "063-281-1400",
    operatingHours: { weekday: "09:00~22:00", saturday: "09:00~18:00", holiday: "09:00~17:00" },
    nightOperation: true, accessible: true, reservable: true, wifi: true, parking: true,
    todayVisitors: 290, seatUsageRate: 48, congestionLevel: "ì¬ì ",
    rooms: [
      { name: "ì¢í©ì´ëì¤", totalSeats: 130, usedSeats: 62, availableSeats: 68, congestionLevel: "ì¬ì ", congestionPercent: 48, lastUpdated: "2ë¶ ì " },
    ],
    totalSeats: 130, totalUsed: 62, totalAvailable: 68, distance: 200.0, distanceText: "KTX 1ìê° 30ë¶", travelMinutes: 90,
  },

  // ===== ì ë¼ë¨ë =====
  {
    id: "lib-130", name: "ì¬ììë¦½ëì°ëìê´", address: "ì ë¨ ì¬ìì ëì°ì íì¬ë¦¬ê¸¸ 26",
    lat: 34.7376, lng: 127.7406, phone: "061-659-4272",
    operatingHours: { weekday: "09:00~18:00", saturday: "09:00~17:00", holiday: "í´ê´" },
    nightOperation: false, accessible: true, reservable: false, wifi: true, parking: true,
    todayVisitors: 156, seatUsageRate: 32, congestionLevel: "ì¬ì ",
    rooms: [
      { name: "ì¢í©ì´ëì¤", totalSeats: 80, usedSeats: 26, availableSeats: 54, congestionLevel: "ì¬ì ", congestionPercent: 32, lastUpdated: "5ë¶ ì " },
    ],
    totalSeats: 80, totalUsed: 26, totalAvailable: 54, distance: 350.0, distanceText: "KTX+ë²ì¤ 3ìê°", travelMinutes: 180,
  },
  {
    id: "lib-131", name: "ëª©í¬ìë¦½ëìê´", address: "ì ë¨ ëª©í¬ì ìì°ë¡ 155",
    lat: 34.8118, lng: 126.3922, phone: "061-270-8400",
    operatingHours: { weekday: "09:00~21:00", saturday: "09:00~17:00", holiday: "í´ê´" },
    nightOperation: true, accessible: true, reservable: true, wifi: true, parking: true,
    todayVisitors: 198, seatUsageRate: 40, congestionLevel: "ì¬ì ",
    rooms: [
      { name: "ì¢í©ì´ëì¤", totalSeats: 100, usedSeats: 40, availableSeats: 60, congestionLevel: "ì¬ì ", congestionPercent: 40, lastUpdated: "2ë¶ ì " },
    ],
    totalSeats: 100, totalUsed: 40, totalAvailable: 60, distance: 310.0, distanceText: "KTX 2ìê° 30ë¶", travelMinutes: 150,
  },

  // ===== ê²½ìë¶ë =====
  {
    id: "lib-140", name: "í¬í­ìë¦½ì¤ìëìê´", address: "ê²½ë¶ í¬í­ì ë¨êµ¬ ì¤ìë¡ 72",
    lat: 36.0190, lng: 129.3435, phone: "054-270-2700",
    operatingHours: { weekday: "09:00~22:00", saturday: "09:00~18:00", holiday: "í´ê´" },
    nightOperation: true, accessible: true, reservable: true, wifi: true, parking: true,
    todayVisitors: 265, seatUsageRate: 55, congestionLevel: "ë³´íµ",
    rooms: [
      { name: "ì¢í©ì´ëì¤", totalSeats: 120, usedSeats: 66, availableSeats: 54, congestionLevel: "ë³´íµ", congestionPercent: 55, lastUpdated: "2ë¶ ì " },
    ],
    totalSeats: 120, totalUsed: 66, totalAvailable: 54, distance: 270.0, distanceText: "KTX+ë²ì¤ 2ìê° 30ë¶", travelMinutes: 150,
  },

  // ===== ê²½ìë¨ë =====
  {
    id: "lib-150", name: "ì°½ììë¦½ë§ì°ëìê´", address: "ê²½ë¨ ì°½ìì ë§ì°í©í¬êµ¬ 3Â·15ëë¡ 229",
    lat: 35.1798, lng: 128.5728, phone: "055-225-4900",
    operatingHours: { weekday: "09:00~22:00", saturday: "09:00~18:00", holiday: "í´ê´" },
    nightOperation: true, accessible: true, reservable: true, wifi: true, parking: true,
    todayVisitors: 342, seatUsageRate: 68, congestionLevel: "ë³´íµ",
    rooms: [
      { name: "ì¢í©ì´ëì¤", totalSeats: 150, usedSeats: 102, availableSeats: 48, congestionLevel: "ë³´íµ", congestionPercent: 68, lastUpdated: "1ë¶ ì " },
    ],
    totalSeats: 150, totalUsed: 102, totalAvailable: 48, distance: 290.0, distanceText: "KTX 2ìê°", travelMinutes: 120,
  },

  // ===== ì ì£¼í¹ë³ìì¹ë =====
  {
    id: "lib-160", name: "ì ì£¼ìë¦½ëìê´", address: "ì ì£¼ì ì´ë¼2ë 1719-2",
    lat: 33.4996, lng: 126.5312, phone: "064-728-8600",
    operatingHours: { weekday: "09:00~21:00", saturday: "09:00~17:00", holiday: "í´ê´" },
    nightOperation: true, accessible: true, reservable: true, wifi: true, parking: true,
    todayVisitors: 210, seatUsageRate: 38, congestionLevel: "ì¬ì ",
    rooms: [
      { name: "ì¢í©ì´ëì¤", totalSeats: 110, usedSeats: 42, availableSeats: 68, congestionLevel: "ì¬ì ", congestionPercent: 38, lastUpdated: "3ë¶ ì " },
    ],
    totalSeats: 110, totalUsed: 42, totalAvailable: 68, distance: 450.0, distanceText: "ë¹íê¸° 1ìê°", travelMinutes: 60,
  },
  {
    id: "lib-161", name: "ìê·í¬ìë¦½ëìê´", address: "ì ì£¼ ìê·í¬ì ì¤ìë¡ 105",
    lat: 33.2541, lng: 126.5600, phone: "064-760-3072",
    operatingHours: { weekday: "09:00~18:00", saturday: "09:00~17:00", holiday: "í´ê´" },
    nightOperation: false, accessible: true, reservable: false, wifi: true, parking: true,
    todayVisitors: 145, seatUsageRate: 25, congestionLevel: "ì¬ì ",
    rooms: [
      { name: "ì¢í©ì´ëì¤", totalSeats: 80, usedSeats: 20, availableSeats: 60, congestionLevel: "ì¬ì ", congestionPercent: 25, lastUpdated: "5ë¶ ì " },
    ],
    totalSeats: 80, totalUsed: 20, totalAvailable: 60, distance: 460.0, distanceText: "ë¹íê¸°+ë²ì¤ 1ìê° 30ë¶", travelMinutes: 90,
  },
];

// ========================
// AI ìì¸¡ ëª©ì ë°ì´í°
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
  { day: "ì", hours: [5,10,25,50,70,85,65,45,35,42,60,78,88,80,55,30,10] },
  { day: "í", hours: [5,12,30,55,72,80,60,42,38,45,62,75,85,78,52,28,8] },
  { day: "ì", hours: [8,15,32,58,75,82,58,40,35,48,65,80,90,82,58,32,12] },
  { day: "ëª©", hours: [6,10,28,52,68,78,55,38,32,40,58,72,82,75,50,25,8] },
  { day: "ê¸", hours: [5,8,22,45,62,72,50,35,30,38,55,68,78,70,45,22,5] },
  { day: "í ", hours: [3,5,10,20,35,50,60,65,70,68,62,55,48,40,30,18,5] },
  { day: "ì¼", hours: [2,3,8,15,25,35,42,48,52,50,45,40,35,28,20,12,3] },
];

// ========================
// êµíµ ëª©ì ë°ì´í°
// ========================
export const mockBikeStations: BikeStation[] = [
  { id: "bike-001", name: "ì¸ì¢ëë¡ì¬ê±°ë¦¬ ëì¬ì", lat: 37.564, lng: 126.976, availableBikes: 5, totalDocks: 15, distance: 0.05 },
  { id: "bike-002", name: "ìì²­ì­ 2ë²ì¶êµ¬ ëì¬ì", lat: 37.565, lng: 126.977, availableBikes: 8, totalDocks: 20, distance: 0.12 },
];

export const mockBuses: BusInfo[] = [
  { routeNumber: "302", arrivalMinutes: 3, stopName: "ì¸ì¢ëë¡ì¬ê±°ë¦¬", stopDistance: 0.2 },
  { routeNumber: "501", arrivalMinutes: 8, stopName: "ì¸ì¢ëë¡ì¬ê±°ë¦¬", stopDistance: 0.2 },
  { routeNumber: "707", arrivalMinutes: 15, stopName: "ìì¸ì­", stopDistance: 0.5 },
];

export const mockAccessibleTransport: AccessibleTransport = {
  centerName: "ì¤êµ¬ êµíµì½ìì´ëì§ìì¼í°",
  availableVehicles: 2,
  totalVehicles: 8,
  estimatedWait: 15,
};

// ========================
// ëìë³´ë ëª©ì ë°ì´í°
// ========================
export const mockDashboardKPI: DashboardKPI = {
  totalLibraries: 3247,
  currentUsers: 45832,
  averageUsageRate: 67.3,
  totalAvailableSeats: 52168,
  totalSeats: 158000,
};

export const mockRegionUsage: RegionUsage[] = [
  { region: "ìì¸", usageRate: 78 },
  { region: "ê²½ê¸°", usageRate: 72 },
  { region: "ë¶ì°", usageRate: 68 },
  { region: "ëêµ¬", usageRate: 65 },
  { region: "ì¸ì²", usageRate: 63 },
  { region: "ê´ì£¼", usageRate: 60 },
  { region: "ëì ", usageRate: 58 },
  { region: "ì¸ì°", usageRate: 55 },
  { region: "ì¸ì¢", usageRate: 52 },
  { region: "ê²½ë¨", usageRate: 50 },
  { region: "ì¶©ë¨", usageRate: 48 },
  { region: "ì ë¨", usageRate: 45 },
  { region: "ê²½ë¶", usageRate: 43 },
  { region: "ì¶©ë¶", usageRate: 42 },
  { region: "ì ë¶", usageRate: 40 },
  { region: "ê°ì", usageRate: 38 },
  { region: "ì ì£¼", usageRate: 35 },
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
// ì»¤ë®¤ëí° ëª©ì ë°ì´í°
// ========================
export const mockReviews: Review[] = [
  {
    id: "r1", userId: "u1", userName: "ê¹*ì",
    libraryId: "lib-001", libraryName: "ìì¸ì¤ìëìê´", roomName: "ì¼ë°ì´ëì¤",
    mood: "ð¤« ì¡°ì©í´ì",
    content: "3ì¸µ ì´ëì¤ ì§ê¸ ì¡°ì©íê³  ìë¦¬ë ëëí´ì. ì½ì¼í¸ ìë¦¬ë ê±°ì ì°¼ì§ë§ ì¼ë° ìë¦¬ë ì¬ì  ììµëë¤ ð",
    helpful: 23, comments: 3, createdAt: "15ë¶ ì ",
  },
  {
    id: "r2", userId: "u2", userName: "ì´*ì°",
    libraryId: "lib-003", libraryName: "ë§í¬ì¤ìëìê´", roomName: "ì¢í©ì´ëì¤",
    mood: "ðª ì§ì¤ ì ë¼ì",
    content: "ì¤ë ì¬ê¸° ë¶ìê¸° ìµê³ ìëë¤. ì¬ëë ì ê³  ìì´ì»¨ë ì ì í´ì. ì¤ë ìììê¸° ì¢ìì.",
    helpful: 15, comments: 1, createdAt: "32ë¶ ì ",
  },
  {
    id: "r3", userId: "u3", userName: "ë°*í¸",
    libraryId: "lib-002", libraryName: "ê°ë¨êµ¬ë¦½ëìê´",
    mood: "ð° ë³µì¡í´ì",
    content: "2ì¸µ ì´ëì¤ ê±°ì ë§ìì´ìì. ìë¦¬ ì¡ì¼ë ¤ë©´ ì¼ì° ì¤ìì¼ í©ëë¤. 1ì¸µì ê·¸ëë§ ê´ì°®ìì.",
    helpful: 31, comments: 5, createdAt: "1ìê° ì ",
  },
  {
    id: "r4", userId: "u4", userName: "ìµ*ì§",
    libraryId: "lib-030", libraryName: "ë¶ì°ìë¦½ìë¯¼ëìê´", roomName: "ëì§í¸ì´ëì¤",
    mood: "ð ì¢ìì",
    content: "ëì§í¸ì´ëì¤ ë¦¬ëª¨ë¸ë§íê³  ëì ì ë§ ì¢ìì¡ì´ì! ëª¨ëí°ë í¬ê³  ììë í¸í´ì.",
    helpful: 42, comments: 7, createdAt: "2ìê° ì ",
  },
  {
    id: "r5", userId: "u5", userName: "ì *í",
    libraryId: "lib-060", libraryName: "ëì íë°­ëìê´", roomName: "ë¸í¸ë¶ì¡´",
    mood: "ð ì¢ìì",
    content: "ë¸í¸ë¶ì¡´ ìë¦¬ ëëíê³  ì½ì¼í¸ ì¶©ë¶í©ëë¤. ìì´íì´ë ë¹¨ë¼ì. ë¨ ì»¤í¼ ë°ì ìëüì.",
    helpful: 18, comments: 2, createdAt: "3ìê° ì ",
  },
];

export const mockStudyGroups: StudyGroup[] = [
  {
    id: "sg1", title: "ê³µë¬´ì ìí ì¤í°ë",
    libraryName: "ìì¸ì¤ìëìê´", location: "3ì¸µ ì´ëì¤",
    currentMembers: 4, maxMembers: 6,
    schedule: "ë§¤ì£¼ ìÂ·ìÂ·ê¸", time: "09:00~13:00",
    description: "íì ë², íë² ê°ì´ ê³µë¶íì¤ ë¶ ëª¨ì§í©ëë¤. ìë¡ ì§ë¬¸íê³  ëª¨ìê³ ì¬ í¨ê» íì´ì!",
    tags: ["ê³µë¬´ì", "íì ë²", "íë²"],
  },
  {
    id: "sg2", title: "ìë¥ ìí ì¤í°ë",
    libraryName: "ë§í¬ì¤ìëìê´", location: "ì¢í©ì´ëì¤",
    currentMembers: 3, maxMembers: 5,
    schedule: "ë§¤ì¼", time: "14:00~18:00",
    description: "ìë¥ ìí ê¸°ì¶ íì´ ì¤í°ëìëë¤. í¬ë¬ë¬¸í­ í¨ê» ëì í´ì.",
    tags: ["ìë¥", "ìí", "ê¸°ì¶"],
  },
  {
    id: "sg3", title: "í ìµ 900+ ëª©íë°",
    libraryName: "ê°ë¨êµ¬ë¦½ëìê´", location: "ì 1ì´ëì¤",
    currentMembers: 5, maxMembers: 8,
    schedule: "ë§¤ì£¼ íÂ·ëª©Â·í ", time: "10:00~12:00",
    description: "í ìµ 900ì  ì´ì ëª©í! LC/RC íí¸ë³ë¡ ë²ê°ì ì¤í°ëí©ëë¤.",
    tags: ["í ìµ", "ìì´", "TOEIC"],
  },
  {
    id: "sg4", title: "ð ì¸ë¬¸í ëì ëª¨ì",
    libraryName: "ì¡íêµ¬ë¦½ëìê´", location: "ìì ì´ëì¤",
    currentMembers: 6, maxMembers: 10,
    schedule: "ê²©ì£¼ ì¼ìì¼", time: "14:00~16:00",
    description: "í ë¬ì 2ê¶ ì¸ë¬¸í ì±ì ì½ê³  í ë¡ í©ëë¤. í¸íê² ì¤ì¸ì!",
    tags: ["ëì", "ì¸ë¬¸í", "í ë¡ "],
  },
];
