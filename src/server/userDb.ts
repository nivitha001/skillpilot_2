import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export type UserRole = 'ADMIN' | 'STUDENT';
export type UserStatus = 'active' | 'disabled';

export interface DbUser {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  last_login?: string;
  department?: string;
  batch?: string;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.includes(':')) {
    return password === storedHash;
  }
  const [salt, originalHash] = storedHash.split(':');
  const hashToVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return originalHash === hashToVerify;
}

export function isAdminEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return (
    normalized === 'nivithays2005@gmail.com' ||
    normalized === 'nivithas2005@gmail.com' ||
    normalized === 'admin@skillpilot.com'
  );
}

function ensureUsersDb(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const defaultUsers: DbUser[] = [
    {
      id: 'usr-admin-01',
      name: 'SkillPilot Admin',
      email: 'admin@skillpilot.com',
      password_hash: hashPassword('admin123'),
      role: 'ADMIN',
      status: 'active',
      created_at: '2025-11-01T00:00:00.000Z',
      department: 'Central Placement Cell',
      batch: '2026',
    },
    {
      id: 'user-nivitha',
      name: 'Nivitha Y S',
      email: 'nivithays2005@gmail.com',
      password_hash: hashPassword('student123'),
      role: 'ADMIN',
      status: 'active',
      created_at: '2026-01-15T00:00:00.000Z',
      department: 'Computer Science & Engineering',
      batch: '2026',
    },
    {
      id: 'user-nivitha-alt',
      name: 'Nivitha',
      email: 'nivithas2005@gmail.com',
      password_hash: hashPassword('student123'),
      role: 'ADMIN',
      status: 'active',
      created_at: '2026-01-15T00:00:00.000Z',
      department: 'Computer Science & Engineering',
      batch: '2026',
    },
    {
      id: 'usr-rahul-02',
      name: 'Rahul Sharma',
      email: 'rahul.s@campus.edu',
      password_hash: hashPassword('student123'),
      role: 'STUDENT',
      status: 'active',
      created_at: '2026-02-01T00:00:00.000Z',
      department: 'Information Technology',
      batch: '2026',
    },
    {
      id: 'usr-ananya-03',
      name: 'Ananya Iyer',
      email: 'ananya.iyer@campus.edu',
      password_hash: hashPassword('student123'),
      role: 'STUDENT',
      status: 'active',
      created_at: '2026-02-10T00:00:00.000Z',
      department: 'Electronics & Communication',
      batch: '2026',
    },
    {
      id: 'usr-karthik-04',
      name: 'Karthik Raja',
      email: 'karthik.r@campus.edu',
      password_hash: hashPassword('student123'),
      role: 'STUDENT',
      status: 'active',
      created_at: '2026-02-12T00:00:00.000Z',
      department: 'Computer Science & Engineering',
      batch: '2026',
    },
    {
      id: 'usr-sneha-05',
      name: 'Sneha Patel',
      email: 'sneha.p@campus.edu',
      password_hash: hashPassword('student123'),
      role: 'STUDENT',
      status: 'disabled',
      created_at: '2026-02-15T00:00:00.000Z',
      department: 'Computer Science & Engineering',
      batch: '2026',
    },
  ];

  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(defaultUsers, null, 2), 'utf8');
    return;
  }

  // If already exists, ensure role sync for nivithaYS2005@gmail.com and nivithas2005@gmail.com
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf8');
    const existing: DbUser[] = JSON.parse(raw);
    let modified = false;

    // Ensure nivithays2005@gmail.com exists
    if (!existing.some((u) => u.email.toLowerCase() === 'nivithays2005@gmail.com')) {
      existing.push({
        id: 'user-nivitha-ys',
        name: 'Nivitha Y S',
        email: 'nivithays2005@gmail.com',
        password_hash: hashPassword('student123'),
        role: 'ADMIN',
        status: 'active',
        created_at: '2026-01-15T00:00:00.000Z',
        department: 'Computer Science & Engineering',
        batch: '2026',
      });
      modified = true;
    }

    // Sync admin roles
    existing.forEach((u) => {
      const email = u.email.toLowerCase();
      if (isAdminEmail(email) && u.role !== 'ADMIN') {
        u.role = 'ADMIN';
        modified = true;
      }
      if (!u.status) {
        u.status = 'active';
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(USERS_FILE, JSON.stringify(existing, null, 2), 'utf8');
    }
  } catch (err) {
    console.error('Error synchronizing users database:', err);
  }
}

export function getAllUsers(): DbUser[] {
  ensureUsersDb();
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading users database:', err);
    return [];
  }
}

export function saveUsers(users: DbUser[]): void {
  ensureUsersDb();
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving users database:', err);
  }
}

export function findUserByEmail(email: string): DbUser | null {
  const users = getAllUsers();
  const normalized = email.trim().toLowerCase();
  return users.find((u) => u.email.toLowerCase() === normalized) || null;
}

export function findUserById(id: string): DbUser | null {
  const users = getAllUsers();
  return users.find((u) => u.id === id) || null;
}

const SESSION_SECRET = process.env.SESSION_SECRET || 'skillpilot-auth-secret-key-2026';

export function createSessionToken(user: DbUser): string {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days valid
  };
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(base64Payload)
    .digest('base64url');
  return `${base64Payload}.${signature}`;
}

