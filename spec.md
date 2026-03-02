# Password Manager

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Password manager app with user accounts (saved credentials: site, login, password)
- Password generator (random strong passwords)
- Two tiers: Free (max 5 accounts) and Premium (max 50 accounts, 30-day subscription)
- Admin panel accessible via secret password "fftr56#^" (hardcoded, shown as link at the bottom of the login screen)
- Admin can view all users, manually activate Premium for any user (30 days from today)
- Premium purchase flow: user clicks "Buy Premium", sees card number 5413525250607278 and instructions to transfer payment, then waits for admin to activate
- Each user has a principal-based identity (Internet Identity or anonymous with local storage key)
- Users can create, view, edit, delete their saved password entries

### Modify
- Nothing (new project)

### Remove
- Nothing (new project)

## Implementation Plan

Backend (Motoko):
1. Data types: User record (principal, isPremium, premiumUntil), PasswordEntry (id, title, url, username, encryptedPassword, notes, createdAt)
2. Methods:
   - `getMyProfile()` -> returns current user's profile (creates on first call)
   - `getMyEntries()` -> returns list of password entries for caller
   - `addEntry(title, url, username, password, notes)` -> adds entry, checks limit (5 for free, 50 for premium)
   - `updateEntry(id, ...)` -> updates entry if owned by caller
   - `deleteEntry(id)` -> deletes entry if owned by caller
   - `requestPremium()` -> marks user as "pending premium" (for tracking)
   - `adminActivatePremium(principal)` -> admin-only: sets isPremium=true, premiumUntil = now + 30 days
   - `adminGetAllUsers()` -> admin-only: returns all users
   - `adminGetPendingPremium()` -> admin-only: returns users who requested premium
   - Admin identity: hardcoded admin password checked on frontend only; admin functions protected by a separate admin principal or checked via a hardcoded admin flag

Frontend:
1. Auth screen with Internet Identity login + "Login as Admin" button at the bottom
2. Admin login modal: asks for password "fftr56#^", stores admin session in localStorage
3. Admin panel: list of users, pending premium requests, button to activate premium per user
4. Main dashboard: list of saved password entries, add/edit/delete
5. Password generator: modal with options (length, symbols), copy to clipboard
6. Premium banner: shows current status, "Buy Premium" button
7. Buy Premium modal: shows card number, instructions, confirms request sent
