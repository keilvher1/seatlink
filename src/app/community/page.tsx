"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { MagicCard } from "@/components/magicui/magic-card";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { Particles } from "@/components/magicui/particles";
import { ShimmerButton } from "@/components/magicui/shimmer-button";

const TABS = ["\uD83D\uDCAC \uD55C\uC904 \uD6C4\uAE30", "\u2B50 \uB3C4\uC11C\uAD00 \uB9AC\uBDF0", "\uD83D\uDCDA \uC2A4\uD130\uB514 \uB9E4\uCE6D"] as const;

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("\uD83D\uDCAC \uD55C\uC904 \uD6C4\uAE30");

  return (
    <div className="max-w-2xl mx-auto pb-24 md:pb-0 relative">
      {/* Background Particles */}
      <Particles className="absolute inset-0 -z-10" quantity={25} color="#6366f1" size={0.6} speed={0.15} />

      {/* \uD5E4\uB354 */}
      <div className="px-4 py-6 text-center border-b border-slate-200/50 bg-gradient-to-b from-blue-50 to-transparent relative">
        <h1 className="text-3xl font-bold">
          <AnimatedGradientText>{"\uCEE4\uBBA4\uB2C8\uD2F0"}</AnimatedGradientText>
        </h1>
        <p className="text-sm text-slate-500 mt-2">{"\uB3C4\uC11C\uAD00 \uC774\uC6A9\uC790\uB4E4\uACFC \uACBD\uD5D8\uC744 \uB098\uB204\uC5B4\uBCF4\uC138\uC694"}</p>
      </div>

      {/* \uD0ED */}
      <div className="sticky top-14 z-30 glass">
        <div className="flex">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 py-4 text-sm font-semibold transition-all duration-300",
                activeTab === tab
                  ? "tab-active bg-gradient-to-b from-blue-50 to-transparent"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {activeTab === "\uD83D\uDCAC \uD55C\uC904 \uD6C4\uAE30" && <ShortReviewTab />}
        {activeTab === "\u2B50 \uB3C4\uC11C\uAD00 \uB9AC\uBDF0" && <DetailReviewTab />}
        {activeTab === "\uD83D\uDCDA \uC2A4\uD130\uB514 \uB9E4\uCE6D" && <StudyMatchTab />}
      </div>
    </div>
  );
}

