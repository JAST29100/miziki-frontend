
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

import { userService } from "@/services/user.service";
import type {
  CreateUserDTO,
  UpdateUserDTO,
  User,
} from "@/types/user";

const STORAGE_KEY = "miziki.activeUserId";

interface ActiveUserContextValue {
  users: User[];
  activeUser: User | null;
  isLoading: boolean;
  error: string | null;
  selectUser: (userId: string) => void;
  logout: () => void;
  createActiveUser: (
    data: Omit<CreateUserDTO, "creadoEn">,
  ) => Promise<User>;
  updateActiveUser: (data: UpdateUserDTO) => Promise<User>;
  reloadUsers: () => Promise<void>;
}

const ActiveUserContext =
  createContext<ActiveUserContextValue | undefined>(undefined);

interface ActiveUserProviderProps {
  children: ReactNode;
}

export function ActiveUserProvider({
  children,
}: ActiveUserProviderProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reloadUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const fetchedUsers = await userService.getAll();

      setUsers(fetchedUsers);

      const savedUserId = localStorage.getItem(STORAGE_KEY);
      const savedUserExists = fetchedUsers.some(
        (user) => user.id === savedUserId,
      );

      const selectedUser = savedUserExists ? savedUserId : null;

      setActiveUserId(selectedUser);

      if (!selectedUser) {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los usuarios.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reloadUsers();
  }, [reloadUsers]);

  const selectUser = useCallback(
    (userId: string) => {
      const userExists = users.some((user) => user.id === userId);

      if (!userExists) {
        return;
      }

      setActiveUserId(userId);
      localStorage.setItem(STORAGE_KEY, userId);
      setError(null);
    },
    [users],
  );

  const logout = useCallback(() => {
    setActiveUserId(null);
    localStorage.removeItem(STORAGE_KEY);
    setError(null);
  }, []);

  const createActiveUser = useCallback(
    async (data: Omit<CreateUserDTO, "creadoEn">) => {
      setError(null);

      try {
        const createdUser = await userService.create({
          ...data,
          creadoEn: new Date().toISOString(),
        });

        setUsers((previous) => [
          ...previous.filter((user) => user.id !== createdUser.id),
          createdUser,
        ]);

        setActiveUserId(createdUser.id);
        localStorage.setItem(STORAGE_KEY, createdUser.id);

        return createdUser;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "No se pudo crear el usuario.";

        setError(message);
        throw err;
      }
    },
    [],
  );

  const updateActiveUser = useCallback(
    async (data: UpdateUserDTO) => {
      if (!activeUserId) {
        throw new Error("No hay un usuario activo seleccionado.");
      }

      setError(null);

      try {
        const updatedUser = await userService.update(
          activeUserId,
          data,
        );

        setUsers((previous) =>
          previous.map((user) =>
            user.id === updatedUser.id ? updatedUser : user,
          ),
        );

        return updatedUser;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "No se pudo actualizar el usuario.";

        setError(message);
        throw err;
      }
    },
    [activeUserId],
  );

  const activeUser = useMemo(
    () =>
      users.find((user) => user.id === activeUserId) ?? null,
    [users, activeUserId],
  );

  const value = useMemo(
    () => ({
      users,
      activeUser,
      isLoading,
      error,
      selectUser,
      logout,
      createActiveUser,
      updateActiveUser,
      reloadUsers,
    }),
    [
      users,
      activeUser,
      isLoading,
      error,
      selectUser,
      logout,
      createActiveUser,
      updateActiveUser,
      reloadUsers,
    ],
  );

  return (
    <ActiveUserContext.Provider value={value}>
      {children}
    </ActiveUserContext.Provider>
  );
}

export function useActiveUser() {
  const context = useContext(ActiveUserContext);

  if (!context) {
    throw new Error(
      "useActiveUser debe utilizarse dentro de ActiveUserProvider.",
    );
  }

  return context;
}
