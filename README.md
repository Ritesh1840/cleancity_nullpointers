CleanCity
A cleaner city starts with you.
CleanCity is a web-based civic waste-management and complaint-reporting platform. It helps citizens report local waste and sanitation issues, follow the progress of their complaints, and learn responsible waste-disposal practices. Administrators can review reports, manage users, and update complaint statuses from a dedicated dashboard.
The project is built as a responsive, static frontend using HTML, CSS, and vanilla JavaScript, with Firebase providing authentication and data storage and Cloudinary handling optional complaint-photo uploads.
Contents
Overview
Features
Technology stack
Project structure
Getting started
Firebase configuration
Cloudinary configuration
Creating an administrator account
Run locally
Deploy with GitHub Pages
Firestore data and security
Testing checklist
Limitations and notes
Overview
CleanCity provides a central place for citizens to submit reports about waste-related problems in their neighbourhood. A citizen can create an account, submit a complaint with its location and description, optionally attach a photograph, and track updates through a personal dashboard.
Administrators have separate management pages for reviewing complaints, changing their status and priority, adding remarks, and managing citizen accounts. Complaint updates are recorded in a history timeline and can generate notifications for the reporting citizen.
Features
Citizen experience
Responsive landing page with public complaint statistics.
Citizen registration and email/password login using Firebase Authentication.
Remember-me session option and password-reset flow.
Personal dashboard with complaint totals, status summaries, recent activity, and profile information.
Submit a waste-related complaint with category, location, city, PIN code, description, and optional coordinates.
Optional JPG, PNG, or WEBP photo upload through Cloudinary.
View personal complaints, open complaint details, and follow status history.
Notifications for complaint activity.
Waste-management awareness and disposal guidance.
Administrator experience
Separate, protected administrator dashboard.
Overview of complaint totals and status distribution.
Charts for complaint categories and reporting trends.
Search, filter, and review submitted complaints.
Update complaint status, priority, and administrative remarks.
Maintain a history of complaint status changes.
View and manage registered citizen accounts.
Suspend or reactivate user accounts.
Refresh aggregate statistics displayed on the public landing page.
Interface
Clean, accessible page layouts with a consistent visual style.
Responsive navigation and layouts for mobile, tablet, and desktop screens.
Form validation, feedback messages, loading states, and image previews.
Technology stack
Layer
Technology
Frontend
HTML5, CSS3, vanilla JavaScript (ES modules)
Authentication
Firebase Authentication
Database
Cloud Firestore
Complaint image hosting
Cloudinary unsigned uploads
Charts
Chart.js
Typography
Google Fonts — Inter
Hosting
GitHub Pages (or another static HTTPS host)
No frontend framework or build step is required.
Project structure
CleanCity/
├── index.html
├── awareness.html
├── login.html
├── register.html
├── report-issue.html
├── user-dashboard.html
├── my-complaints.html
├── complaint-details.html
├── admin-dashboard.html
├── admin-complaints.html
├── admin-users.html
├── css/
│   ├── style.css
│   ├── auth.css
│   ├── forms.css
│   ├── dashboard.css
│   └── admin.css
├── js/
│   ├── firebase-config.js
│   ├── cloudinary-config.js
│   ├── app.js
│   ├── auth.js
│   ├── report.js
│   ├── dashboard.js
│   ├── complaints.js
│   ├── complaint-details.js
│   ├── notifications.js
│   ├── admin.js
│   ├── admin-complaints.js
│   ├── admin-users.js
│   └── utils.js
├── firestore.rules
├── firestore.indexes.json
└── .gitignore
Getting started
Prerequisites
A modern browser.
A Firebase project.
A Cloudinary account if complaint-photo uploads are required.
A local HTTP server for development. Opening the HTML files directly with file:// is not supported because the app uses JavaScript ES modules.
1. Get the project
Clone the repository or download the project files, then open the CleanCity folder.
git clone <your-repository-url>
cd CleanCity
2. Configure Firebase
Follow the Firebase configuration steps below.
3. Configure Cloudinary
Follow the Cloudinary configuration steps if you want to enable photo uploads.
4. Publish Firestore rules and indexes
Publish the included firestore.rules in the Firebase console. Deploy or create the indexes described in firestore.indexes.json if Firestore requests them for a query.
5. Start the local server
For example, with Python:
python3 -m http.server 8000
Then open:
http://localhost:8000
If you run the server from the parent directory, open http://localhost:8000/CleanCity/ instead.
Firebase configuration
Open the Firebase Console and create or select a project.
In Build → Authentication → Sign-in method, enable Email/Password.
In Build → Firestore Database, create a database.
Open Project settings → General → Your apps and register a Web app.
Copy the Firebase web-app configuration into js/firebase-config.js, replacing the existing configuration values with those belonging to your project.
Open Firestore Database → Rules, paste the contents of firestore.rules, and publish the rules.
Add your local and deployed hostnames under Authentication → Settings → Authorized domains. For GitHub Pages, add your username.github.io domain.
The Firebase web configuration contains client-side project identifiers; it is not an authorization mechanism. Access control must be enforced by the published Firestore Security Rules.
Cloudinary configuration
Cloudinary is used to host optional complaint photographs.
Create or sign in to a Cloudinary account.
Find your Cloud name in the Cloudinary dashboard.
Under Settings → Upload, create an upload preset and set its signing mode to Unsigned.
Restrict the preset to the image formats used by the app (jpg, jpeg, png, and webp) and configure an appropriate upload-size limit.
Set the cloud name and unsigned preset name in js/cloudinary-config.js.
export const CLOUDINARY = {
  cloudName: "YOUR_CLOUD_NAME",
  uploadPreset: "YOUR_UNSIGNED_PRESET"
};
Never place your Cloudinary API secret in frontend code or commit it to a public repository. An unsigned preset is public by design, so restrict its allowed formats, size, and upload options in Cloudinary.
Creating an administrator account
Public registration creates a citizen account with the citizen role. Administrator accounts must be promoted manually by a trusted project owner:
Register an account through the website.
In Firebase Console, open Firestore Database → Data → users.
Find the document whose ID matches the account's Firebase Authentication UID.
Change its role field from citizen to admin.
Do this only for trusted administrators. The included Firestore rules prevent citizens from changing their own role. Administrator pages also check the user's role before granting access.
Run locally
After configuring Firebase and (optionally) Cloudinary, serve the project over HTTP:
python3 -m http.server 8000
Visit http://localhost:8000 when the server is started inside the project folder. Use the browser developer console to inspect configuration errors, permission errors, and any Firestore index-creation links.
Deploy with GitHub Pages
Push the project folder contents to a GitHub repository.
Open the repository's Settings → Pages.
Choose Deploy from a branch.
Select the main branch and the / (root) folder.
Save and wait for GitHub Pages to publish the site.
Add the deployed username.github.io hostname to Firebase Authentication's authorized domains.
Test registration, login, complaint submission, image upload, and administrator workflows on the deployed HTTPS URL.
You can also host the static files on another HTTPS static-hosting provider.
Firestore data and security
The application uses these Firestore collections/documents:
Collection / document
Purpose
users/{uid}
Citizen profile, role, and account status
complaints/{id}
Complaint details, ownership, status, and priority
complaintHistory/{id}
Complaint status-history entries
notifications/{id}
Citizen notifications and read state
stats/summary
Aggregate counters used on the public landing page
The included firestore.rules provides role- and ownership-based access controls. In general:
Citizens can read their own profile and complaints.
Citizens cannot assign themselves administrator privileges.
Only administrators can update complaint management fields or manage account status.
Citizens can update only their own permitted profile and notification fields.
Public aggregate statistics are readable by visitors and writable by administrators.
Complaint and history deletion is not allowed through the supplied rules.
Review and test the rules in the Firebase Emulator or a non-production Firebase project before using the application with real user data. Keep administrative access limited to trusted accounts.
Testing checklist
[ ]
Register a new citizen account and verify its users/{uid} document.
[ ]
Log in and log out; test the Remember me option.
[ ]
Test the password-reset flow.
[ ]
Submit a complaint with and without a photograph.
[ ]
Verify the complaint record in Firestore and the uploaded image in Cloudinary.
[ ]
Confirm the complaint appears in the citizen dashboard and My Complaints page.
[ ]
Open a complaint's details and verify its history.
[ ]
Promote a trusted test account to administrator.
[ ]
As an administrator, search and filter complaints, update status/priority, and add remarks.
[ ]
Confirm the citizen receives the corresponding notification and sees the updated history.
[ ]
Test that one citizen cannot view another citizen's complaint.
[ ]
Test that a citizen cannot access administrator pages.
[ ]
Test account suspension and reactivation.
[ ]
Check the layout at common mobile, tablet, and desktop widths.
[ ]
Repeat the main workflows on the deployed HTTPS site.
Limitations and notes
CleanCity is a static frontend; Firebase and Cloudinary provide its backend services.
Public landing-page statistics are read from stats/summary. The admin dashboard updates this aggregate document, so the figures may not update continuously in the background.
Photo uploads depend on a correctly configured Cloudinary unsigned upload preset.
Firestore may require composite indexes for particular queries. Use the included firestore.indexes.json and any index links shown in the Firebase console.
Do not use real personal data until Firebase Authentication, Firestore rules, Cloudinary restrictions, and administrator access have been reviewed and tested.
License
No license has been specified for this project yet. Add a LICENSE file before redistributing the project if you want to grant others explicit usage rights.
