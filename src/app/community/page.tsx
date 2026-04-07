"use client";

import { useState } from "react";
import { mockReviews, mockStudyGroups } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const TABS = ["💬 한줄 후기", "⭐ 도서관 리뷰", "📚 스터디 매칭"] as const;

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("💬 한줄 후기");

  return (
    <div className="max-w-2xl mx-auto">
      {/* 탭 */}
      <div className="sticky top-14 z-30 bg-white border-b border-slate-200 flex">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 py-3 text-sm font-medium transition",
              activeTab === tab ? "tab-active" : "text-slate-400 hover:text-slate-600"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-4">
        {activeTab === "💬 한줄 후기" && <ShortReviewTab />}
        {activeTab === "⭐ 도서관 리뷰" && <DetailReviewTab />}
        {activeTab === "📚 스터디 매칭" && <StudyMatchTab />}
      </div>
    </div>
  );
}

// ========================
// 한줄 후기 탭
// ========================
function ShortReviewTab() {
  const moods = ["😊 좋아요", "😐 보통", "😰 복잡해요", "🤫 조용해요", "💪 집중 잘 돼요"];
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {/* 작성 영역 */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
            나
          </div>
          <div className="flex-1">
            <textarea
              placeholder="지금 이용 중인 도서관의 분위기를 알려주세요..."
              className="w-full resize-none border-0 bg-transparent text-sm placeholder:text-slate-400 focus:ring-0 p-0"
              rows={2}
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {moods.map((mood) => (
                <button
                  key={mood}
                  onClick={() => setSelectedMood(selectedMood === mood ? null : mood)}
                  className={cn(
                    "px-2.5 py-1 text-xs rounded-full border transition",
                    selectedMood === mood
                      ? "bg-blue-50 border-blue-300 text-blue-700"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:border-blue-200"
                  )}
                >
                  {mood}
                </button>
              ))}
            </div>
            <div className="flex justify-end mt-3">
              <button className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-full hover:bg-blue-700 transition">
                게시하기
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 피드 */}
      {mockReviews.map((review) => (
        <div key={review.id} className="bg-white rounded-xl border border-slate-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {review.userName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900">{review.userName}</span>
                <span className="text-xs text-slate-400">{review.createdAt}</span>
              </div>
              <p className="text-xs text-slate-500 truncate">{review.libraryName} {review.roomName || ""}</p>
            </div>
            <span className="px-2 py-0.5 bg-slate-100 text-xs rounded-full text-slate-600 shrink-0">{review.mood}</span>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">{review.content}</p>
          <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
            <button className="flex items-center gap-1 hover:text-blue-600 transition">👍 {review.helpful}</button>
            <button className="flex items-center gap-1 hover:text-blue-600 transition">💬 {review.comments}</button>
            <button className="flex items-center gap-1 hover:text-blue-600 transition">📌 저장</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ========================
// 도서관 리뷰 탭
// ========================
function DetailReviewTab() {
  const detailReviews = [
    {
      id: "dr1", userName: "김*수", rating: 5, libraryName: "서울중앙도서관",
      ratings: { clean: 4.5, noise: 5, seat: 4, facility: 4.5 },
      content: "시설이 깔끔하고 정말 조용해요. 3층 열람실이 특히 좋습니다. 콘센트도 충분하고 와이파이 속도도 빠릅니다.",
      helpful: 45, createdAt: "2일 전",
    },
    {
      id: "dr2", userName: "이*연", rating: 4, libraryName: "마포중앙도서관",
      ratings: { clean: 4, noise: 3.5, seat: 4.5, facility: 4 },
      content: "자리가 넓고 편해요. 다만 점심시간에는 주변 식당에서 냄새가 좀 올라오는 게 아쉽습니다. 전반적으로 만족!",
      helpful: 28, createdAt: "3일 전",
    },
    {
      id: "dr3", userName: "박*호", rating: 3, libraryName: "용산도서관",
      ratings: { clean: 3, noise: 2.5, seat: 3, facility: 2.5 },
      content: "건물이 좀 오래됐지만 위치가 좋아서 자주 갑니다. 냉난방이 좀 아쉽고 좌석이 좁아요.",
      helpful: 15, createdAt: "5일 전",
    },
  ];

  return (
    <div className="space-y-4">
      {/* 필터 */}
      <div className="flex items-center gap-2">
        <select className="text-sm bg-white border border-slate-200 rounded-lg px-3 py-1.5">
          <option>전체 지역</option>
          <option>서울</option>
          <option>경기</option>
          <option>부산</option>
        </select>
        <select className="text-sm bg-white border border-slate-200 rounded-lg px-3 py-1.5">
          <option>최신순</option>
          <option>평점순</option>
          <option>도움순</option>
        </select>
      </div>

      {detailReviews.map((review) => (
        <div key={review.id} className="bg-white rounded-xl border border-slate-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {review.userName[0]}
              </div>
              <div>
                <span className="text-sm font-semibold">{review.userName}</span>
                <span className="text-xs text-slate-400 ml-2">{review.createdAt}</span>
              </div>
            </div>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <svg key={s} className={cn("w-4 h-4", s <= review.rating ? "text-amber-400" : "text-slate-200")} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
          </div>
          <p className="text-xs text-blue-600 font-medium mb-2">{review.libraryName}</p>

          {/* 카테고리 평점 미니 */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            {[
              { label: "청결", score: review.ratings.clean },
              { label: "소음", score: review.ratings.noise },
              { label: "좌석", score: review.ratings.seat },
              { label: "시설", score: review.ratings.facility },
            ].map((r) => (
              <div key={r.label} className="text-center">
                <p className="text-[10px] text-slate-500">{r.label}</p>
                <p className="text-sm font-semibold text-amber-600">{r.score}</p>
              </div>
            ))}
          </div>

          <p className="text-sm text-slate-700 leading-relaxed">{review.content}</p>

          <div className="flex items-center mt-3 text-xs text-slate-500">
            <button className="hover:text-blue-600 transition">👍 도움이 됐어요 {review.helpful}</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ========================
// 스터디 매칭 탭
// ========================
function StudyMatchTab() {
  return (
    <div className="space-y-4">
      <button className="w-full py-3 border-2 border-dashed border-blue-300 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition">
        📚 스터디 그룹 만들기
      </button>

      {mockStudyGroups.map((group) => (
        <div key={group.id} className="bg-white rounded-xl border border-slate-100 p-4">
          <h3 className="font-bold text-slate-900">{group.title}</h3>
          <div className="mt-2 space-y-1 text-sm text-slate-600">
            <p>📍 {group.libraryName} {group.location}</p>
            <p>👥 {group.currentMembers}/{group.maxMembers}명 참여 중 &nbsp;|&nbsp; 🗓️ {group.schedule}</p>
            <p>🕐 {group.time}</p>
          </div>
          <p className="text-sm text-slate-700 mt-2 leading-relaxed">{group.description}</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {group.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full font-medium">#{tag}</span>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <button className="flex-1 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition">
              참여 신청하기
            </button>
            <button className="px-4 py-2 border border-slate-200 text-slate-600 text-sm rounded-lg hover:bg-slate-50 transition">
              상세보기
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
