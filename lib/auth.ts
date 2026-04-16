// 관리자 패스워드
const ADMIN_PASSWORD = 'cpdesign';

// 세션 스토리지 키
const AUTH_KEY = 'cp_design_admin_auth';

export const checkPassword = (password: string): boolean => {
  return password === ADMIN_PASSWORD;
};

export const setAdminAuth = () => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(AUTH_KEY, 'true');
  }
};

export const removeAdminAuth = () => {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(AUTH_KEY);
  }
};

export const isAuthenticated = (): boolean => {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem(AUTH_KEY) === 'true';
  }
  return false;
};
