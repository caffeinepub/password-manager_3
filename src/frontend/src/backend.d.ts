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
export interface PremiumCode {
    code: string;
    createdAt: Time;
    isUsed: boolean;
}
export interface UserProfile {
    contact?: string;
    premiumUntil?: Time;
    lastLoginAt: Time;
    isPremium: boolean;
    email?: string;
    loginCount: bigint;
    bonusBalance: bigint;
    pendingPremium: boolean;
    registeredAt: Time;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    activatePremium(user: Principal, adminPasswordInput: string): Promise<void>;
    addDefaultProfile(): Promise<void>;
    addEntry(title: string, url: string, username: string, password: string, notes: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createPremiumCode(code: string, adminPasswordInput: string): Promise<void>;
    deleteEntry(id: bigint): Promise<void>;
    getAllUsers(adminPasswordInput: string): Promise<Array<[Principal, UserProfile]>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getEmailByPrincipal(user: Principal, adminPasswordInput: string): Promise<string | null>;
    getEntries(): Promise<Array<PasswordEntry>>;
    getMyProfile(): Promise<UserProfile | null>;
    getPendingPremiumRequests(adminPasswordInput: string): Promise<Array<[Principal, UserProfile]>>;
    getPremiumCodes(adminPasswordInput: string): Promise<Array<PremiumCode>>;
    getPremiumDaysRemaining(): Promise<bigint | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    loginEmailUser(email: string, passwordHash: string): Promise<boolean>;
    redeemPremiumCode(code: string): Promise<void>;
    registerEmailUser(email: string, passwordHash: string, contact: string): Promise<boolean>;
    requestPremium(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    spendBonus(): Promise<void>;
    updateEntry(id: bigint, title: string, url: string, username: string, password: string, notes: string): Promise<void>;
    validateCode(code: string): Promise<boolean>;
}
