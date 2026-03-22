// src/utils/getCurrentUser.js
export function getCurrentUser() {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    return user || null;
  } catch {
    return null;
  }
}
