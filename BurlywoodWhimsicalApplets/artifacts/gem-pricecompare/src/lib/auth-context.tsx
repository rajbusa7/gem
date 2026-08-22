import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type UserRole = 'Administrator' | 'Procurement Officer' | 'Financial Auditor' | 'Department Buyer';
export type UserStatus = 'Active' | 'Suspended' | 'Pending';

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  status: UserStatus;
  lastLogin: string;
  avatarColor: string;
  avatarInitials: string;
  password?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  targetUser: string;
  actor: string;
  details: string;
  type: 'create' | 'update' | 'status' | 'delete' | 'login';
}

const DEFAULT_USERS: User[] = [
  {
    id: 'ADM-101',
    username: 'admin',
    name: 'Rajesh Sharma',
    email: 'rajesh.sharma@gem.gov.in',
    role: 'Administrator',
    department: 'GeM Directorate / System Admin',
    status: 'Active',
    lastLogin: 'Today at 09:15 AM',
    avatarColor: 'from-amber-600 to-orange-700',
    avatarInitials: 'RS',
    password: 'admin123',
  },
  {
    id: 'BUY-204',
    username: 'riya',
    name: 'Riya Kulkarni',
    email: 'riya.kulkarni@charusat.ac.in',
    role: 'Procurement Officer',
    department: 'CHARUSAT University / IT Procurement',
    status: 'Active',
    lastLogin: 'Today at 10:42 AM',
    avatarColor: 'from-teal-600 to-emerald-700',
    avatarInitials: 'RK',
    password: 'buyer123',
  },
  {
    id: 'AUD-309',
    username: 'vikram',
    name: 'Vikram Malhotra',
    email: 'v.malhotra@cag.gov.in',
    role: 'Financial Auditor',
    department: 'CAG / Oversight & Audit Wing',
    status: 'Active',
    lastLogin: 'Yesterday at 04:30 PM',
    avatarColor: 'from-indigo-600 to-blue-700',
    avatarInitials: 'VM',
    password: 'audit123',
  },
  {
    id: 'BUY-412',
    username: 'ananya',
    name: 'Ananya Iyer',
    email: 'ananya.iyer@aiims.edu',
    role: 'Department Buyer',
    department: 'Central Lab Equipment Desk',
    status: 'Active',
    lastLogin: '2 days ago',
    avatarColor: 'from-purple-600 to-pink-700',
    avatarInitials: 'AI',
    password: 'buyer123',
  },
  {
    id: 'BUY-503',
    username: 'suresh',
    name: 'Suresh Menon',
    email: 'suresh.menon@drdo.gov.in',
    role: 'Procurement Officer',
    department: 'DRDO / Electronics Division',
    status: 'Suspended',
    lastLogin: '18 Jun 2026',
    avatarColor: 'from-slate-600 to-zinc-700',
    avatarInitials: 'SM',
    password: 'buyer123',
  },
];

