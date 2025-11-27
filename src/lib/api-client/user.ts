/**
 * User API Client
 *
 * Client for user profile operations.
 */

import { apiGet, apiPatch } from "./fetch";

/**
 * User profile data
 */
export interface UserProfile {
  id: string;
  email: string;
  username?: string;
  name?: string;
  avatarUrl?: string;
  bio?: string;
  isPublicProfile: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Update profile input
 */
export interface UpdateProfileInput {
  username?: string;
  name?: string;
  bio?: string;
  isPublicProfile?: boolean;
}

/**
 * Public profile response
 */
export interface PublicProfileResponse {
  data: {
    username: string;
    name?: string;
    avatarUrl?: string;
    bio?: string;
    bookmarkCount: number;
    joinedAt: string;
  };
}

/**
 * User API client
 */
export const userApi = {
  /**
   * Get current user profile
   */
  profile(): Promise<{ data: UserProfile }> {
    return apiGet<{ data: UserProfile }>("/user/profile");
  },

  /**
   * Update current user profile
   */
  updateProfile(input: UpdateProfileInput): Promise<{ data: UserProfile }> {
    return apiPatch<{ data: UserProfile }>("/user/profile", input);
  },

  /**
   * Get public profile by username
   */
  getPublicProfile(username: string): Promise<PublicProfileResponse> {
    return apiGet<PublicProfileResponse>(`/public/users/${username}`);
  },
};
