import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      setAuth: (user, accessToken, refreshToken) => {
        // ✅ CORRECCIÓN: Guardar user en localStorage ANTES de set()
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        }

        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        // DEBUG
        console.log('✅ setAuth called');
        console.log('✅ User saved:', user);
        console.log('✅ User in localStorage:', localStorage.getItem('user'));
      },

      setUser: (user) => {
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        }
        set({ user });
      },

      updateTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken });
        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');  // ← AGREGAR
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },

      // Helpers
      hasRole: (role) => {
        const { user } = get();
        return user?.roles?.includes(role) || false;
      },

      hasAnyRole: (roles) => {
        const { user } = get();
        return roles.some((role) => user?.roles?.includes(role)) || false;
      },

      isStudent: () => {
        return get().hasRole('STUDENT');
      },

      isTeacher: () => {
        return get().hasRole('TEACHER');
      },

      isAdmin: () => {
        return get().hasAnyRole(['ADMINISTRATIVE', 'IT_ADMIN', 'DIRECTOR']);
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      // ✅ IMPORTANTE: Especificar qué campos persisten
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
