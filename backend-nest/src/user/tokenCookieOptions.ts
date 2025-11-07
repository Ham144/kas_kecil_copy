export const refreshTokenOption = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  // Path '/' agar refresh_token bisa diakses untuk semua request
  // Meskipun kurang optimal secara security, ini diperlukan agar:
  // 1. Middleware Next.js bisa membaca refresh_token untuk check auth state
  // 2. Axios interceptor bisa mengakses refresh_token saat refresh
  // Backend tetap aman karena hanya menggunakan refresh_token di endpoint refresh-token
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const accessTokenOption = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 10 * 60 * 1000,
};
