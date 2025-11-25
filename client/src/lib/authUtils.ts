import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "./queryClient";
import { useLocation } from "wouter";

export interface AuthUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email?: string;
  birthDate?: string;
  gender?: string;
  role: string;
}

export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*Unauthorized/.test(error.message);
}

export function useAuth() {
  const [, navigate] = useLocation();

  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/auth/user");
        if (!res.ok) {
          if (res.status === 401) {
            return null;
          }
          throw new Error("Failed to fetch user");
        }
        return res.json() as Promise<AuthUser>;
      } catch (error) {
        return null;
      }
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (userData: AuthUser) => {
      return userData;
    },
    onSuccess: (userData) => {
      queryClient.setQueryData(["/api/auth/user"], userData);
      navigate("/");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await fetch("/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/user"], null);
      navigate("/");
    },
  });

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login: (userData: AuthUser) => loginMutation.mutate(userData),
    logout: () => logoutMutation.mutate(),
  };
}
