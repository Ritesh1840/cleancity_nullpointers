<div align="center">

# 🌿 CleanCity

**Report waste problems. Track the fix. Build a cleaner neighbourhood.**

A civic complaint platform where citizens report garbage, dumping and littering issues, and administrators review, prioritise and resolve them, with every status change tracked and notified in real time.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES%20Modules-F7DF1E?logo=javascript&logoColor=black)
![Firebase](https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore-FFCA28?logo=firebase&logoColor=black)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Image%20Uploads-3448C5?logo=cloudinary&logoColor=white)
![Chart.js](https://img.shields.io/badge/Chart.js-4.4-FF6384?logo=chartdotjs&logoColor=white)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Complaint Lifecycle](#complaint-lifecycle)
- [Getting Started](#getting-started)
- [Security Model](#security-model)
- [Data Model](#data-model)
- [Deployment](#deployment)
- [Testing Checklist](#testing-checklist)
- [Roadmap](#roadmap)

---

## Overview

Waste problems linger because nobody sees them, and citizens rarely hear back after reporting one. **CleanCity** gives both sides a single place to work:

- **Citizens** file a complaint with a photo and location, then follow it from *Submitted* to *Resolved*.
- **Administrators** triage every report, set priority, leave remarks, and resolve or reject, while the public landing page shows live impact figures.

It is a fully static front end (no build step, no server to maintain), powered by Firebase and Cloudinary.

## Features

### For citizens
- 🔐 **Secure sign-up and login** with email and password, email verification, password reset and a "Remember me" option
- 📝 **Report an issue** with title, category, description, address, city, 6-digit PIN code and optional GPS coordinates
- 📷 **Photo upload** (JPG, PNG or WEBP, up to 5 MB) with drag-and-drop, preview and progress bar
- 📊 **Personal dashboard** and a searchable, filterable **My Complaints** list
- 🕒 **Complaint details** page with a status timeline and full history
- 🔔 **Live notifications** whenever an administrator updates a complaint
- ♻️ **Waste guide**: wet and dry waste, reducing plastic, recycling and e-waste disposal

### For administrators
- 📈 **Overview dashboard** with KPI tiles and Chart.js charts (status split, category breakdown, 30-day trend)
- 🗂️ **Complaint management**: search, filter, paginate, change status and priority, add remarks, resolve or reject
- 👥 **User management**: search, view profiles, suspend or reactivate accounts
- 🧾 **Audit trail**: every status change writes a history entry and a citizen notification
- 🌍 **Public statistics** (total, resolved, pending, areas covered) kept in sync with the landing page

### Quality
- Responsive layout tested from 320 px to 1366 px
- Accessible patterns: ARIA live toasts, keyboard-operable upload zone, semantic markup
- Duplicate-submission protection: one complaint ID per page load
- All user content is HTML-escaped before rendering

## Tech Stack

| Layer | Technology |
|---|---|
| Front end | HTML5, CSS3, vanilla JavaScript (ES modules) |
| Authentication | Firebase Authentication (Email/Password) |
| Database | Cloud Firestore with server-enforced security rules |
| Image storage | Cloudinary (unsigned, restricted upload preset) |
| Charts | Chart.js 4.4 |
| Typography | Inter (Google Fonts) |
| Hosting | GitHub Pages (any static host works) |

## Project Structure

```
CleanCity/
├── index.html                 # Landing page with live statistics
├── awareness.html             # Waste handling guide
├── login.html / register.html # Authentication
├── user-dashboard.html        # Citizen overview
├── report-issue.html          # Complaint form with photo upload
├── my-complaints.html         # Citizen complaint list
├── complaint-details.html     # Single complaint, timeline and history
├── admin-dashboard.html       # Admin overview and charts
├── admin-complaints.html      # Admin complaint management
├── admin-users.html           # Admin user management
├── css/
│   ├── style.css              # Global styles and landing page
│   ├── auth.css               # Login and register
│   ├── dashboard.css          # Citizen dashboard
│   ├── forms.css              # Report form
│   └── admin.css              # Admin console
├── js/
│   ├── firebase-config.js     # Firebase initialisation
│   ├── cloudinary-config.js   # Cloudinary cloud name and preset
│   ├── auth.js                # Auth flows and route guards (requireAuth)
│   ├── app.js                 # Navigation and landing statistics
│   ├── report.js              # Complaint submission and upload
│   ├── complaints.js          # Shared lists, categories, statuses
│   ├── complaint-details.js   # Details, timeline, history
│   ├── dashboard.js           # Citizen dashboard logic
│   ├── notifications.js       # Real-time notifications
│   ├── admin.js               # Admin shell, KPIs, charts, summary sync
│   ├── admin-complaints.js    # Admin complaint workflow
│   ├── admin-users.js         # Admin user actions
│   └── utils.js               # Toasts, loading state, escaping, dates
├── firestore.rules            # Security rules
└── firestore.indexes.json     # Composite indexes
```

## Complaint Lifecycle

```
Submitted ──► Under Review ──► In Progress ──► Resolved
                   │
                   └──────────────────────────► Rejected
```

**Categories:** Overflowing Garbage Bin · Plastic Waste · Roadside Littering · Illegal Dumping · E-Waste · Construction Waste · Other

Each transition records a history entry and notifies the citizen who filed the complaint.

## Getting Started

### Prerequisites
- A free [Firebase](https://console.firebase.google.com) account
- A free [Cloudinary](https://cloudinary.com) account
- Any static file server (for example Python 3)

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/CleanCity.git
cd CleanCity
```

### 2. Configure Firebase

1. Create a project in the Firebase console.
2. **Authentication → Get started** and enable **Email/Password**.
3. **Firestore Database → Create database** (production mode).
4. **Project settings → Your apps → Web app (`</>`)**, then copy the config object into `js/firebase-config.js`.
5. **Firestore → Rules**: paste the contents of `firestore.rules` and **Publish**.
6. Create the indexes from `firestore.indexes.json`, or follow the link Firestore prints in the browser console the first time a query needs one.
7. **Authentication → Settings → Authorised domains**: add `<your-username>.github.io` for deployment.

### 3. Configure Cloudinary

1. Copy your **Cloud name** from the Cloudinary dashboard.
2. **Settings → Upload → Upload presets → Add preset** and set **Signing mode: Unsigned**.
3. Restrict the preset: allowed formats `jpg, jpeg, png, webp`, a maximum file size, and a folder such as `cleancity`.
4. Set both values in `js/cloudinary-config.js`:

```js
export const CLOUDINARY = {
  cloudName: "your-cloud-name",
  uploadPreset: "your-unsigned-preset"
};
```

> ⚠️ Never put your Cloudinary **API secret** in this project.

### 4. Create an admin account

Admins cannot be created from the website, by design.

1. Register a normal account through `register.html`.
2. In the Firestore console, open `users/{that-user's-uid}`.
3. Change the `role` field from `citizen` to `admin`.

The security rules prevent citizens from editing this field themselves.

### 5. Run locally

ES modules require `http(s)`, so opening the HTML files directly will not work. Start a local server:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Security Model

Security is enforced on the server by `firestore.rules`, not by hiding buttons in the UI.

| Collection | Citizen | Admin |
|---|---|---|
| `users` | Read own profile; update own `fullName` only | Read all; update `accountStatus` only |
| `complaints` | Create own (forced to `Submitted`, `Normal` priority); read own | Read and update all |
| `complaintHistory` | Read own; create initial entry | Read all; create entries |
| `notifications` | Read own; mark own as read | Create |
| `stats/summary` | Public read | Write |

Additional safeguards:
- Roles live in Firestore and are never trusted from client storage.
- Registration forces `role: citizen` and `accountStatus: active`.
- Complaints and users can never be deleted from the client.
- Suspended users are signed out and blocked from logging in.
- Firebase web config values are public identifiers; access is controlled by the rules above.

## Data Model

| Collection | Key fields |
|---|---|
| `users/{uid}` | `uid`, `fullName`, `email`, `role`, `accountStatus`, `createdAt` |
| `complaints/{CC-XXXX}` | `complaintId`, `userId`, `userName`, `title`, `description`, `category`, `location`, `city`, `pinCode`, `imageUrl`, `latitude`, `longitude`, `status`, `priority`, `adminRemarks`, `createdAt`, `updatedAt` |
| `complaintHistory/{auto}` | `complaintId`, `userId`, `status`, `note`, `createdAt` |
| `notifications/{auto}` | `userId`, `complaintId`, `type`, `message`, `read`, `createdAt` |
| `stats/summary` | `total`, `resolved`, `pending`, `areas`, `updatedAt` |

## Deployment

1. Push the project to a GitHub repository.
2. Go to **Settings → Pages → Deploy from branch**, choose `main` and folder `/ (root)`.
3. Add the Pages domain to Firebase **Authorised domains** (step 7 above).
4. Test the live URL, not just localhost.

## Testing Checklist

1. Register a citizen and confirm `users/{uid}` has `role: citizen`.
2. Log in and out, with Remember me on and off.
3. Submit a complaint with a photo; check the image URL in Firestore and the file in Cloudinary.
4. Confirm it appears on the dashboard and in My Complaints, and open its details.
5. Promote an account to admin, then change a complaint's status and add a remark.
6. As the citizen, confirm the status, timeline, history and notification update live.
7. As a second citizen, open the first one's `complaint-details.html?id=...`; it must show "not found".
8. As a citizen, open `admin-dashboard.html`; you must be redirected.
9. Check every page at 320, 375, 768 and 1366 px.
10. Repeat steps 1 to 4 on the deployed GitHub Pages URL.

## Roadmap

- [ ] Cloud Functions to keep public statistics fresh without an admin visit
- [ ] Server-side pagination beyond the current 1,000-complaint admin load
- [ ] Map view of complaints using the captured coordinates
- [ ] Email or push notifications for status changes
- [ ] Assignment of complaints to field teams

## Notes

- Landing-page figures read `stats/summary`, which is written by the admin dashboard. They show "–" until an admin has visited, and are only as fresh as the last admin visit.
- Admin pages load up to 1,000 of the newest complaints, which is plenty for a demo or a single locality.

---

<div align="center">

Made with 💚 for cleaner streets.

</div>