// ========================
// \uD55C\uC904 \uD6C4\uAE30 \uD0ED
// ========================
function ShortReviewTab() {
  const moods = ["\uC88B\uC544\uC694", "\uBCF4\uD1B5", "\uBCF5\uC7A1\uD574\uC694", "\uC870\uC6A9\uD574\uC694", "\uC9D1\uC911 \uC798 \uB3FC\uC694"];
  const moodEmojis = ["\uD83D\uDE0A", "\uD83D\uDE10", "\uD83D\uDE30", "\uD83E\uDD2B", "\uD83D\uDCAA"];
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  return (
    <div className="space-y-4 animate-slide-up">
      {/* \uC791\uC131 \uC601\uC5ED */}
      <MagicCard className="glass rounded-2xl p-5" gradientColor="rgba(59,130,246,0.08)">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-md">
            {"\uB098"}
          </div>
          <div className="flex-1">
            <textarea
              placeholder={"\uC9C0\uAE08 \uC774\uC6A9 \uC911\uC778 \uB3C4\uC11C\uAD00\uC758 \uBD84\uC704\uAE30\uB97C \uC54C\uB824\uC8FC\uC138\uC694..."}
              className="w-full resize-none border-0 bg-transparent text-sm placeholder:text-slate-400 focus:ring-0 p-0 font-medium text-slate-700"
              rows={2}
            />
            <div className="flex flex-wrap gap-1.5 mt-3">
              {moods.map((mood, idx) => (
                <button
                  key={mood}
                  onClick={() => setSelectedMood(selectedMood === mood ? null : mood)}
                  className={cn(
                    "px-3 py-1 text-xs font-semibold rounded-full transition-all duration-300 transform",
                    selectedMood === mood
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/30 scale-105"
                      : "glass text-slate-700 hover:scale-105"
                  )}
                >
                  {moodEmojis[idx]} {mood}
                </button>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <ShimmerButton
                className="px-5 py-2 text-sm font-bold"
                shimmerColor="rgba(255,255,255,0.2)"
                background="linear-gradient(110deg, #2563eb, #4f46e5, #2563eb)"
              >
                {"\uAC8C\uC2DC\uD558\uAE30"}
              </ShimmerButton>
            </div>
          </div>
        </div>
      </MagicCard>

      {/* \uBE48 \uC0C1\uD0DC */}
      <MagicCard className="glass rounded-2xl p-6 text-center" gradientColor="rgba(59,130,246,0.06)">
        <div className="py-8">
          <span className="text-5xl mb-4 block">{"\uD83D\uDCAC"}</span>
          <h3 className="font-bold text-slate-900 mb-2 text-lg">{"\uC544\uC9C1 \uD6C4\uAE30\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4"}</h3>
          <p className="text-slate-600 font-medium">{"\uCCAB \uBC88\uC9F8 \uD6C4\uAE30\uB97C \uC791\uC131\uD574\uBCF4\uC138\uC694!"}</p>
        </div>
      </MagicCard>
    </div>
  );
}

// ========================
// \uB3C4\uC11C\uAD00 \uB9AC\uBDF0 \uD0ED
// ========================
function DetailReviewTab() {
  return (
    <div className="space-y-4 animate-slide-up">
      {/* \uD544\uD130 */}
      <div className="flex items-center gap-2">
        <select className="text-sm glass rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 font-medium text-slate-700">
          <option>{"\uC804\uCCB4 \uC9C0\uC5ED"}</option>
          <option>{"\uC11C\uC6B8"}</option>
          <option>{"\uACBD\uAE30"}</option>
          <option>{"\uBD80\uC0B0"}</option>
        </select>
        <select className="text-sm glass rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 font-medium text-slate-700">
          <option>{"\uCD5C\uC2E0\uC21C"}</option>
          <option>{"\uD3C9\uC810\uC21C"}</option>
          <option>{"\uB3C4\uC6C0\uC21C"}</option>
        </select>
      </div>

      <MagicCard className="glass rounded-2xl p-6 text-center" gradientColor="rgba(245,158,11,0.06)">
        <div className="py-8">
          <span className="text-5xl mb-4 block">{"\u2B50"}</span>
          <h3 className="font-bold text-slate-900 mb-2 text-lg">{"\uB9AC\uBDF0 \uC11C\uBE44\uC2A4 \uC900\uBE44 \uC911"}</h3>
          <p className="text-slate-600 font-medium">{"\uACE7 \uB3C4\uC11C\uAD00 \uC774\uC6A9 \uB9AC\uBDF0\uB97C \uC81C\uACF5\uD560 \uC608\uC815\uC785\uB2C8\uB2E4."}</p>
        </div>
      </MagicCard>
    </div>
  );
}

// ========================
// \uC2A4\uD130\uB514 \uB9E4\uCE6D \uD0ED
// ========================
function StudyMatchTab() {
  return (
    <div className="space-y-4 animate-slide-up">
      <ShimmerButton
        className="w-full py-4 text-lg font-bold"
        shimmerColor="rgba(255,255,255,0.2)"
        background="linear-gradient(110deg, #2563eb, #4f46e5, #2563eb)"
      >
        {"\uD83D\uDCDA \uC2A4\uD130\uB514 \uADF8\uB8F9 \uB9CC\uB4E4\uAE30"}
      </ShimmerButton>

      <MagicCard className="glass rounded-2xl p-6 text-center" gradientColor="rgba(59,130,246,0.06)">
        <div className="py-8">
          <span className="text-5xl mb-4 block">{"\uD83D\uDCDA"}</span>
          <h3 className="font-bold text-slate-900 mb-2 text-lg">{"\uC2A4\uD130\uB514 \uB9E4\uCE6D \uC11C\uBE44\uC2A4 \uC900\uBE44 \uC911"}</h3>
          <p className="text-slate-600 font-medium">{"\uACE7 \uC2A4\uD130\uB514 \uADF8\uB8F9 \uB9E4\uCE6D \uAE30\uB2A5\uC744 \uC81C\uACF5\uD560 \uC608\uC815\uC785\uB2C8\uB2E4."}</p>
        </div>
      </MagicCard>
    </div>
  );
}
