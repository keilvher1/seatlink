"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { getCongestionColor, cn } from "@/lib/utils";
import { LibraryWithDistance } from "@/lib/types";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text";
import { Particles } from "@/components/magicui/particles";
import { Ripple } from "@/components/magicui/ripple";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";

export default function HomePage() {
  const [radius, setRadius] = useState(30);
  const [sortBy, setSortBy] = useState<"distance" | "seats">("distance");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [libraries, setLibraries] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [bikes, setBikes] = useState<any[]>([]);
  const [showBuses, setShowBuses] = useState(true);
  const [showBikes, setShowBikes] = useState(true);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapObjRef = useRef<any>(null);
  const markerLayerRef = useRef<any>(null);
  const busLayerRef = useRef<any>(null);
  const bikeLayerRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);

  useEffect(() => {
    const fetchLibraries = async () => {
      try {
        const res = await fetch("/api/libraries");
        const data = await res.json();
        setLibraries(data.libraries || []);
      } catch (err) {
        console.error("Failed to fetch libraries:", err);
      }
    };
    fetchLibraries();
  }, []);

  // 버스 실시간 위치 가져오기 (30초 간격 자동 새로고침)
  useEffect(() => {
    if (!userPos) return;
    const fetchBuses = async () => {
      try {
        const res = await fetch(`/api/bus-realtime?lat=${userPos[0]}&lng=${userPos[1]}&radius=${radius}`);
        const data = await res.json();
        setBuses(data.buses || []);
      } catch (err) {
        console.error("Failed to fetch buses:", err);
      }
    };
    fetchBuses();
    const interval = setInterval(fetchBuses, 30000);
    return () => clearInterval(interval);
  }, [userPos, radius]);

  // 공영자전거 대여소 가져오기 (60초 간격 새로고침)
  useEffect(() => {
    if (!userPos) return;
    const fetchBikes = async () => {
      try {
        const res = await fetch(`/api/bike-realtime?lat=${userPos[0]}&lng=${userPos[1]}&radius=${radius}`);
        const data = await res.json();
        setBikes(data.bikes || []);
      } catch (err) {
        console.error("Failed to fetch bikes:", err);
      }
    };
    fetchBikes();
    const interval = setInterval(fetchBikes, 60000);
    return () => clearInterval(interval);
  }, [userPos, radius]);

  // Haversine formula to calculate distance between two coordinates
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getDistanceText = (distance: number): string => {
    if (distance < 1) return `도보 ${Math.round(distance * 15)}분`;
    if (distance < 5) return `도보 ${Math.round(distance * 15)}분`;
    if (distance < 20) return `버스 ${Math.round(distance * 3)}분`;
    if (distance < 100) return `전철 ${Math.round(distance * 1.5)}분`;
    if (distance < 300) return `KTX ${Math.round(distance / 2.5)}분`;
    return `${Math.round(distance)}km`;
  };

  const { sorted, isFallback } = useMemo(() => {
    if (!userPos) return { sorted: [], isFallback: false };

    const allWithDist = libraries
      .filter((lib) => lib.lat && lib.lng && lib.lat !== 0 && lib.lng !== 0)
      .map((lib) => {
        const distance = calculateDistance(userPos[0], userPos[1], lib.lat, lib.lng);
        return {
          ...lib,
          distance,
          distanceText: getDistanceText(distance),
        };
      })
      .filter((l) => isFinite(l.distance))
      .sort((a, b) => a.distance - b.distance);

    let list = allWithDist.filter((l) => l.distance <= radius);
    let fallback = false;

    // 반경 내 도서관이 없으면 가장 가까운 5개를 보여줌
    if (list.length === 0 && allWithDist.length > 0) {
      list = allWithDist.slice(0, 5);
      fallback = true;
    }

    if (sortBy === "seats") list.sort((a, b) => b.totalAvailable - a.totalAvailable);
    else if (!fallback) list.sort((a, b) => a.distance - b.distance);
    return { sorted: list, isFallback: fallback };
  }, [radius, sortBy, userPos, libraries]);

  const requestGeolocation = () => {
    if ("geolocation" in navigator) {
      setLocationLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserPos([latitude, longitude]);
          setLocationLoading(false);
          if (mapObjRef.current) {
            // 줌 레벨은 useEffect에서 반경에 맞게 조정하므로 여기서는 위치만 업데이트
            updateUserMarker([latitude, longitude]);
          }
        },
        (error) => {
          console.log("Geolocation denied or unavailable:", error);
          // Fallback to default location (Seoul) if geolocation fails
          setUserPos([37.5665, 126.9780]);
          setLocationLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    } else {
      // Fallback if geolocation not available
      setUserPos([37.5665, 126.9780]);
      setLocationLoading(false);
    }
  };

  const updateUserMarker = (pos: [number, number]) => {
    if (!mapObjRef.current || !userMarkerRef.current) return;
    userMarkerRef.current.setLatLng(pos);
  };

  // Request geolocation on mount
  useEffect(() => {
    requestGeolocation();
  }, []);

  // Initialize map after we have user position
  useEffect(() => {
    if (!mapRef.current || mapObjRef.current || !userPos) return;

    const initLeaflet = async () => {
      const L = (await import("leaflet")).default;
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, { center: userPos, zoom: 12, zoomControl: false });
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", { attribution: "", maxZoom: 19 }).addTo(map);
      L.control.zoom({ position: "topright" }).addTo(map);

      const userIcon = L.divIcon({
        html: '<div style="width:16px;height:16px;background:#3b82f6;border-radius:50%;border:3px solid white;box-shadow:0 0 0 6px rgba(59,130,246,0.2),0 0 12px rgba(59,130,246,0.4);"></div>',
        className: "", iconSize: [16, 16], iconAnchor: [8, 8],
      });
      const userMarker = L.marker(userPos, { icon: userIcon }).addTo(map);
      userMarkerRef.current = userMarker;
      markerLayerRef.current = L.layerGroup().addTo(map);
      busLayerRef.current = L.layerGroup().addTo(map);
      bikeLayerRef.current = L.layerGroup().addTo(map);
      mapObjRef.current = map;
      updateMarkers(L);
      setTimeout(() => {
        map.invalidateSize();
        // 초기화 완료 후 반경에 맞게 줌 조정
        const radiusToZoom: Record<number, number> = { 5: 13, 10: 12, 30: 10, 100: 8 };
        const zoom = radiusToZoom[radius] || 10;
        map.setView(userPos, zoom, { animate: false });
      }, 150);
    };

    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    initLeaflet();
  }, [userPos]);

  const updateMarkers = async (LParam?: any) => {
    const L = LParam || (await import("leaflet")).default;
    if (!markerLayerRef.current) return;
    markerLayerRef.current.clearLayers();

    const colorMap: Record<string, string> = {
      "\uC5EC\uC720": "#22c55e",
      "\uBCF4\uD1B5": "#f59e0b",
      "\uD63C\uC7A1": "#ef4444",
    };

    sorted.forEach((lib) => {
      const c = colorMap[lib.congestionLevel] || "#3b82f6";
      const icon = L.divIcon({
        html: '<a href="/library/' + lib.id + '" style="text-decoration:none;display:flex;flex-direction:column;align-items:center;">' +
          '<div style="width:44px;height:44px;background:' + c + ';border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:12px;border:3px solid white;box-shadow:0 3px 10px ' + c + '88;">' + lib.totalAvailable + '</div>' +
          '<div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:7px solid white;margin-top:-2px;"></div>' +
          '<div style="background:white;padding:1px 6px;border-radius:6px;margin-top:1px;box-shadow:0 1px 4px rgba(0,0,0,0.1);"><span style="font-size:10px;font-weight:600;color:#334155;">' + lib.name + '</span></div>' +
          '</a>',
        className: "", iconSize: [80, 70], iconAnchor: [40, 55],
      });
      L.marker([lib.lat, lib.lng], { icon }).addTo(markerLayerRef.current);
    });
  };

  // 버스 마커 업데이트
  const updateBusMarkers = async (LParam?: any) => {
    const L = LParam || (await import("leaflet")).default;
    if (!busLayerRef.current) return;
    busLayerRef.current.clearLayers();

    if (!showBuses) return;

    buses.forEach((bus: any) => {
      const speedColor = bus.speed > 0 ? "#10b981" : "#6b7280";
      const rotateStyle = `transform:rotate(${bus.direction || 0}deg)`;
      const icon = L.divIcon({
        html: `<div style="display:flex;flex-direction:column;align-items:center;">
          <div style="width:32px;height:32px;background:${speedColor};border-radius:8px;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 2px 8px ${speedColor}88;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white" style="${rotateStyle}"><path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/></svg>
          </div>
          <div style="background:white;padding:0px 4px;border-radius:4px;margin-top:2px;box-shadow:0 1px 3px rgba(0,0,0,0.15);">
            <span style="font-size:9px;font-weight:700;color:#334155;">${bus.rteNo || bus.vhclNo}</span>
            ${bus.speed > 0 ? `<span style="font-size:8px;color:${speedColor};margin-left:2px;">${bus.speed}km/h</span>` : ''}
          </div>
        </div>`,
        className: "", iconSize: [60, 50], iconAnchor: [30, 35],
      });
      const marker = L.marker([bus.lat, bus.lng], { icon }).addTo(busLayerRef.current);
      marker.bindPopup(`
        <div style="font-size:13px;min-width:150px;">
          <b style="font-size:15px;">🚌 ${bus.rteNo || '노선 정보 없음'}</b><br/>
          <span style="color:#666;">${bus.rteType || ''}</span><br/>
          ${bus.stpnt && bus.edpnt ? `<span style="font-size:11px;">📍 ${bus.stpnt} → ${bus.edpnt}</span><br/>` : ''}
          <span>🏎 속도: ${bus.speed}km/h</span><br/>
          <span>📏 거리: ${bus.distance}km</span><br/>
          ${bus.region ? `<span>📌 ${bus.region}</span>` : ''}
        </div>
      `);
    });
  };

  // 버스 마커 업데이트 effect
  useEffect(() => {
    if (!mapObjRef.current) return;
    updateBusMarkers();
  }, [buses, showBuses]);

  // 자전거 마커 업데이트
  const updateBikeMarkers = async (LParam?: any) => {
    const L = LParam || (await import("leaflet")).default;
    if (!bikeLayerRef.current) return;
    bikeLayerRef.current.clearLayers();

    if (!showBikes) return;

    bikes.forEach((bike: any) => {
      const bikeColor = bike.availableBikes > 5 ? "#22c55e" : bike.availableBikes > 0 ? "#f59e0b" : "#ef4444";
      const icon = L.divIcon({
        html: `<div style="display:flex;flex-direction:column;align-items:center;">
          <div style="width:30px;height:30px;background:${bikeColor};border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 2px 6px ${bikeColor}88;">
            <span style="font-size:13px;">🚲</span>
          </div>
          <div style="background:white;padding:0px 4px;border-radius:4px;margin-top:1px;box-shadow:0 1px 3px rgba(0,0,0,0.15);">
            <span style="font-size:9px;font-weight:700;color:${bikeColor};">${bike.availableBikes}대</span>
          </div>
        </div>`,
        className: "", iconSize: [50, 45], iconAnchor: [25, 30],
      });
      const marker = L.marker([bike.lat, bike.lng], { icon }).addTo(bikeLayerRef.current);
      marker.bindPopup(`
        <div style="font-size:13px;min-width:160px;">
          <b style="font-size:14px;">🚲 ${bike.name}</b><br/>
          <span style="color:#22c55e;font-weight:bold;">대여 가능: ${bike.availableBikes}대</span><br/>
          ${bike.address ? `<span style="font-size:11px;color:#666;">📍 ${bike.address}</span><br/>` : ''}
          <span style="font-size:11px;">📏 ${bike.distance}km</span>
          ${bike.feeType ? ` · <span style="font-size:11px;">${bike.feeType}</span>` : ''}
          ${bike.region ? `<br/><span style="font-size:11px;">📌 ${bike.region}</span>` : ''}
        </div>
      `);
    });
  };

  // 자전거 마커 업데이트 effect
  useEffect(() => {
    if (!mapObjRef.current) return;
    updateBikeMarkers();
  }, [bikes, showBikes]);

  // 반경·도서관목록·위치 변경 시 마커 업데이트 + 지도 줌 조정
  useEffect(() => {
    if (!mapObjRef.current || !userPos) return;

    // 마커 업데이트
    updateMarkers();

    // 반경에 맞는 줌 레벨
    const radiusToZoom: Record<number, number> = { 5: 13, 10: 12, 30: 10, 100: 8 };
    const zoom = radiusToZoom[radius] || 10;

    const map = mapObjRef.current;
    if (sorted.length > 0 && !isFallback) {
      // 반경 내 도서관이 있으면 마커 + 유저 위치가 모두 보이도록 fitBounds
      const points: [number, number][] = [[userPos[0], userPos[1]], ...sorted.map((l: any) => [l.lat, l.lng] as [number, number])];
      map.fitBounds(points, { padding: [50, 50], maxZoom: zoom });
    } else {
      // fallback 모드: 유저 위치 중심으로 반경에 맞는 줌 적용
      // Leaflet은 같은 좌표+줌으로 setView 시 무시하므로 미세 오프셋 추가
      const offset = (Math.random() - 0.5) * 0.0001;
      map.setView([userPos[0] + offset, userPos[1] + offset], zoom, { animate: false });
    }
  }, [radius, sorted, userPos, isFallback]);

  return (
    <div className="relative h-[calc(100vh-56px)] overflow-hidden">
      {/* Loading overlay */}
      {locationLoading && (
        <div className="absolute inset-0 z-[2000] bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col items-center justify-center overflow-hidden">
          <Ripple mainCircleSize={200} mainCircleOpacity={0.15} numCircles={5} />
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 mb-6 animate-pulse">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">
              <AnimatedGradientText>{"좌석이음"}</AnimatedGradientText>
            </h2>
            <p className="text-slate-600 font-medium mb-1">{"현재 위치를 확인하고 있습니다..."}</p>
            <p className="text-slate-400 text-sm">{"위치 권한을 허용해주세요"}</p>
          </div>
        </div>
      )}
      
      {/* Map */}
      <div className="absolute inset-0">
        <div ref={mapRef} id="map-container" className="w-full h-full z-0" />

        {/* Radius filter - Magic UI style */}
        <div className="absolute top-4 left-4 flex gap-2 z-[1000] animate-fade-in">
          {[5, 10, 30, 100].map((r, idx) => (
            <button
              key={r}
              onClick={() => {
                setRadius(r);
                // 직접 줌 변경 (useEffect가 즉시 반영 안 될 수 있으므로)
                if (mapObjRef.current && userPos) {
                  const radiusToZoom: Record<number, number> = { 5: 13, 10: 12, 30: 10, 100: 8 };
                  const zoom = radiusToZoom[r] || 10;
                  const offset = (Math.random() - 0.5) * 0.0001;
                  mapObjRef.current.setView([userPos[0] + offset, userPos[1] + offset], zoom, { animate: false });
                }
              }}
              className={cn(
                "px-4 py-2 text-sm font-semibold rounded-full backdrop-blur-md transition-all duration-300 transform",
                radius === r
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/40 scale-105 animate-glow-ring"
                  : "bg-white/80 backdrop-blur-md text-slate-700 hover:shadow-lg hover:scale-105 shadow-md"
              )}
              style={{ transitionDelay: `${idx * 50}ms` }}
            >
              {r}km
            </button>
          ))}
        </div>

        {/* Transport toggle buttons */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
          <button
            className={cn(
              "px-3 py-2 rounded-full backdrop-blur-md flex items-center gap-1.5 text-sm font-semibold transition-all duration-300 shadow-md",
              showBuses
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/30"
                : "bg-white/80 text-slate-500 hover:shadow-lg"
            )}
            onClick={() => setShowBuses(!showBuses)}
          >
            <span>{"🚌"}</span>
            <span>{showBuses ? "버스" : "버스"}</span>
            {showBuses && buses.length > 0 && (
              <span className="px-1.5 py-0.5 bg-white/30 rounded-full text-xs">{buses.length}</span>
            )}
          </button>
          <button
            className={cn(
              "px-3 py-2 rounded-full backdrop-blur-md flex items-center gap-1.5 text-sm font-semibold transition-all duration-300 shadow-md",
              showBikes
                ? "bg-gradient-to-r from-orange-400 to-amber-500 text-white shadow-orange-400/30"
                : "bg-white/80 text-slate-500 hover:shadow-lg"
            )}
            onClick={() => setShowBikes(!showBikes)}
          >
            <span>{"🚲"}</span>
            <span>{showBikes ? "자전거" : "자전거"}</span>
            {showBikes && bikes.length > 0 && (
              <span className="px-1.5 py-0.5 bg-white/30 rounded-full text-xs">{bikes.length}</span>
            )}
          </button>
        </div>

        {/* My location button */}
        <button
          className="absolute bottom-28 right-4 w-12 h-12 bg-white/90 backdrop-blur-md rounded-full shadow-lg shadow-blue-500/20 flex items-center justify-center z-[1000] hover:bg-white transition-all transform hover:scale-110 hover:shadow-blue-500/40"
          onClick={requestGeolocation}
        >
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06z" />
          </svg>
        </button>
      </div>

      {/* Bottom Sheet */}
      <div
        className={cn(
          "bottom-sheet transition-transform duration-500 ease-out",
          sheetOpen ? "translate-y-0" : "translate-y-[calc(100%-80px)]"
        )}
        style={{ height: "70vh" }}
      >
        <div
          className="cursor-grab active:cursor-grabbing pt-3 pb-2 hover:bg-slate-50/50 transition rounded-t-3xl"
          onClick={() => setSheetOpen(!sheetOpen)}
        >
          <div className="bottom-sheet-handle" />
          {!sheetOpen && (
            <div className="px-6 mt-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AnimatedShinyText className="text-base font-bold text-slate-800" shimmerWidth={80}>
                  {"\uD83D\uDCCD"} {"\uB0B4 \uC8FC\uBCC0 \uB3C4\uC11C\uAD00"}
                </AnimatedShinyText>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full animate-scale-in">{sorted.length}{"\uAC1D"}</span>
              </div>
              <span className="text-xs text-slate-400">{"\u2191"} {"\uC704\uB85C \uBC00\uC5B4 \uC5F4\uAE30"}</span>
            </div>
          )}
        </div>

        {sheetOpen && (
          <div className="px-6 pb-4 flex items-center justify-between border-b border-slate-200/50 animate-fade-in">
            <div className="flex items-center gap-3">
              <AnimatedShinyText className="text-xl font-bold gradient-text" shimmerWidth={120}>
                {"\uD83D\uDCCD"} {"\uB0B4 \uC8FC\uBCC0 \uB3C4\uC11C\uAD00"}
              </AnimatedShinyText>
              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">{sorted.length}{"\uAC1D"}</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "distance" | "seats")}
              className="text-sm font-medium text-slate-700 bg-white/80 backdrop-blur-md rounded-lg px-3 py-1.5 border border-slate-200 focus:ring-2 focus:ring-blue-500"
            >
              <option value="distance">{"\uAC70\uB9AC\uC21C"}</option>
              <option value="seats">{"\uC794\uC5EC\uC88C\uC11D\uC21C"}</option>
            </select>
          </div>
        )}

        <div className={cn("overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin", sheetOpen ? "h-[calc(70vh-120px)]" : "h-0 overflow-hidden")}>
          {sorted.map((lib, idx) => (
            <div key={lib.id} style={{ animationDelay: `${idx * 50}ms` }} className="animate-slide-up">
              <LibraryCard library={lib} />
            </div>
          ))}

          {isFallback && (
            <div className="text-center py-3 px-4 mb-2 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-sm font-medium text-amber-700">
                {"반경 "}{radius}{"km 내 도서관이 없어 가장 가까운 도서관을 보여드립니다"}
              </p>
            </div>
          )}

          {sorted.length === 0 && !isFallback && (
            <div className="text-center py-12 text-slate-400 relative">
              <Particles className="absolute inset-0" quantity={20} color="#94a3b8" size={0.8} />
              <p className="text-5xl mb-3 animate-float">{"🔍"}</p>
              <p className="font-bold text-slate-600">{"도서관 정보를 불러오는 중입니다..."}</p>
              <p className="text-sm mt-2 text-slate-500">{"잠시만 기다려주세요"}</p>
            </div>
          )}

          <ShimmerButton
            className="w-full py-4 text-lg rounded-2xl"
            shimmerColor="rgba(255,255,255,0.3)"
            background="linear-gradient(110deg, #2563eb, #4f46e5, #2563eb)"
          >
            <a href="/recommend" className="flex items-center justify-center gap-2 text-white">
              {"\uD83E\uDD16"} {"AI \uCD5C\uC801 \uB3C4\uC11C\uAD00 \uCD94\uCC9C\uBC1B\uAE30"}
            </a>
          </ShimmerButton>
        </div>
      </div>
    </div>
  );
}

