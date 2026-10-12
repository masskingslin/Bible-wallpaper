import React, { useState, useRef, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  Flame, Award, CheckCircle2, ChevronRight, Sparkles, 
  BookOpen, Star, Calendar, Shield, X, ArrowUpRight, Heart,
  PartyPopper, RotateCw, Trophy, Crown
} from 'lucide-react';
import { 
  StreakData, 
  STREAK_MILESTONES, 
  StreakMilestone,
  getCurrentMilestone, 
  getNextMilestone, 
  getWeeklyStreakProgress, 
  recordScriptureInteraction, 
  getLocalDateString,
  saveStreakData
} from '../utils/streakUtils';
import { triggerWebHaptic } from '../utils/haptics';

interface StreakTrackerCardProps {
  streakData: StreakData;
  onStreakUpdate: (updated: StreakData) => void;
  isLight: boolean;
  onReadVerseClick?: () => void;
}

interface ActiveMilestoneCelebration {
  days: number;
  title: string;
  emoji: string;
  verseRef?: string;
  verseSnippet?: string;
}

export const StreakTrackerCard: React.FC<StreakTrackerCardProps> = ({
  streakData,
  onStreakUpdate,
  isLight,
  onReadVerseClick,
}) => {
  const [isMilestonesModalOpen, setIsMilestonesModalOpen] = useState(false);
  const [celebrationToast, setCelebrationToast] = useState<string | null>(null);
  const [activeCelebration, setActiveCelebration] = useState<ActiveMilestoneCelebration | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const confettiInstanceRef = useRef<confetti.CreateTypes | null>(null);
  const celebrationTimerRef = useRef<number | null>(null);
  const prevStreakRef = useRef<number>(streakData.currentStreak);

  // Initialize canvas-confetti scoped directly to this card's canvas element
  useEffect(() => {
    if (canvasRef.current) {
      try {
        confettiInstanceRef.current = confetti.create(canvasRef.current, {
          resize: true,
          useWorker: false, // In-thread for fast canvas-context rendering
        });
      } catch (err) {
        console.warn('Canvas confetti setup:', err);
      }
    }

    return () => {
      if (confettiInstanceRef.current) {
        try {
          confettiInstanceRef.current.reset();
        } catch {
          // ignore
        }
      }
      if (celebrationTimerRef.current) {
        window.clearTimeout(celebrationTimerRef.current);
      }
    };
  }, []);

  // Celebration Confetti Cannon Trigger
  const triggerMilestoneConfetti = useCallback((milestoneDays: number, customTitle?: string) => {
    triggerWebHaptic('success');

    const matched = STREAK_MILESTONES.find((m) => m.days === milestoneDays);
    const title = customTitle || matched?.title || `${milestoneDays}-Day Milestone`;
    const emoji = matched?.emoji || '✨';
    const verseRef = matched?.verseRef;
    const verseSnippet = matched?.verseSnippet;

    setActiveCelebration({
      days: milestoneDays,
      title,
      emoji,
      verseRef,
      verseSnippet,
    });

    setCelebrationToast(`🎉 Reached Day ${milestoneDays} Milestone: "${title}" ${emoji}!`);

    // Palette custom-tailored to the sacred milestone
    let colors = ['#f59e0b', '#fbbf24', '#fef08a', '#ffffff', '#d97706']; // Golden amber default

    if (milestoneDays === 7) {
      // 7 Days: Guiding Light - Bright golden sunlight, warm amber, white starlight
      colors = ['#fbbf24', '#f59e0b', '#fde047', '#ffffff', '#d97706', '#fef08a'];
    } else if (milestoneDays === 30) {
      // 30 Days: Crown of Life - Royal imperial gold, vibrant crimson, amethyst purple
      colors = ['#ffd700', '#f59e0b', '#ec4899', '#8b5cf6', '#fb7185', '#ffffff'];
    } else if (milestoneDays === 100) {
      // 100 Days: Temple Pillar - Iridescent divine majesty
      colors = ['#ffd700', '#38bdf8', '#34d399', '#a855f7', '#f43f5e', '#ffffff'];
    } else if (milestoneDays === 14) {
      // Shield of Faith - Royal indigo and sapphire
      colors = ['#6366f1', '#3b82f6', '#818cf8', '#fbbf24', '#ffffff'];
    } else if (milestoneDays === 21) {
      // Fruit of the Spirit - Emerald living greens and gold
      colors = ['#10b981', '#059669', '#34d399', '#f59e0b', '#ffffff'];
    }

    const fireConfetti = (opts: confetti.Options) => {
      if (confettiInstanceRef.current) {
        try {
          confettiInstanceRef.current(opts);
          return;
        } catch (e) {
          console.warn('Canvas instance error, falling back:', e);
        }
      }
      // Fallback to global window confetti if custom canvas is not available
      try {
        confetti(opts);
      } catch {
        // graceful fallback
      }
    };

    // Stage 1: Left Cannon burst
    fireConfetti({
      particleCount: milestoneDays >= 30 ? 55 : 40,
      angle: 60,
      spread: 60,
      origin: { x: 0.1, y: 0.85 },
      colors,
      startVelocity: 35,
      gravity: 0.9,
      ticks: 200,
    });

    // Stage 2: Right Cannon burst
    fireConfetti({
      particleCount: milestoneDays >= 30 ? 55 : 40,
      angle: 120,
      spread: 60,
      origin: { x: 0.9, y: 0.85 },
      colors,
      startVelocity: 35,
      gravity: 0.9,
      ticks: 200,
    });

    // Stage 3: Center Shower Burst (after 180ms)
    setTimeout(() => {
      fireConfetti({
        particleCount: milestoneDays >= 100 ? 80 : 50,
        angle: 90,
        spread: 85,
        origin: { x: 0.5, y: 0.35 },
        colors,
        startVelocity: 28,
        gravity: 0.75,
        ticks: 240,
        shapes: ['circle', 'square'],
        scalar: 1.1,
      });
    }, 180);

    // Stage 4: Grand Finale Shimmer (after 380ms for milestones >= 7)
    if (milestoneDays >= 7) {
      setTimeout(() => {
        fireConfetti({
          particleCount: milestoneDays >= 30 ? 45 : 30,
          spread: 110,
          origin: { x: 0.5, y: 0.2 },
          colors: ['#ffffff', '#fef08a', '#ffd700'],
          startVelocity: 24,
          gravity: 0.6,
          ticks: 190,
          scalar: 0.95,
        });
      }, 380);
    }

    // Reset celebration banner after 7 seconds
    if (celebrationTimerRef.current) {
      window.clearTimeout(celebrationTimerRef.current);
    }
    celebrationTimerRef.current = window.setTimeout(() => {
      setActiveCelebration(null);
    }, 7000);
  }, []);

  // Monitor streak changes from scripture interactions to auto-trigger celebrations
  useEffect(() => {
    const prev = prevStreakRef.current;
    const current = streakData.currentStreak;
    prevStreakRef.current = current;

    if (current > prev) {
      // Check if current matches a milestone day (e.g. 7, 30, 100, etc.)
      const matched = STREAK_MILESTONES.find((m) => m.days === current);
      if (matched) {
        triggerMilestoneConfetti(matched.days, matched.title);
      }
    }
  }, [streakData.currentStreak, triggerMilestoneConfetti]);

  const todayStr = getLocalDateString();
  const isCompletedToday = streakData.lastReadDate === todayStr;

  const currentMilestone = getCurrentMilestone(streakData.currentStreak);
  const nextMilestone = getNextMilestone(streakData.currentStreak);
  const weeklyProgress = getWeeklyStreakProgress(streakData.readDates);

  // Calculate percentage toward next milestone
  const prevMilestoneDays = currentMilestone ? currentMilestone.days : 0;
  const targetDays = nextMilestone ? nextMilestone.days : 100;
  const progressRatio = nextMilestone
    ? Math.min(
        100,
        Math.max(
          5,
          ((streakData.currentStreak - prevMilestoneDays) / (targetDays - prevMilestoneDays)) * 100
        )
      )
    : 100;

  const handleManualCheckIn = () => {
    triggerWebHaptic('success');
    const result = recordScriptureInteraction();
    onStreakUpdate(result.data);

    if (result.newMilestone) {
      setCelebrationToast(`🎉 Unlocked Milestone: "${result.newMilestone.title}"! ${result.newMilestone.emoji}`);
      triggerMilestoneConfetti(result.newMilestone.days, result.newMilestone.title);
    } else if (!result.alreadyCompletedToday) {
      setCelebrationToast(`🔥 Day ${result.data.currentStreak} Devotion Completed!`);
      // Check if current is a milestone day
      const milestone = STREAK_MILESTONES.find((m) => m.days === result.data.currentStreak);
      if (milestone) {
        triggerMilestoneConfetti(milestone.days, milestone.title);
      }
    } else {
      setCelebrationToast(`✨ Scripture Devotion recorded for today! Total: ${result.data.totalVersesRead}`);
      // If user is on a milestone day, still give a delightful celebration burst
      const milestone = STREAK_MILESTONES.find((m) => m.days === result.data.currentStreak);
      if (milestone) {
        triggerMilestoneConfetti(milestone.days, milestone.title);
      }
    }

    setTimeout(() => {
      setCelebrationToast(null);
    }, 4000);

    if (onReadVerseClick) {
      onReadVerseClick();
    }
  };

  // Milestone simulation helper for immediate preview & celebration
  const handleSimulateMilestone = (targetDays: number) => {
    triggerWebHaptic('heavy');
    const milestone = STREAK_MILESTONES.find((m) => m.days === targetDays) || getCurrentMilestone(targetDays);
    const unlocked = Array.from(new Set([
      ...streakData.unlockedMilestoneDays,
      ...STREAK_MILESTONES.filter((m) => m.days <= targetDays).map((m) => m.days)
    ]));

    const updated: StreakData = {
      ...streakData,
      currentStreak: targetDays,
      longestStreak: Math.max(streakData.longestStreak, targetDays),
      lastReadDate: todayStr,
      unlockedMilestoneDays: unlocked,
      totalVersesRead: Math.max(streakData.totalVersesRead, targetDays),
    };

    saveStreakData(updated);
    onStreakUpdate(updated);
    triggerMilestoneConfetti(targetDays, milestone.title);
  };

  return (
    <>
      <div className={`relative overflow-hidden rounded-3xl border p-5 sm:p-6 transition-all duration-300 shadow-md ${
        isLight
          ? 'bg-gradient-to-br from-[#faf4e8] via-[#f7efe0] to-[#f3e7d1] border-[#dfd2be]'
          : 'bg-gradient-to-br from-stone-900/90 via-stone-900/95 to-stone-950 border-amber-500/20'
      }`}>

        {/* Dedicated Canvas for Confetti Celebrations */}
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="absolute inset-0 w-full h-full pointer-events-none z-20 rounded-3xl"
        />
        
        {/* Ambient background glow */}
        <div 
          className="absolute -top-10 -right-10 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-20"
          style={{ background: currentMilestone.accentGlow }}
        />

        {/* Header Row: Title & Milestone Quick View */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-800/15 dark:border-stone-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-stone-950 shadow-md shadow-amber-500/20">
              <Flame className="w-5 h-5 fill-current animate-bounce [animation-duration:2s]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-base font-bold font-cinzel tracking-tight ${
                  isLight ? 'text-stone-900' : 'text-white'
                }`}>
                  Daily Scripture Reading Streak
                </h3>
                {isCompletedToday && (
                  <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" />
                    Today Complete
                  </span>
                )}
              </div>
              <p className={`text-xs ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>
                Build your steadfast habit in God's Word every day
              </p>
            </div>
          </div>

          {/* View All Milestones Action */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                triggerWebHaptic('selection');
                setIsMilestonesModalOpen(true);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition ${
                isLight
                  ? 'bg-white/80 hover:bg-white border-[#d8cca8] text-amber-950 shadow-xs'
                  : 'bg-stone-850 hover:bg-stone-800 border-stone-750 text-amber-300'
              }`}
              title="View all scripture milestones and devotional rewards"
            >
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>Milestones ({streakData.unlockedMilestoneDays.length}/{STREAK_MILESTONES.length})</span>
              <ChevronRight className="w-3 h-3 text-stone-400" />
            </button>
          </div>
        </div>

        {/* Milestone Confetti Celebration Banner (Visible upon triggering) */}
        {activeCelebration && (
          <div className="relative z-30 mt-3 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/25 via-yellow-500/20 to-amber-500/25 border-2 border-amber-400/70 shadow-lg shadow-amber-500/20 animate-fade-in">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold text-lg shadow-md animate-pulse">
                  {activeCelebration.emoji}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-amber-500/30 text-amber-900 dark:text-amber-200">
                      Milestone Day {activeCelebration.days}
                    </span>
                    <span className="text-xs font-bold font-cinzel text-amber-900 dark:text-amber-100">
                      {activeCelebration.title} Reached!
                    </span>
                  </div>
                  {activeCelebration.verseSnippet && (
                    <p className="text-[11px] italic text-amber-950/80 dark:text-amber-200/90 mt-0.5">
                      "{activeCelebration.verseSnippet}" {activeCelebration.verseRef && <span className="font-bold">— {activeCelebration.verseRef}</span>}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => triggerMilestoneConfetti(activeCelebration.days, activeCelebration.title)}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-[11px] flex items-center gap-1 transition shadow-xs"
                  title="Fire another confetti burst"
                >
                  <PartyPopper className="w-3 h-3" />
                  <span>Replay</span>
                </button>
                <button
                  onClick={() => setActiveCelebration(null)}
                  className="p-1 rounded-lg hover:bg-amber-500/20 text-stone-500 dark:text-stone-400 transition"
                  title="Dismiss celebration"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Milestone Celebration Trigger Bar (Immediate Testing for 7d, 30d, 100d) */}
        <div className="relative z-10 mt-3 pt-2 pb-1 flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="text-stone-500 dark:text-stone-400 font-semibold flex items-center gap-1">
            <PartyPopper className="w-3 h-3 text-amber-500" />
            <span>Celebrate Milestone:</span>
          </span>
          <button
            onClick={() => triggerMilestoneConfetti(7, 'Guiding Light')}
            className={`px-2 py-0.5 rounded-lg border font-medium text-[11px] flex items-center gap-1 transition hover:scale-[1.03] active:scale-95 ${
              isLight
                ? 'bg-amber-100/70 border-amber-300 text-amber-900 hover:bg-amber-200/80'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
            }`}
            title="Trigger canvas confetti for Day 7 milestone"
          >
            <span>🕯️</span>
            <span>7 Days</span>
          </button>
          <button
            onClick={() => triggerMilestoneConfetti(30, 'Crown of Life')}
            className={`px-2 py-0.5 rounded-lg border font-medium text-[11px] flex items-center gap-1 transition hover:scale-[1.03] active:scale-95 ${
              isLight
                ? 'bg-purple-100/70 border-purple-300 text-purple-900 hover:bg-purple-200/80'
                : 'bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20'
            }`}
            title="Trigger canvas confetti for Day 30 milestone"
          >
            <span>👑</span>
            <span>30 Days</span>
          </button>
          <button
            onClick={() => triggerMilestoneConfetti(100, 'Temple Pillar')}
            className={`px-2 py-0.5 rounded-lg border font-medium text-[11px] flex items-center gap-1 transition hover:scale-[1.03] active:scale-95 ${
              isLight
                ? 'bg-emerald-100/70 border-emerald-300 text-emerald-900 hover:bg-emerald-200/80'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
            }`}
            title="Trigger canvas confetti for Day 100 milestone"
          >
            <span>🏛️</span>
            <span>100 Days</span>
          </button>
        </div>

        {/* Middle Grid: Main Stats + 7-Day Pulse + Next Milestone */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-5 pt-3 items-center">
          
          {/* Col 1: Streak Badge (3 cols) */}
          <div className="md:col-span-4 flex items-center gap-4">
            <div className={`relative p-3.5 rounded-2xl border text-center shrink-0 min-w-[100px] sm:min-w-[110px] shadow-sm ${
              isLight
                ? 'bg-gradient-to-b from-amber-50 to-amber-100/60 border-amber-300/80'
                : 'bg-stone-850/80 border-amber-500/30 shadow-inner'
            }`}>
              <div className="flex items-center justify-center gap-1 text-amber-500 mb-0.5">
                <Flame className="w-4 h-4 fill-current text-amber-500" />
                <span className="text-[10px] uppercase font-bold tracking-wider font-mono">Streak</span>
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-amber-600 dark:text-amber-400 leading-none">
                {streakData.currentStreak}
              </div>
              <div className="text-[10px] font-medium text-stone-500 dark:text-stone-400 mt-1">
                {streakData.currentStreak === 1 ? 'Day Active' : 'Days Active'}
              </div>
            </div>

            {/* Current Spiritual Milestone */}
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Current Stage
              </span>
              <h4 className={`text-sm sm:text-base font-bold font-cinzel truncate flex items-center gap-1.5 ${
                isLight ? 'text-stone-900' : 'text-stone-100'
              }`}>
                <span>{currentMilestone.emoji}</span>
                <span>{currentMilestone.title}</span>
              </h4>
              <p className={`text-xs italic line-clamp-1 ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>
                "{currentMilestone.verseSnippet}"
              </p>
              <div className="text-[10px] text-stone-400 font-mono mt-0.5">
                Best: <strong>{streakData.longestStreak} days</strong> · Total read: <strong>{streakData.totalVersesRead}</strong>
              </div>
            </div>
          </div>

          {/* Col 2: 7-Day Pulse Circles (5 cols) */}
          <div className="md:col-span-5 flex flex-col justify-center">
            <div className="flex items-center justify-between text-[11px] font-semibold text-stone-500 dark:text-stone-400 mb-2">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-amber-500" />
                <span>Last 7 Days Journey</span>
              </span>
              <span className="text-[10px] font-mono">
                {weeklyProgress.filter((p) => p.completed).length}/7 Completed
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {weeklyProgress.map((day, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all ${
                    day.completed
                      ? 'bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20'
                      : day.isToday
                      ? (isLight
                          ? 'border-2 border-dashed border-amber-500 bg-amber-50 text-amber-700 animate-pulse'
                          : 'border-2 border-dashed border-amber-400 bg-amber-500/10 text-amber-300 animate-pulse')
                      : (isLight
                          ? 'bg-stone-200/70 border border-stone-300/80 text-stone-400'
                          : 'bg-stone-800/80 border border-stone-750 text-stone-500')
                  }`}>
                    {day.completed ? (
                      <CheckCircle2 className="w-4 h-4 fill-stone-950 text-amber-500" />
                    ) : (
                      <span className="text-[10px] font-bold font-mono">{day.dayShort}</span>
                    )}
                  </div>
                  <span className={`text-[9px] mt-1 font-mono font-medium ${
                    day.isToday ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-stone-400'
                  }`}>
                    {day.dayShort}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Col 3: Next Milestone Progress & Check-in Action (3 cols) */}
          <div className="md:col-span-3 flex flex-col justify-center gap-2.5">
            {nextMilestone ? (
              <div className={`p-3 rounded-2xl border ${
                isLight ? 'bg-white/80 border-[#d8cca8]' : 'bg-stone-900 border-stone-800'
              }`}>
                <div className="flex items-center justify-between text-[10px] font-semibold mb-1">
                  <span className="text-stone-400">Next Milestone:</span>
                  <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                    <span>{nextMilestone.emoji}</span>
                    <span>{nextMilestone.title}</span>
                  </span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${
                  isLight ? 'bg-amber-100' : 'bg-stone-800'
                }`}>
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                    style={{ width: `${progressRatio}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[9px] text-stone-400 mt-1 font-mono">
                  <span>Day {streakData.currentStreak}</span>
                  <span>{nextMilestone.days - streakData.currentStreak} days to go</span>
                </div>
              </div>
            ) : (
              <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center">
                <span className="text-xs font-bold text-amber-400">✨ Grandmaster Pillar Reached!</span>
              </div>
            )}

            {/* Check-In / Devotion Completed Button */}
            <button
              onClick={handleManualCheckIn}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 shadow-sm ${
                isCompletedToday
                  ? (isLight
                      ? 'bg-emerald-600/15 border border-emerald-600/30 text-emerald-800 hover:bg-emerald-600/25'
                      : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25')
                  : 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-stone-950 shadow-md shadow-amber-500/20'
              }`}
            >
              {isCompletedToday ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Devotion Completed Today ✓</span>
                </>
              ) : (
                <>
                  <Flame className="w-3.5 h-3.5 fill-current text-stone-950" />
                  <span>Check In Today (+1 Streak)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Celebration Toast if triggered */}
        {celebrationToast && !activeCelebration && (
          <div className="mt-3 p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-700 dark:text-amber-300 text-xs font-semibold text-center animate-fade-in flex items-center justify-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />
            <span>{celebrationToast}</span>
          </div>
        )}
      </div>

      {/* MILESTONES SHOWCASE MODAL */}
      {isMilestonesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className={`relative w-full max-w-2xl rounded-3xl border shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto ${
            isLight
              ? 'bg-[#fcf8f0] border-[#d8cca8] text-stone-900'
              : 'bg-stone-900 border-stone-800 text-white'
          }`}>
            {/* Close Button */}
            <button
              onClick={() => setIsMilestonesModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-stone-800/80 hover:bg-stone-700 text-stone-300 transition"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="text-center max-w-md mx-auto mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-stone-950 mx-auto mb-3 shadow-lg shadow-amber-500/20">
                <Award className="w-6 h-6" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-cinzel">
                Scripture Reading Milestones
              </h2>
              <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>
                Walk with God every day. Each consecutive day in the scripture unlocks sacred milestones, devotional rewards, and joyful celebration effects.
              </p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-mono font-bold">
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>Your Current Streak: <strong>{streakData.currentStreak} Days</strong></span>
              </div>
            </div>

            {/* Quick Test / Celebration Simulator Buttons */}
            <div className={`mb-5 p-3 rounded-2xl border flex flex-wrap items-center justify-between gap-2 text-xs ${
              isLight ? 'bg-amber-100/60 border-amber-300/80 text-amber-950' : 'bg-stone-850/90 border-stone-750 text-stone-300'
            }`}>
              <div className="flex items-center gap-1.5">
                <PartyPopper className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="font-semibold">Celebrate Milestones (Canvas Confetti):</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => {
                    handleSimulateMilestone(7);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-[11px] transition shadow-xs"
                >
                  Day 7 Confetti 🕯️
                </button>
                <button
                  onClick={() => {
                    handleSimulateMilestone(30);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] transition shadow-xs"
                >
                  Day 30 Confetti 👑
                </button>
                <button
                  onClick={() => {
                    handleSimulateMilestone(100);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition shadow-xs"
                >
                  Day 100 Confetti 🏛️
                </button>
              </div>
            </div>

            {/* Milestones Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {STREAK_MILESTONES.map((m) => {
                const isUnlocked = streakData.currentStreak >= m.days;
                return (
                  <div
                    key={m.days}
                    className={`p-4 rounded-2xl border transition relative overflow-hidden flex flex-col justify-between ${
                      isUnlocked
                        ? (isLight
                            ? 'bg-amber-50/80 border-amber-400/80 shadow-xs'
                            : 'bg-stone-850/90 border-amber-500/50 shadow-md ring-1 ring-amber-500/30')
                        : (isLight
                            ? 'bg-stone-100/60 border-stone-200/80 opacity-60'
                            : 'bg-stone-950/60 border-stone-800/80 opacity-50')
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{m.emoji}</span>
                          <div>
                            <h4 className="text-sm font-bold font-cinzel leading-tight">
                              {m.title}
                            </h4>
                            <span className="text-[10px] text-stone-400 font-mono">
                              {m.days} {m.days === 1 ? 'Day' : 'Days'} Devotion
                            </span>
                          </div>
                        </div>

                        {isUnlocked ? (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-500 border border-amber-500/40">
                            <CheckCircle2 className="w-3 h-3" />
                            Unlocked
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-stone-500">
                            {m.days - streakData.currentStreak}d left
                          </span>
                        )}
                      </div>

                      <p className={`text-xs mt-1 italic ${isLight ? 'text-stone-700' : 'text-stone-300'}`}>
                        "{m.verseSnippet}"
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-stone-800/20 dark:border-stone-800/60 flex items-center justify-between">
                      <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                        <span>— {m.verseRef}</span>
                      </div>
                      
                      <button
                        onClick={() => {
                          triggerMilestoneConfetti(m.days, m.title);
                        }}
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border flex items-center gap-1 transition ${
                          isLight
                            ? 'bg-white hover:bg-amber-100 border-amber-300 text-amber-900'
                            : 'bg-stone-800 hover:bg-stone-700 border-stone-700 text-amber-300'
                        }`}
                        title={`Celebrate Day ${m.days} milestone`}
                      >
                        <PartyPopper className="w-2.5 h-2.5 text-amber-500" />
                        <span>Celebrate</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Bottom Close */}
            <div className="mt-6 text-center">
              <button
                onClick={() => setIsMilestonesModalOpen(false)}
                className="px-6 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition"
              >
                Close Milestones
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

