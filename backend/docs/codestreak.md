# Codestreak 🔥

> A platform where anyone can create a study room, invite friends, and track their learning streaks together.

---

## What is Codestreak?

Codestreak helps you and your friends stay consistent with DSA practice and learning. Create a private room, invite your friend, and track what you solved or learned every day — without losing your history.

---

## Problem Statement

- You and your friend solve DSA problems daily and text each other for accountability
- But you're **losing the history** of what you solved
- No way to **visualize progress** over time
- Texting works for motivation, but not for tracking

**Codestreak solves this** by archiving your journey while keeping the personal touch of texting.

---

## Tech Stack

| Layer        | Technology                  |
| ------------ | --------------------------- |
| Frontend     | React                       |
| Backend      | NestJS                      |
| Database     | MongoDB Atlas               |
| Auth         | Google OAuth (Clerk)        |
| Hosting      | Vercel (frontend + backend) |
| External API | Alfa-LeetCode-API           |

---

## Features (MVP)

### Core

- ✅ Google login
- ✅ Create room (auto-generated room ID)
- ✅ Join room (validate room ID)
- ✅ 2 user limit per room
- ✅ Solo tracking until friend joins
- ✅ Submit activity (manual + LeetCode sync)
- ✅ Individual streaks for each user
- ✅ See each other's daily activity
- ✅ Grace period streak protection (24 hours)
- ✅ Badges/gamification

### Activity Types

- Problem solving (LeetCode sync or manual)
- Learning new concept
- Revision
- Other (anything that counts as "doing something")

### Activity Fields

| Field       | Type   | Description                                     |
| ----------- | ------ | ----------------------------------------------- |
| type        | enum   | problem / concept / revision / other            |
| title       | string | Problem name or topic                           |
| description | string | 2-3 line summary                                |
| difficulty  | enum   | easy / medium / hard / null (only for problems) |
| status      | enum   | completed / in-progress                         |
| date        | string | YYYY-MM-DD                                      |

---

## User Flow

### First Time User

```
Open Codestreak
      ↓
Landing page (title + description + Google signup)
      ↓
Login with Google → Your JWT created (30 day expiry)
      ↓
Create Room OR Join Room
```

### Create Room

```
Click "Create Room"
      ↓
Room auto-generated with unique code (e.g., CS-X7K2)
      ↓
Share code with friend manually
      ↓
Dashboard (solo view until friend joins)
      ↓
Friend joins → Both see each other's progress
```

### Join Room

```
Click "Join Room"
      ↓
Enter room code
      ↓
Validate:
  - Invalid code → "Room not found. Check the code and try again."
  - Room full (2/2) → "This room is full. Maximum 2 members allowed."
  - Valid → Joined! Dashboard loads
```

### Returning User

```
Open Codestreak
      ↓
Check localStorage for JWT
      ↓
GET /auth/verify
      ↓
Valid → Dashboard
Invalid/Expired → Landing page
```

### Logout

```
Tap avatar → dropdown → Logout
      ↓
Clear JWT from localStorage
      ↓
Redirect to Landing page
```

---

## Auth Flow

**Google OAuth → Your own JWT**

- Google verifies identity (name, email, googleId)
- Backend creates your own JWT (30 day expiry)
- Frontend stores JWT in localStorage
- Every API request sends JWT in headers
- Google is never involved again until token expires

---

## Grace Period (Streak Protection)

### How It Works

```
Miss a day → Grace period activates (24 hours)
      ↓
Countdown timer shown on dashboard
      ↓
Log anything today → Streak saved automatically ✅
Don't log → Grace period expires → Streak resets to 0 ❌
```

### Rules

- Grace period only applies when `currentStreak > 0`
- If streak = 0, missing a day keeps it at 0 (no grace)
- Both users can see each other's ⚠️ at-risk state
- No notifications (v2.0 feature)

### States

| State      | Description                              |
| ---------- | ---------------------------------------- |
| Normal 🔥  | Streak active, everything fine           |
| At Risk ⚠️ | Missed yesterday, grace period active    |
| Saved ✅   | Logged within grace period, streak saved |
| Expired 💔 | Grace period expired, streak reset to 0  |

### Cron Jobs (Run at Midnight Daily)

1. **Mark at risk:** Find users who missed yesterday → set `streakAtRisk: true`
2. **Expire grace:** Find users where grace expired + didn't log → reset streak to 0

---

## Room Rules

| Scenario          | Behaviour                                                          |
| ----------------- | ------------------------------------------------------------------ |
| Invalid room code | "Room not found. Check the code and try again."                    |
| Room full (2/2)   | "This room is full. Maximum 2 members allowed."                    |
| Solo (1/2)        | Dashboard shows your data + prominent room code to share           |
| Both joined (2/2) | Full dashboard with both users, room code in small top-right badge |