function LibraryCard({ library }: { library: LibraryWithDistance }) {
  const color = getCongestionColor(library.congestionLevel);

  return (
    <a
      href={`/library/${library.id}`}
      className="block glass rounded-2xl hover:shadow-xl hover:scale-[1.02] transition-all duration-300 p-4 group relative overflow-hidden"
    >
      {/* Subtle gradient hover effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
      <div className="flex gap-3 relative z-10">
        <div className={cn("w-2 rounded-full shrink-0 shadow-md", color.bg)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-[15px] text-slate-900 group-hover:text-blue-700 transition-colors">{library.name}</h3>
              <p className="text-xs text-slate-500 mt-1 truncate">{library.address}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-bold gradient-text">{library.distanceText}</p>
              <span className={cn("inline-block px-2.5 py-1 text-xs font-bold rounded-full mt-1 shadow-sm", color.light, color.text)}>
                {library.congestionLevel}
              </span>
            </div>
          </div>
          <div className="mt-3 space-y-2">
            {(library.rooms || []).map((room) => {
              const rc = getCongestionColor(room.congestionLevel);
              return (
                <div key={room.name} className="flex items-center gap-2 text-xs">
                  <span className="text-slate-600 font-medium w-20 truncate">{room.name}</span>
                  <div className="flex-1 h-2.5 bg-slate-200/60 rounded-full overflow-hidden shadow-inner">
                    <div className={cn("h-full rounded-full transition-all duration-500 shadow-sm", rc.bg)} style={{ width: `${room.congestionPercent}%` }} />
                  </div>
                  <span className={cn("font-bold w-16 text-right", rc.text)}>{room.availableSeats}/{room.totalSeats}</span>
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {library.nightOperation && <Tag>{"\uD83C\uDF19 \uC57C\uAC04"}</Tag>}
            {library.accessible && <Tag>{"\u267F \uC811\uADFC"}</Tag>}
            {library.reservable && <Tag>{"\uD83D\uDCDD \uC608\uC57D"}</Tag>}
            {library.wifi && <Tag>{"\uD83D\uDCF6 \uC640\uC774\uD30C\uC774"}</Tag>}
          </div>
        </div>
        <svg className="w-5 h-5 text-slate-300 shrink-0 mt-1 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </a>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="px-2.5 py-0.5 bg-slate-200/60 text-slate-700 text-[10px] font-bold rounded-full hover:bg-blue-100 hover:text-blue-700 transition-colors">{children}</span>;
}