const DEFAULT_LOGS: ActivityLog[] = [
  {
    id: 'log-1',
    timestamp: 'Today at 10:42 AM',
    action: 'User Login',
    targetUser: 'Riya Kulkarni (BUY-204)',
    actor: 'System',
    details: 'Successful portal login via Buyer desk',
    type: 'login',
  },
  {
    id: 'log-2',
    timestamp: 'Today at 09:15 AM',
    action: 'User Login',
    targetUser: 'Rajesh Sharma (ADM-101)',
    actor: 'System',
    details: 'Successful admin console session started',
    type: 'login',
  },
  {
    id: 'log-3',
    timestamp: 'Yesterday at 05:20 PM',
    action: 'Account Suspended',
    targetUser: 'Suresh Menon (BUY-503)',
    actor: 'Rajesh Sharma',
    details: 'Account temporarily suspended pending annual re-verification',
    type: 'status',
  },
  {
    id: 'log-4',
    timestamp: '20 Aug 2026, 02:15 PM',
    action: 'Role Updated',
    targetUser: 'Vikram Malhotra (AUD-309)',
    actor: 'Rajesh Sharma',
    details: 'Upgraded permissions to Financial Auditor with catalog analytics',
    type: 'update',
  },
  {
    id: 'log-5',
    timestamp: '18 Aug 2026, 11:30 AM',
    action: 'New User Registered',
    targetUser: 'Ananya Iyer (BUY-412)',
    actor: 'Rajesh Sharma',
    details: 'Created Department Buyer profile for Central Lab Equipment Desk',
    type: 'create',
  },
];

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  logs: ActivityLog[];
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (identifier: string, password?: string) => { success: boolean; error?: string };
  logout: () => void;
  switchUser: (userId: string) => void;
  addUser: (userData: Omit<User, 'lastLogin' | 'avatarInitials' | 'avatarColor'>) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  toggleUserStatus: (userId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_CURRENT_USER = 'gem_pricecompare_current_user';
const STORAGE_KEY_USERS = 'gem_pricecompare_users_list';
const STORAGE_KEY_LOGS = 'gem_pricecompare_activity_logs';

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getGradient(role: UserRole): string {
  switch (role) {
    case 'Administrator': return 'from-amber-600 to-orange-700';
    case 'Procurement Officer': return 'from-teal-600 to-emerald-700';
    case 'Financial Auditor': return 'from-indigo-600 to-blue-700';
    case 'Department Buyer': return 'from-purple-600 to-pink-700';
    default: return 'from-slate-600 to-zinc-700';
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_USERS);
      return stored ? JSON.parse(stored) : DEFAULT_USERS;
    } catch {
      return DEFAULT_USERS;
    }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
      if (stored) return JSON.parse(stored);
      return null;
    } catch {
      return null;
    }
  });

  const [logs, setLogs] = useState<ActivityLog[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_LOGS);
      return stored ? JSON.parse(stored) : DEFAULT_LOGS;
    } catch {
      return DEFAULT_LOGS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    } catch (e) {
      console.error(e);
    }
  }, [users]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
    } catch (e) {
      console.error(e);
    }
  }, [logs]);

  const addLog = (log: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    const newLog: ActivityLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: 'Just now',
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const login = (identifier: string, password?: string) => {
    const cleanId = identifier.trim().toLowerCase();
    const found = users.find(
      (u) =>
        u.username.toLowerCase() === cleanId ||
        u.id.toLowerCase() === cleanId ||
        u.email.toLowerCase() === cleanId
    );

    if (!found) {
      return { success: false, error: 'No account found with this User ID, Username, or Email.' };
    }

    if (found.status === 'Suspended') {
      return { success: false, error: 'This account has been suspended by the administrator.' };
    }

    if (password && found.password && found.password !== password && password !== 'demo') {
      return { success: false, error: 'Invalid password. Please check your credentials.' };
    }

    const updatedUser = {
      ...found,
      lastLogin: 'Just now',
    };

    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === found.id ? updatedUser : u)));
    addLog({
      action: 'User Login',
      targetUser: `${found.name} (${found.id})`,
      actor: 'System',
      details: `Logged in with ${found.role} session`,
      type: 'login',
    });

    return { success: true };
  };

  const logout = () => {
    if (currentUser) {
      addLog({
        action: 'User Logout',
        targetUser: `${currentUser.name} (${currentUser.id})`,
        actor: currentUser.name,
        details: 'Manual session termination',
        type: 'login',
      });
    }
    setCurrentUser(null);
  };

  const switchUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
      addLog({
        action: 'Account Switched',
        targetUser: `${target.name} (${target.id})`,
        actor: currentUser?.name || 'Administrator',
        details: `Switched active session to ${target.role}`,
        type: 'login',
      });
    }
  };

  const addUser = (userData: Omit<User, 'lastLogin' | 'avatarInitials' | 'avatarColor'>) => {
    const newUser: User = {
      ...userData,
      lastLogin: 'Never',
      avatarInitials: getInitials(userData.name),
      avatarColor: getGradient(userData.role),
      password: userData.password || 'gem123',
    };

    setUsers((prev) => [newUser, ...prev]);
    addLog({
      action: 'New User Registered',
      targetUser: `${newUser.name} (${newUser.id})`,
      actor: currentUser?.name || 'Administrator',
      details: `Created new ${newUser.role} in ${newUser.department}`,
      type: 'create',
    });
  };

  const updateUser = (userId: string, updates: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updated = {
            ...u,
            ...updates,
            avatarInitials: updates.name ? getInitials(updates.name) : u.avatarInitials,
            avatarColor: updates.role ? getGradient(updates.role) : u.avatarColor,
          };
          if (currentUser?.id === userId) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return u;
      })
    );

    const target = users.find((u) => u.id === userId);
    addLog({
      action: 'User Updated',
      targetUser: `${target?.name || userId} (${userId})`,
      actor: currentUser?.name || 'Administrator',
      details: `Updated details / permissions`,
      type: 'update',
    });
  };

  const deleteUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    if (currentUser?.id === userId) {
      const fallback = users.find((u) => u.id !== userId) || null;
      setCurrentUser(fallback);
    }
    addLog({
      action: 'User Deleted',
      targetUser: `${target?.name || userId} (${userId})`,
      actor: currentUser?.name || 'Administrator',
      details: `Account removed from directory`,
      type: 'delete',
    });
  };

  const toggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newStatus: UserStatus = u.status === 'Active' ? 'Suspended' : 'Active';
          const updated = { ...u, status: newStatus };
          if (currentUser?.id === userId) {
            setCurrentUser(updated);
          }
          addLog({
            action: newStatus === 'Active' ? 'Account Activated' : 'Account Suspended',
            targetUser: `${u.name} (${u.id})`,
            actor: currentUser?.name || 'Administrator',
            details: `Status set to ${newStatus}`,
            type: 'status',
          });
          return updated;
        }
        return u;
      })
    );
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        logs,
        isAuthenticated: !!currentUser,
        isAdmin: currentUser?.role === 'Administrator',
        login,
        logout,
        switchUser,
        addUser,
        updateUser,
        deleteUser,
        toggleUserStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
