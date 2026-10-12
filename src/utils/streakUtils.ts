export interface StreakMilestone {
  days: number;
  title: string;
  subtitle: string;
  emoji: string;
  verseRef: string;
  verseSnippet: string;
  themeColor: string;
  accentGlow: string;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastReadDate: string | null; // YYYY-MM-DD
  readDates: string[]; // History of dates (YYYY-MM-DD)
  totalVersesRead: number;
  unlockedMilestoneDays: number[];
}

export const STREAK_MILESTONES: StreakMilestone[] = [
  {
    days: 1,
    title: 'Seed of Faith',
    subtitle: 'Your Spiritual Journey Begins',
    emoji: '🌱',
    verseRef: 'Matthew 17:20',
    verseSnippet: 'If you have faith as small as a mustard seed, nothing will be impossible for you.',
    themeColor: 'from-emerald-500 to-teal-600',
    accentGlow: 'rgba(16, 185, 129, 0.35)',
  },
  {
    days: 3,
    title: 'Living Water',
    subtitle: 'Devotional Habit Taking Root',
    emoji: '💧',
    verseRef: 'John 4:14',
    verseSnippet: 'Whoever drinks the water I give them will never thirst.',
    themeColor: 'from-cyan-500 to-blue-600',
    accentGlow: 'rgba(6, 182, 212, 0.35)',
  },
  {
    days: 7,
    title: 'Guiding Light',
    subtitle: 'One Week of Steadfast Scripture',
    emoji: '🕯️',
    verseRef: 'Psalm 119:105',
    verseSnippet: 'Your word is a lamp for my feet, a light on my path.',
    themeColor: 'from-amber-500 to-yellow-500',
    accentGlow: 'rgba(245, 158, 11, 0.45)',
  },
  {
    days: 14,
    title: 'Shield of Faith',
    subtitle: 'Fortified by the Word of God',
    emoji: '🛡️',
    verseRef: 'Ephesians 6:16',
    verseSnippet: 'Take up the shield of faith, with which you can extinguish all flaming arrows.',
    themeColor: 'from-indigo-500 to-purple-600',
    accentGlow: 'rgba(99, 102, 241, 0.4)',
  },
  {
    days: 21,
    title: 'Fruit of the Spirit',
    subtitle: 'Transformed by Daily Devotion',
    emoji: '🌿',
    verseRef: 'Galatians 5:22',
    verseSnippet: 'The fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness.',
    themeColor: 'from-emerald-600 to-green-500',
    accentGlow: 'rgba(34, 197, 94, 0.4)',
  },
  {
    days: 30,
    title: 'Crown of Life',
    subtitle: 'One Month of Victorious Faith',
    emoji: '👑',
    verseRef: 'James 1:12',
    verseSnippet: 'Blessed is the one who perseveres under trial, having stood the test.',
    themeColor: 'from-amber-400 via-yellow-400 to-amber-600',
    accentGlow: 'rgba(251, 191, 36, 0.5)',
  },
  {
    days: 60,
    title: 'Mount Zion',
    subtitle: 'Unshakable Spiritual Foundation',
    emoji: '⛰️',
    verseRef: 'Psalm 125:1',
    verseSnippet: 'Those who trust in the Lord are like Mount Zion, which cannot be shaken.',
    themeColor: 'from-blue-600 to-indigo-800',
    accentGlow: 'rgba(37, 99, 235, 0.45)',
  },
  {
    days: 100,
    title: 'Temple Pillar',
    subtitle: 'Centurion of Daily Devotion',
    emoji: '🏛️',
    verseRef: 'Revelation 3:12',
    verseSnippet: 'The one who is victorious I will make a pillar in the temple of my God.',
    themeColor: 'from-purple-500 via-rose-500 to-amber-500',
    accentGlow: 'rgba(168, 85, 247, 0.5)',
  },
];

const STORAGE_KEY = 'bible_wallpapers_streak_data';

