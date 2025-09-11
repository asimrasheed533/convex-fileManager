"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useRouter } from "next/navigation";

export interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const signupMutation = useMutation(api.user.signup);
  const loginMutation = useMutation(api.user.signIn);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("whiteboard-user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await loginMutation({ email, password });
    const loggedInUser: User = {
      id: res.id as string,
      email: res.email,
      name: res.name,
    };
    setUser(loggedInUser);
    localStorage.setItem("whiteboard-user", JSON.stringify(loggedInUser));
  };

  const signup = async (name: string, email: string, password: string) => {
    await signupMutation({ name, email, password });
    await login(email, password);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("whiteboard-user");
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
