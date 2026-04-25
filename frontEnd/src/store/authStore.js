import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Auth store — persisted to localStorage so the session survives a page refresh.
 *
 * Shape:
 *   token   : string | null   — raw JWT access token
 *   user    : object | null   — { _id, user_name, email, role, ... }
 */
const useAuthStore = create(
    persist(
        (set) => ({
            token: null,
            user: null,

            /** Called after a successful login response */
            setAuth: ({ token, user }) => set({ token, user }),

            /** Wipe session on logout */
            clearAuth: () => set({ token: null, user: null }),
        }),
        {
            name: "hr-auth", // localStorage key
            partialize: (state) => ({ token: state.token, user: state.user }),
        }
    )
);

export default useAuthStore;
