# Password Manager

## Current State
Full-stack password manager with:
- Email + password registration/login (stored in backend, no Internet Identity for regular users)
- Admin panel accessible via password "fftr56#^"
- Premium system (free: 5 entries, premium: 50 entries, 30 days)
- One-time premium codes
- Support chatbot
- Admin panel shows all users, pending premium requests, premium codes

## Requested Changes (Diff)

### Add
- Admin functions (getAllUsers, getPendingPremiumRequests, activatePremium, createPremiumCode, getPremiumCodes) accept an `adminPassword: Text` parameter for authentication instead of requiring Internet Identity / AccessControl role
- Any caller can use admin functions if they provide the correct admin password "fftr56#^"

### Modify
- `getAllUsers(adminPassword: Text)` -- returns all users if password matches
- `getPendingPremiumRequests(adminPassword: Text)` -- returns pending requests if password matches
- `activatePremium(user: Principal, adminPassword: Text)` -- activates premium if password matches
- `createPremiumCode(code: Text, adminPassword: Text)` -- creates code if password matches
- `getPremiumCodes(adminPassword: Text)` -- returns codes if password matches
- Remove AccessControl/MixinAuthorization dependency from admin checks (keep the import but don't use it for admin gate)

### Remove
- Internet Identity requirement for admin operations

## Implementation Plan
1. Regenerate backend with adminPassword parameter on all admin functions
2. Update frontend AdminPanel to pass admin password (stored in localStorage after admin login) to all admin API calls
3. Update useQueries hooks to pass adminPassword to admin mutations/queries
4. Remove II auth gate from AdminPanel UI -- show all content once admin password is entered
