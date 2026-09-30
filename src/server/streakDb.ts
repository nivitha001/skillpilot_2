import fs from 'fs';
import path from 'path';

export interface UserStreakRecord {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastVisitDate: string; // Format: YYYY-MM-DD
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'streaks.json');

export function getTodayIsoDate(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDaysDiff(fromDate: string, toDate: string): number {
  if (!fromDate || !toDate) return 999;
  const t1 = new Date(fromDate + 'T00:00:00Z').getTime();
  const t2 = new Date(toDate + 'T00:00:00Z').getTime();
  if (isNaN(t1) || isNaN(t2)) return 999;
  return Math.round((t2 - t1) / (1000 * 60 * 60 * 24));
}

function ensureDbFile(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const today = getTodayIsoDate();
    const initialRecords: Record<string, UserStreakRecord> = {
      'user-nivitha': {
        userId: 'user-nivitha',
        currentStreak: 1,
        longestStreak: 1,
        lastVisitDate: today,
      },
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialRecords, null, 2), 'utf8');
  }
}

export function readAllStreaks(): Record<string, UserStreakRecord> {
  ensureDbFile();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading streaks database:', err);
    return {};
  }
}

export function writeAllStreaks(data: Record<string, UserStreakRecord>): void {
  ensureDbFile();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing streaks database:', err);
  }
}

/**
 * Record a user visit according to the strict streak rules:
 * - First login / initial visit → Streak = 1, Longest = 1
 * - Same-day visit (diff === 0) → Streak unchanged, Longest unchanged
 * - Consecutive next-day visit (diff === 1) → Streak + 1, Longest = max(longest, streak)
 * - Miss 1 or more days (diff > 1) → Reset streak to 0, and since this is the visit after reset: Start again from Day 1
 */
export function recordVisit(userId: string, clientDate?: string): UserStreakRecord {
  const all = readAllStreaks();
  const today = clientDate && /^\d{4}-\d{2}-\d{2}$/.test(clientDate) ? clientDate : getTodayIsoDate();

  let record = all[userId];

  if (!record || !record.lastVisitDate) {
    // First login
    record = {
      userId,
      currentStreak: 1,
      longestStreak: 1,
      lastVisitDate: today,
    };
  } else {
    const diff = getDaysDiff(record.lastVisitDate, today);

    if (diff === 0) {
      // Multiple visits on the same day: streak should not increase again
      record.lastVisitDate = today;
    } else if (diff === 1) {
      // Consecutive next-day visit
      const updatedStreak = (record.currentStreak || 0) + 1;
      record.currentStreak = updatedStreak;
      record.longestStreak = Math.max(record.longestStreak || 0, updatedStreak);
      record.lastVisitDate = today;
    } else if (diff > 1) {
      // Missed 1 or more days:
      // Streak resets to 0, and on this new visit starts again from Day 1
      record.currentStreak = 1;
      record.longestStreak = Math.max(record.longestStreak || 0, 1);
      record.lastVisitDate = today;
    } else {
      // Client time is earlier than stored date (e.g. timezone change / clock skew)
      // Keep streak intact
    }
  }

  all[userId] = record;
  writeAllStreaks(all);
  return record;
}

/**
 * Get current user streak without recording a new visit.
 * If user missed 1 or more days, their active streak is 0 until they visit again.
 */
export function getStreak(userId: string, clientDate?: string): UserStreakRecord {
  const all = readAllStreaks();
  const today = clientDate && /^\d{4}-\d{2}-\d{2}$/.test(clientDate) ? clientDate : getTodayIsoDate();

  let record = all[userId];
  if (!record) {
    return {
      userId,
      currentStreak: 0,
      longestStreak: 0,
      lastVisitDate: '',
    };
  }

  const diff = getDaysDiff(record.lastVisitDate, today);
  if (diff > 1 && record.currentStreak > 0) {
    // Missed 1 or more days without visit -> streak is reset to 0
    record.currentStreak = 0;
    all[userId] = record;
    writeAllStreaks(all);
  }

  return record;
}

/**
 * Helper to simulate streak transitions for developer testing and verification
 */
export function simulateStreakAction(
  userId: string,
  action: 'next_day' | 'miss_day' | 'reset' | 'set',
  value?: number
): UserStreakRecord {
  const all = readAllStreaks();
  const today = getTodayIsoDate();
  let record = all[userId] || {
    userId,
    currentStreak: 1,
    longestStreak: 1,
    lastVisitDate: today,
  };

  if (action === 'next_day') {
    // Simulate previous visit was yesterday, now visiting today
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
    record.lastVisitDate = yesterdayStr;
    all[userId] = record;
    writeAllStreaks(all);
    return recordVisit(userId, today);
  } else if (action === 'miss_day') {
    // Simulate user missed yesterday (last visit 2 days ago)
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const twoDaysAgoStr = `${twoDaysAgo.getFullYear()}-${String(twoDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(twoDaysAgo.getDate()).padStart(2, '0')}`;
    record.lastVisitDate = twoDaysAgoStr;
    record.currentStreak = 0;
    all[userId] = record;
    writeAllStreaks(all);
    return record;
  } else if (action === 'reset') {
    record.currentStreak = 0;
    record.lastVisitDate = '';
    all[userId] = record;
    writeAllStreaks(all);
    return record;
  } else if (action === 'set') {
    const targetVal = typeof value === 'number' ? value : 1;
    record.currentStreak = targetVal;
    record.longestStreak = Math.max(record.longestStreak || 0, targetVal);
    record.lastVisitDate = today;
    all[userId] = record;
    writeAllStreaks(all);
    return record;
  }

  return record;
}
