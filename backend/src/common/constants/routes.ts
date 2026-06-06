export const ROUTES = {
  AUTH: {
    BASE: 'auth',
    GOOGLE: 'google',
    LOGOUT: 'logout',
    VERIFY: 'verify',
  },
  USERS: {
    BASE: 'users',
    PROFILE: 'profile',
    PROFILE_NAME: 'profile/name',
    PROFILE_LEETCODE: 'profile/leetcode',
  },
  ROOMS: {
    BASE: 'rooms',
    JOIN: 'join',
  },
  ACTIVITIES: {
    BASE: 'activities',
    BY_ID: ':id',
  },
  DASHBOARD: {
    BASE: 'dashboard',
  },
  SYNC: {
    BASE: 'sync',
    LEETCODE: 'leetcode',
  },
} as const;
