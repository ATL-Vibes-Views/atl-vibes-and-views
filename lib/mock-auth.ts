export type UserRole = "admin" | "editor" | "business_owner" | "subscriber";

export interface MockUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  avatar_url?: string;
  business_id?: string;
}

export const mockAdmin: MockUser = {
  id: "mock-admin-001",
  email: "mellanda@atlvibesandviews.com",
  role: "admin",
  name: "Mellanda Reese",
};

export const mockBusinessOwner: MockUser = {
  id: "mock-owner-001",
  email: "owner@blandtownboxing.com",
  role: "business_owner",
  name: "James Wilson",
  business_id: "3db9dab0-1155-4edf-a48c-6f67b0872604", // Blandtown Boxing — active listing
};

export function getMockUser(): MockUser {
  // In development, return admin by default
  // Replace with real Supabase auth session in production
  return mockAdmin;
}

export function getMockBusinessOwner(): MockUser {
  return mockBusinessOwner;
}