export function verifySessionToken(token: string): { valid: boolean; user?: DbUser; error?: string } {
  try {
    if (!token || !token.includes('.')) {
      return { valid: false, error: 'Invalid token structure.' };
    }
    const [base64Payload, signature] = token.split('.');
    const expectedSignature = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(base64Payload)
      .digest('base64url');

    if (signature !== expectedSignature) {
      return { valid: false, error: 'Invalid authentication signature.' };
    }

    const payload = JSON.parse(Buffer.from(base64Payload, 'base64url').toString('utf8'));
    if (Date.now() > payload.exp) {
      return { valid: false, error: 'Session expired. Please log in again.' };
    }

    const user = findUserById(payload.userId);
    if (!user) {
      return { valid: false, error: 'User does not exist.' };
    }
    if (user.status === 'disabled') {
      return { valid: false, error: 'This account has been disabled by the administrator.' };
    }

    return { valid: true, user };
  } catch {
    return { valid: false, error: 'Authentication verification failed.' };
  }
}

export function authenticateUser(
  email: string,
  password: string
): { success: boolean; user?: DbUser; token?: string; error?: string } {
  const user = findUserByEmail(email);
  if (!user) {
    return { success: false, error: 'User account not found with this email.' };
  }

  if (user.status === 'disabled') {
    return { success: false, error: 'This user account has been disabled by the administrator.' };
  }

  const isValid = verifyPassword(password, user.password_hash);
  if (!isValid) {
    return { success: false, error: 'Invalid password. Please check your credentials.' };
  }

  // Update last_login
  user.last_login = new Date().toISOString();
  saveUsers(getAllUsers().map((u) => (u.id === user.id ? user : u)));

  const token = createSessionToken(user);
  return { success: true, user, token };
}

export function authenticateWithGoogle(
  email: string,
  name?: string
): { success: boolean; user?: DbUser; token?: string; error?: string } {
  const normalizedEmail = email.trim().toLowerCase();
  let user = findUserByEmail(normalizedEmail);

  if (!user) {
    const role: UserRole = isAdminEmail(normalizedEmail) ? 'ADMIN' : 'STUDENT';
    const newUser: DbUser = {
      id: `usr-g-${Date.now()}`,
      name: name || (normalizedEmail.includes('@') ? normalizedEmail.split('@')[0] : 'User'),
      email: normalizedEmail,
      password_hash: hashPassword(crypto.randomBytes(16).toString('hex')),
      role,
      status: 'active',
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString(),
    };

    const users = getAllUsers();
    users.push(newUser);
    saveUsers(users);
    user = newUser;
  } else {
    if (user.status === 'disabled') {
      return { success: false, error: 'This account has been disabled by the administrator.' };
    }
    const loggedUser = user;
    loggedUser.last_login = new Date().toISOString();
    saveUsers(getAllUsers().map((u) => (u.id === loggedUser.id ? loggedUser : u)));
    user = loggedUser;
  }

  const token = createSessionToken(user);
  return { success: true, user, token };
}

export function registerUser(
  name: string,
  email: string,
  password: string,
  department?: string,
  batch?: string
): { success: boolean; user?: DbUser; token?: string; error?: string } {
  const normalizedEmail = email.trim().toLowerCase();
  if (!name.trim()) {
    return { success: false, error: 'Full Name is required.' };
  }
  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    return { success: false, error: 'A valid email address is required.' };
  }
  if (!password || password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' };
  }

  const existing = findUserByEmail(normalizedEmail);
  if (existing) {
    return { success: false, error: 'An account with this email address already exists. Please sign in.' };
  }

  const role: UserRole = isAdminEmail(normalizedEmail) ? 'ADMIN' : 'STUDENT';
  const newUser: DbUser = {
    id: `usr-${Date.now()}`,
    name: name.trim(),
    email: normalizedEmail,
    password_hash: hashPassword(password),
    role,
    status: 'active',
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString(),
    department: department?.trim() || 'Computer Science & Engineering',
    batch: batch?.trim() || '2026',
  };

  const users = getAllUsers();
  users.push(newUser);
  saveUsers(users);

  const token = createSessionToken(newUser);
  return { success: true, user: newUser, token };
}

export function resetPassword(email: string, newPassword: string): { success: boolean; error?: string } {
  const normalizedEmail = email.trim().toLowerCase();
  const users = getAllUsers();
  const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (!user) {
    return { success: false, error: 'No account registered with this email address.' };
  }
  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: 'New password must be at least 6 characters long.' };
  }

  user.password_hash = hashPassword(newPassword);
  saveUsers(users);
  return { success: true };
}

export function toggleUserStatus(id: string): DbUser | null {
  const users = getAllUsers();
  const user = users.find((u) => u.id === id);
  if (!user) return null;

  user.status = user.status === 'active' ? 'disabled' : 'active';
  saveUsers(users);
  return user;
}

export function updateUserRole(id: string, role: UserRole): DbUser | null {
  const users = getAllUsers();
  const user = users.find((u) => u.id === id);
  if (!user) return null;

  user.role = role;
  saveUsers(users);
  return user;
}

export function deleteUser(id: string): boolean {
  const users = getAllUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return false;

  users.splice(idx, 1);
  saveUsers(users);
  return true;
}

