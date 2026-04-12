"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { Ripple } from "@/components/magicui/ripple";
import { Spotlight } from "@/components/magicui/spotlight";
import { BorderBeam } from "@/components/magicui/border-beam";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="#3b82f6" />
      <Ripple mainCircleSize={300} mainCircleOpacity={0.1} numCircles={6} className="opacity-30" />
      
      <div className="w-full max-w-sm relative z-10">
        {/* Glassmorphic Card */}
        <div className="glass rounded-3xl p-8 shadow-2xl shadow-blue-500/10 backdrop-blur-xl border border-white/20 relative overflow-hidden">
          <BorderBeam size={300} duration={12} colorFrom="#3b82f6" colorTo="#8b5cf6" />
          {/* Heading */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold">
              <AnimatedGradientText>{"좌석이음에 오신 것을 환영합니다"}</AnimatedGradientText>
            </h1>
            <p className="text-sm text-slate-500 mt-2">전국 도서관 실시간 좌석 정보를 한눈에</p>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200/50" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white/50 text-slate-500 font-medium">소셜 로그인</span>
            </div>
          </div>

          {/* Kakao Login */}
          <button
            onClick={() => signIn("kakao", { callbackUrl: "/" })}
            className="w-full mb-3 flex items-center justify-center gap-3 px-4 py-3 bg-yellow-300 hover:bg-yellow-400 text-slate-900 font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 5.58 2 10c0 2.54 1.19 4.81 3.04 6.27-.51 1.9-1.48 3.51-1.48 3.51s1.89.07 3.5-.83c1.02.42 2.18.65 3.44.65 5.52 0 10-3.58 10-8 0-4.42-4.48-8-10-8z" />
            </svg>
            카카오로 로그인
          </button>

          {/* Google Login */}
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="w-full mb-6 flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-slate-50 text-slate-900 font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-xl border border-slate-200"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M5.26620228 9.811827h6.46989898v3.04142579H8.75878961c-.297491 1.735056-.906496 2.868934-1.881779 3.632346.879625.71272 2.287476 1.133993 3.753228 1.133993 2.695659 0 4.956334-1.759443 5.517372-4.091514H22.5v-3.709107c0-5.838676-3.572908-9.813673-9.517374-9.813673-5.87082 0-10.275969 4.405452-10.275969 10.271945 0 5.865493 4.405148 10.271947 10.275969 10.271947z" />
              <path fill="#FBBC05" d="M5.26620228 9.811827v2.622383h3.95921557c.639754 1.737587 2.122567 2.88948 3.97712 2.88948.653857 0 1.27112-.149349 1.84449-.425661l3.525563 2.723736c-.493162.385521-1.896443 1.009852-3.742833 1.009852-2.695659 0-4.956334-1.759443-5.517372-4.091514H5.26620228z" />
              <path fill="#34A853" d="M8.75878961 12.464645c-.104283-.638404-.159622-1.323433-.159622-2.032722 0-.709289.05534-1.394318.159622-2.032722H5.26620228v4.065444h3.49258733z" />
              <path fill="#EA4335" d="M12.24361898 6.399232c.643038-.637584 1.466653-1.271783 2.460175-1.463968v3.717062h3.768321c-.355022-1.134771-.913607-2.122567-1.884788-2.8489l3.525563-2.723736c-1.218147 1.133993-3.058068 2.858971-5.409071 2.958408z" />
            </svg>
            Google로 로그인
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200/50" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white/50 text-slate-500 font-medium">또는</span>
            </div>
          </div>

          {/* Browse without login */}
          <Link
            href="/"
            className="block w-full text-center px-4 py-3 bg-slate-200/50 hover:bg-slate-300/50 text-slate-700 font-bold rounded-xl transition-all"
          >
            로그인 없이 둘러보기
          </Link>
        </div>

        {/* Footer text */}
        <p className="text-center text-sm text-slate-500 mt-6">
          이 서비스는 공공 도서관 데이터를 기반으로 합니다
        </p>
      </div>
    </div>
  );
}
