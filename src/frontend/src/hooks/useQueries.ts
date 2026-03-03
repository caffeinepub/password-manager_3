import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PasswordEntry, UserProfile } from "../backend.d";
import { useActor } from "./useActor";

// ---- Queries ----

export function useGetEntries() {
  const { actor, isFetching } = useActor();
  return useQuery<PasswordEntry[]>({
    queryKey: ["entries"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getEntries();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMyProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["myProfile"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getMyProfile();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllUsers() {
  const { actor, isFetching } = useActor();
  return useQuery<Array<[Principal, UserProfile]>>({
    queryKey: ["allUsers"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllUsers();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPendingPremiumRequests() {
  const { actor, isFetching } = useActor();
  return useQuery<Array<[Principal, UserProfile]>>({
    queryKey: ["pendingPremium"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getPendingPremiumRequests();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

// ---- Mutations ----

export function useAddEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      url,
      username,
      password,
      notes,
    }: {
      title: string;
      url: string;
      username: string;
      password: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("Не авторизован");
      await actor.addEntry(title, url, username, password, notes);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["entries"] }),
  });
}

export function useUpdateEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      title,
      url,
      username,
      password,
      notes,
    }: {
      id: bigint;
      title: string;
      url: string;
      username: string;
      password: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("Не авторизован");
      await actor.updateEntry(id, title, url, username, password, notes);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["entries"] }),
  });
}

export function useDeleteEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Не авторизован");
      await actor.deleteEntry(id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["entries"] }),
  });
}

export function useRequestPremium() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Не авторизован");
      await actor.requestPremium();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["myProfile"] }),
  });
}

export function useActivatePremium() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error("Не авторизован");
      await actor.activatePremium(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
      queryClient.invalidateQueries({ queryKey: ["pendingPremium"] });
    },
  });
}

export function useGetPremiumCodes() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["premiumCodes"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getPremiumCodes();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreatePremiumCode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (code: string) => {
      if (!actor) throw new Error("Не авторизован");
      await actor.createPremiumCode(code);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["premiumCodes"] });
    },
  });
}

export function useRedeemPremiumCode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (code: string) => {
      if (!actor) throw new Error("Не авторизован");
      await actor.redeemPremiumCode(code);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myProfile"] });
    },
  });
}

export function useRegisterPhoneUser() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      phone,
      passwordHash,
    }: {
      phone: string;
      passwordHash: string;
    }) => {
      if (!actor) throw new Error("Нет соединения с сервером");
      return actor.registerPhoneUser(phone, passwordHash);
    },
  });
}

export function useLoginPhoneUser() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      phone,
      passwordHash,
    }: {
      phone: string;
      passwordHash: string;
    }) => {
      if (!actor) throw new Error("Нет соединения с сервером");
      return actor.loginPhoneUser(phone, passwordHash);
    },
  });
}