---

## UI Screens

1. **Landing** - Logo, feature list, Google login button
2. **Create/Join Room** - Two options after first login
3. **Dashboard** - Streaks, heatmap, today's activity, motivation message
4. **Log Activity** - Type, title, summary, difficulty (problems only), status
5. **History** - All activities, User + Type dropdowns, infinite scroll, ⋮ edit/delete
6. **Achievements** - Stats card, next badge progress, earned + locked badges
7. **Avatar Dropdown** - Edit name, edit LeetCode username, restore tokens count, logout

---

## Gamification

### Badges

| Badge       | Trigger                         |
| ----------- | ------------------------------- |
| 🔥 7 Days   | currentStreak >= 7              |
| 👥 Duo      | room.members.length === 2       |
| 💻 Day One  | activities count >= 1           |
| ⚡ Linked   | leetcodeUsername exists         |
| 🌙 30 Days  | longestStreak >= 30             |
| 💯 100 Club | problem activities count >= 100 |

All badges **computed on the fly** from existing data. Not stored in DB.

### Motivation Messages

- Shown on dashboard based on streak length
- "You're on fire! 🔥" etc.

---

## Database Schema

### `users`

```json
{
  "_id": "ObjectId",
  "name": "String",
  "email": "String",
  "googleId": "String",
  "leetcodeUsername": "String | null",
  "currentStreak": "Number",
  "longestStreak": "Number",
  "lastActivityDate": "String | null (YYYY-MM-DD)",
  "streakAtRisk": "Boolean",
  "graceExpiresAt": "String | null (YYYY-MM-DD)",
  "rooms": "ObjectId[]",
  "createdAt": "String (YYYY-MM-DD)"
}
```

### `rooms`

```json
{
  "_id": "ObjectId",
  "roomCode": "String (unique)",
  "members": "ObjectId[]",
  "createdBy": "ObjectId"
}
```

### `activities`

```json
{
  "_id": "ObjectId",
  "createdBy": "ObjectId",
  "type": "String (problem | concept | revision | other)",
  "title": "String",
  "description": "String",
  "difficulty": "String (easy | medium | hard) | null",
  "status": "String (completed | in-progress)",
  "activityDate": "String (YYYY-MM-DD)",
  "createdAt": "String (YYYY-MM-DD)"
}
```

### Date Convention

- All dates stored as `String (YYYY-MM-DD)`
- Recorded using: `new Date().toISOString().split("T")[0]`
- Sortable as strings naturally

### DB Index

```javascript
Activity.index({ createdBy: 1, date: 1 });
```

---

## API Endpoints

```
AUTH
POST   /auth/google          ← Google OAuth login/signup → returns JWT
GET    /auth/verify          ← Verify JWT on app load/reload
POST   /auth/logout          ← Clear session

ROOMS
POST   /rooms                ← Create room (generates unique code)
POST   /rooms/join           ← Join room with code

DASHBOARD
GET    /dashboard            ← Streaks + today's activities for both users

ACTIVITIES
GET    /activities           ← All activities (filters + pagination)
POST   /activities           ← Log new activity
PUT    /activities/:id       ← Edit activity (own only)
DELETE /activities/:id       ← Delete activity (own only)

USERS
GET    /users/profile        ← Get current user profile
PUT    /users/profile/name      ← Update display name
PUT    /users/profile/leetcode  ← Update LeetCode username

SYNC
GET    /sync/leetcode        ← Fetch today's accepted submissions from LeetCode

STREAKS
POST   /streaks/restore      ← (Removed - replaced by grace period)
```

**Total: 13 endpoints**

---

## LeetCode Integration

**Using:** Alfa-LeetCode-API

**Endpoints used:**

```
GET /:username/acSubmission?limit=10  # Today's accepted submissions
GET /:username/profile                # Verify username exists
```

**Local Development (Docker):**

```bash
docker run -p 3000:3000 alfaarghya/alfa-leetcode-api
```

**Production:** `https://alfa-leetcode-api.onrender.com`

**Duplicate prevention:** Check if activity with same title + date + createdBy already exists before saving.

---

## Pending Decisions

- [ ] UI mockups merged into single final file
- [ ] Start building!

---

## Future (v2.0)

- [ ] Push notifications (streak at risk alerts)
- [ ] Email notifications when friend joins
- [ ] Up to 5+ users per room
- [ ] GFG, HackerRank sync
- [ ] Invite via email/link
- [ ] Admin controls for room creator
- [ ] Global leaderboard

---

_Document updated: May 30, 2026_
_Status: Design complete, ready to build_ 🚀
