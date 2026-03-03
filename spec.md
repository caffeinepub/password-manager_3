# Password Manager

## Current State

Full-stack password manager with phone+password auth. Backend uses `Principal` as the primary key for user profiles (`userProfiles: Map<Principal, UserProfileState>`). `loginPhoneUser` tries to copy the profile to the caller's principal on each login -- but anonymous callers get a NEW principal every session, so the profile is never found on the next visit. Users see "повторите попытку" (retry error) because login throws a trap instead of returning false, and the profile migration breaks silently.

Admin panel requires Internet Identity for creating premium codes.

## Requested Changes (Diff)

### Add
- Backend: `getEntriesByPhone`, `addEntryByPhone`, `updateEntryByPhone`, `deleteEntryByPhone`, `getMyProfileByPhone`, `requestPremiumByPhone`, `redeemPremiumCodeByPhone` -- all keyed by phone number, verified by password hash
- Backend: phone-keyed user data store (`phoneProfiles: Map<Text, UserProfileState>`) so data persists regardless of which anonymous principal calls
- Backend: `loginPhoneUser` returns `Bool` (true/false) without trapping, simply checks credentials

### Modify
- Backend: `registerPhoneUser` stores profile in `phoneProfiles` map (phone as key) instead of `userProfiles` (principal as key)
- Backend: `loginPhoneUser` -- no principal remapping, just credential check returning Bool
- Backend: `getAllUsers` -- reads from `phoneProfiles` map, returns `[(Text, UserProfile)]` (phone as identifier)
- Backend: `getPendingPremiumRequests` -- reads from `phoneProfiles`
- Backend: `activatePremium` now takes `phone: Text` instead of `Principal`
- Frontend AuthScreen: show "Неверный номер или пароль" when login returns false (no catch confusion)
- Frontend Dashboard: call phone-keyed backend functions
- Frontend AdminPanel: use phone string as identifier instead of Principal

### Remove
- Backend: old `userProfiles` map and all principal-keyed data operations for phone users
- Backend: complex principal-remapping logic in `loginPhoneUser`

## Implementation Plan

1. Regenerate backend with phone-keyed data storage and all CRUD operations by phone+passwordHash
2. Update frontend to call new phone-keyed API endpoints
3. Update AdminPanel to work with `(Text, UserProfile)[]` instead of `(Principal, UserProfile)[]`
