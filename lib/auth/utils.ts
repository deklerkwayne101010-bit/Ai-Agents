import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function getSession() {
  const session = await auth();
  return session;
}

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user) {
    return null;
  }
  return session.user;
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }
  return session;
}

export function hasRole(user: { role: string } | null, role: 'admin' | 'agent'): boolean {
  return user?.role === role;
}

export function isAdmin(user: { role: string } | null): boolean {
  return hasRole(user, 'admin');
}

export function isAgent(user: { role: string } | null): boolean {
  return hasRole(user, 'agent');
}