"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface LibrarySummary {
  id: string;
  name: string;
  address: string;
  congestionLevel?: string;
}

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LibrarySummary[]>([]);
  const [open, setOpen] = useState(false);
  const [libs, setLibs] = useState<LibrarySummary[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // 컴포넌트 마운트 시 전체 도서관 목록 로드
  useEffect(() => {
    fetch("/api/libraries")
      .then((r) => r.json())
      .then((data) => {
        const list = (data.libraries || []).map((l: any) => ({
          id: l.id,
          name: l.name,
          address: l.address,
          congestionLevel: l.congestionLevel,
        }));
        setLibs(list);
      })
      .catch(() => {});
  }, []);

  // 바깥 클릭 시 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // 검색 필터
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const q = query.trim().toLowerCase();
    const matched = libs
      .filter((l) => l.name.toLowerCase().includes(q) || l.address.toLowerCase().includes(q))
      .slice(0, 8);
    setResults(matched);
  }, [query, libs]);

  const handleSelect = (lib: LibrarySummary) => {
    setQuery("");
    setOpen(false);
    router.push(`/library/${lib.id}`);
  };

  const levelColor = (level?: string) => {
    switch (level) {
      case "여유": return "bg-green-100 text-green-700";
      case "보통": return "bg-amber-100 text-amber-700";
      case "혼잡": return "bg-red-100 text-red-700";
      default: return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <div ref={ref} className="flex-1 max-w-md hidden md:block relative">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => query.trim() && setOpen(true)}
          placeholder="도서관 이름 또는 지역을 검색하세요"
          className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100/50 rounded-full border-0 focus:ring-2 focus:ring-blue-500 focus:bg-white transition backdrop-blur-sm"
        />
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-[9999] max-h-80 overflow-y-auto">
          {results.map((lib) => (
            <button
              key={lib.id}
              onClick={() => handleSelect(lib)}
              className="w-full text-left px-4 py-3 hover:bg-blue-50 transition flex items-center justify-between border-b border-slate-100 last:border-0"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm text-slate-900 truncate">{lib.name}</p>
                <p className="text-xs text-slate-500 truncate">{lib.address}</p>
              </div>
              {lib.congestionLevel && (
                <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full shrink-0 ${levelColor(lib.congestionLevel)}`}>
                  {lib.congestionLevel}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {open && query.trim() && results.length === 0 && libs.length > 0 && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl shadow-xl border border-slate-200 z-[9999] p-4 text-center">
          <p className="text-sm text-slate-500">검색 결과가 없습니다</p>
        </div>
      )}
    </div>
  );
}
