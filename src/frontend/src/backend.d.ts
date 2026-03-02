import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface PasswordEntry {
    id: bigint;
    url: string;
    title: string;
    username: string;
    password: string;
    createdAt: Time;
    notes: string;
}
export type Time = bigint;
export interface UserProfile {
    premiumUntil?: Time;
    isPremium: boolean;
    pendingPremium: boolean;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    activatePremium(user: Principal): Promise<void>;
    addEntry(title: string, url: string, username: string, password: string, notes: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteEntry(id: bigint): Promise<void>;
    getAllUsers(): Promise<Array<[Principal, UserProfile]>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getEntries(): Promise<Array<PasswordEntry>>;
    getMyProfile(): Promise<UserProfile>;
    getPendingPremiumRequests(): Promise<Array<[Principal, UserProfile]>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    requestPremium(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateEntry(id: bigint, title: string, url: string, username: string, password: string, notes: string): Promise<void>;
}