export const getLocalDateString = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getStreakData = (): StreakData => {
  if (typeof window === 'undefined') {
    return {
      currentStreak: 1,
      longestStreak: 1,
      lastReadDate: getLocalDateString(),
      readDates: [getLocalDateString()],
      totalVersesRead: 1,
      unlockedMilestoneDays: [1],
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // First-time user: seed with today as Day 1 so they start encouraged
      const today = getLocalDateString();
      const initial: StreakData = {
        currentStreak: 3, // Encouraging active streak habit start
        longestStreak: 3,
        lastReadDate: today,
        readDates: [
          getYesterdayDateString(2),
          getYesterdayDateString(1),
          today,
        ],
        totalVersesRead: 5,
        unlockedMilestoneDays: [1, 3],
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }

    const parsed: StreakData = JSON.parse(raw);
    return parsed;
  } catch {
    const today = getLocalDateString();
    return {
      currentStreak: 1,
      longestStreak: 1,
      lastReadDate: today,
      readDates: [today],
      totalVersesRead: 1,
      unlockedMilestoneDays: [1],
    };
  }
};

export const saveStreakData = (data: StreakData): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('Could not save streak data:', err);
  }
};

const getYesterdayDateString = (offsetDays: number = 1): string => {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  return getLocalDateString(d);
};

export interface RecordInteractionResult {
  data: StreakData;
  streakIncreased: boolean;
  newMilestone: StreakMilestone | null;
  alreadyCompletedToday: boolean;
}

export const recordScriptureInteraction = (): RecordInteractionResult => {
  const current = getStreakData();
  const today = getLocalDateString();
  const yesterday = getYesterdayDateString(1);

  let newStreak = current.currentStreak;
  let streakIncreased = false;
  let alreadyCompletedToday = false;

  const readDatesSet = new Set(current.readDates || []);

  if (current.lastReadDate === today) {
    // Already read today, just increment total interactions count
    alreadyCompletedToday = true;
  } else if (current.lastReadDate === yesterday) {
    // Read yesterday, streak continues!
    newStreak = current.currentStreak + 1;
    streakIncreased = true;
  } else if (!current.lastReadDate) {
    // First time
    newStreak = 1;
    streakIncreased = true;
  } else {
    // Streak broken by more than 1 missed day -> restart at 1
    newStreak = 1;
    streakIncreased = true;
  }

  readDatesSet.add(today);
  const newLongest = Math.max(current.longestStreak || 0, newStreak);
  const newTotal = (current.totalVersesRead || 0) + 1;

  // Check milestones
  const unlocked = new Set(current.unlockedMilestoneDays || []);
  let newlyReachedMilestone: StreakMilestone | null = null;

  for (const milestone of STREAK_MILESTONES) {
    if (newStreak >= milestone.days && !unlocked.has(milestone.days)) {
      unlocked.add(milestone.days);
      if (!newlyReachedMilestone || milestone.days > newlyReachedMilestone.days) {
        newlyReachedMilestone = milestone;
      }
    }
  }

  const updated: StreakData = {
    currentStreak: newStreak,
    longestStreak: newLongest,
    lastReadDate: today,
    readDates: Array.from(readDatesSet),
    totalVersesRead: newTotal,
    unlockedMilestoneDays: Array.from(unlocked),
  };

  saveStreakData(updated);

  return {
    data: updated,
    streakIncreased,
    newMilestone: newlyReachedMilestone,
    alreadyCompletedToday,
  };
};

export const getCurrentMilestone = (streakDays: number): StreakMilestone => {
  const achieved = STREAK_MILESTONES.filter((m) => streakDays >= m.days);
  return achieved.length > 0 ? achieved[achieved.length - 1] : STREAK_MILESTONES[0];
};

export const getNextMilestone = (streakDays: number): StreakMilestone | null => {
  return STREAK_MILESTONES.find((m) => m.days > streakDays) || null;
};

export interface DayProgress {
  dayName: string;
  dayShort: string;
  dateStr: string;
  isToday: boolean;
  isPast: boolean;
  completed: boolean;
}

export const getWeeklyStreakProgress = (readDates: string[] = []): DayProgress[] => {
  const datesSet = new Set(readDates);
  const today = new Date();
  const todayStr = getLocalDateString(today);

  // We show 7 days ending with today (or Sun-Sat week ending today)
  const result: DayProgress[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = getLocalDateString(d);
    const dayName = d.toLocaleDateString([], { weekday: 'short' });
    const dayShort = dayName.slice(0, 2);
    const isToday = dateStr === todayStr;
    const isPast = i > 0;
    const completed = datesSet.has(dateStr);

    result.push({
      dayName,
      dayShort,
      dateStr,
      isToday,
      isPast,
      completed,
    });
  }

  return result;
};
