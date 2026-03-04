# Password Manager

## Current State

Full-stack password manager with:
- Email + password registration/login
- Dashboard for users with password entries (free: 5, premium: 50)
- Admin panel (password `fftr56#^`) with: all users table, pending premium requests, premium codes tab
- Support chatbot in both Dashboard and AdminPanel (knowledge base, quick replies, delete messages)
- Backend: `UserProfile` with `isPremium`, `premiumUntil`, `pendingPremium`; `activatePremium`, `createPremiumCode`, `redeemPremiumCode`

## Requested Changes (Diff)

### Add
1. **Bot: "сколько дней осталось до окончания Premium"** -- bot answers with remaining days based on user's `premiumUntil` field. Bot needs to receive the user's profile as a prop so it can compute days remaining.
2. **AdminPanel: Admin chat** -- a new tab "Чат" in AdminPanel where admin can type messages that appear as bot messages (admin writes instead of the bot). This is a local admin-side chat interface.
3. **Bonus system "Д"** -- when admin activates Premium for a user, that user receives 100 Д (D-currency) as a bonus. Users can spend 100 Д to buy Premium (Premium costs 100 Д). Backend: add `bonusBalance: Nat` to `UserProfile`; add `activatePremium` to award 100 Д; add `spendBonus` function to redeem 100 Д for Premium.
4. **Bot: knows about bonus "Д"** -- bot explains what Д is, how to get it, and how to use it to buy Premium.

### Modify
- `UserProfile` type: add `bonusBalance: Nat` field
- `activatePremium`: after activating, also give user 100 Д bonus
- `SupportChatBot`: accept optional `userProfile` prop to answer "сколько дней осталось"
- `AdminPanel`: add "Чат" tab with admin-side chat (admin types, messages appear as bot replies)
- `BuyPremiumModal`: add option to spend 100 Д to buy Premium (if user has enough balance)
- `Dashboard`: pass profile data to `SupportChatBot`

### Remove
- Nothing removed

## Implementation Plan

1. **Backend (main.mo)**:
   - Add `bonusBalance: Nat` to `UserProfile` type
   - Update all places that create a `UserProfile` to set `bonusBalance = 0`
   - Update `activatePremium` to also add 100 to `bonusBalance`
   - Add `spendBonus` function: checks caller has `bonusBalance >= 100`, deducts 100, activates Premium for 30 days
   - Add `getPremiumDaysRemaining` query: returns `?Nat` (days left or null if not premium)

2. **Frontend**:
   - Update `backend.d.ts` types for `UserProfile` (add `bonusBalance`)
   - Update `SupportChatBot` to accept optional `userProfile?: UserProfile` prop; add KB entry for "сколько дней осталось" that computes days from `premiumUntil`
   - Update `Dashboard` to pass `profile.data` to `SupportChatBot`
   - Add "Чат" tab to `AdminPanel`: simple chat UI where admin types a message and it appears as a bot reply
   - Update `BuyPremiumModal`: add "Потратить 100 Д" button if user has `bonusBalance >= 100`, calls `spendBonus`
   - Show `bonusBalance` in Dashboard premium status area
