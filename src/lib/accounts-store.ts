export type StoredAccount = {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Manager" | "Counsellor" | "Mentor" | "Student";
  status: "Active" | "Invited" | "Suspended";
  password: string;
  createdAt: string;
};

const ACCOUNTS_KEY = "uppseekers_accounts_v1";
export const CURRENT_USER_KEY = "uppseekers_current_user_v1";

export function loadAccounts(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    return raw ? (JSON.parse(raw) as StoredAccount[]) : [];
  } catch {
    return [];
  }
}

export function saveAccounts(xs: StoredAccount[]) {
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(xs));
  } catch {}
}

export type CurrentUser = {
  email: string;
  name: string;
  role: StoredAccount["role"] | "Admin";
  isAdmin: boolean;
};

export function loadCurrentUser(): CurrentUser | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    return raw ? (JSON.parse(raw) as CurrentUser) : null;
  } catch {
    return null;
  }
}

export function saveCurrentUser(u: CurrentUser | null) {
  try {
    if (u) localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(u));
    else localStorage.removeItem(CURRENT_USER_KEY);
  } catch {}
}