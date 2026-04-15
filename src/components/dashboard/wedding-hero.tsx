"use client";

import { useEffect, useState } from "react";

interface WeddingHeroProps {
  partnerName1: string | null;
  partnerName2: string | null;
  weddingDate: string | null;
  fullName: string | null;
}

export function WeddingHero({
  partnerName1,
  partnerName2,
  weddingDate,
  fullName,
}: WeddingHeroProps) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const coupleLine =
    partnerName1 && partnerName2
      ? `${partnerName1} & ${partnerName2}`
      : partnerName1 || fullName || null;

  // When no wedding date, just a simple welcome card
  if (!weddingDate) {
    const greeting = getGreeting(now);
    const firstName = partnerName1 || fullName?.split(" ")[0] || "there";
    return (
      <div className="rounded-xl bg-gradient-to-br from-white via-[var(--tc-blush-light)]/40 to-[var(--tc-sage-light)]/40 border border-[var(--tc-gray-200)] p-6 lg:p-8">
        <h1 className="font-heading text-2xl lg:text-3xl font-semibold text-[var(--tc-black)]">
          {greeting}, {firstName}
        </h1>
        <p className="mt-1 text-sm text-[var(--tc-gray-500)]">
          Set your wedding date to unlock your personalised timeline
        </p>
      </div>
    );
  }

  const wedding = new Date(weddingDate);
  const diffMs = now ? wedding.getTime() - now.getTime() : 0;
  const days = now ? Math.floor(diffMs / (1000 * 60 * 60 * 24)) : 0;
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  const formatted = wedding.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const isPast = now ? diffMs < 0 : false;

  return (
    <div className="rounded-xl bg-gradient-to-br from-[var(--tc-blush-light)]/50 via-white to-[var(--tc-sage-light)]/40 border border-[var(--tc-sage-light)] p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
        <div>
          <p className="text-xs font-medium text-[var(--tc-gray-500)] uppercase tracking-wide">
            {isPast ? "Your Wedding Day" : "Counting down to"}
          </p>
          {coupleLine && (
            <h1 className="mt-1 font-heading text-2xl lg:text-3xl font-semibold text-[var(--tc-black)]">
              {coupleLine}
            </h1>
          )}
          <p className="mt-1 text-sm text-[var(--tc-gray-600)]">{formatted}</p>
        </div>
        {!isPast && now && (
          <div className="text-left sm:text-right">
            <p className="font-heading text-4xl lg:text-5xl font-semibold text-[var(--tc-black)] leading-none">
              {days}
            </p>
            <p className="text-xs text-[var(--tc-gray-500)] mt-1">days to go</p>
          </div>
        )}
        {isPast && (
          <div className="text-left sm:text-right">
            <p className="font-heading text-xl lg:text-2xl font-semibold text-[var(--tc-black)]">
              Congratulations!
            </p>
            <p className="text-xs text-[var(--tc-gray-500)] mt-1">
              We hope your day was perfect
            </p>
          </div>
        )}
      </div>

      {!isPast && now && (
        <div className="flex gap-3 mt-5">
          <TimeBlock value={months} label="months" />
          <TimeBlock value={weeks} label="weeks" />
          <TimeBlock value={days} label="days" />
        </div>
      )}
    </div>
  );
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex-1 rounded-lg bg-white/70 backdrop-blur p-3 text-center border border-white/50">
      <p className="text-lg lg:text-xl font-semibold text-[var(--tc-black)]">
        {value}
      </p>
      <p className="text-[10px] text-[var(--tc-gray-500)] uppercase tracking-wide mt-0.5">
        {label}
      </p>
    </div>
  );
}

function getGreeting(now: Date | null): string {
  if (!now) return "Hello";
  const h = now.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}
