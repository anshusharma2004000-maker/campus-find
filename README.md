# CampusFind — Campus Lost and Found Portal

A complete full-stack project based on the supplied CampusFind synopsis. It includes a responsive React frontend, Express REST API, Neon-compatible PostgreSQL storage, JWT authentication, bcrypt password hashing, lost/found reports, search/filter, image upload, personal dashboard and admin moderation.

## Requirements
- Node.js 18 or later and npm
- A PostgreSQL database (Neon is recommended for deployment)
- Optional Cloudinary account for hosted item images

## Project structure
```
CampusFind/
  backend/
    src/config/       PostgreSQL and Cloudinary configuration
    src/controllers/  Authentication, reports and admin logic
    src/middleware/   JWT authorization, upload and error handling
    src/models/       User and Report database queries
    src/routes/       REST API routes
    src/server.js
  frontend/
    src/components/   Navigation, listing cards
    src/context/      Authentication state
    src/pages/        Home, auth, report, item detail, dashboard, admin
    src/services/     Axios API client
    src/main.jsx
```

## 1. Configure the backend
Open a terminal in `CampusFind/backend`:

```bash
npm install
```

Copy `.env.example` to `.env` and set `DATABASE_URL` to your PostgreSQL connection string and `JWT_SECRET` to a long random value. Set `CLIENT_URL=http://localhost:5173`. On startup, the backend creates the required tables and indexes if they do not already exist.

To enable item image uploads, add your Cloudinary cloud name, API key and API secret. Without Cloudinary, the rest of the application works; image uploads return a clear configuration error.

**Admin setup:** set `ADMIN_EMAIL` to the email address you intend to use for the administrator account before registering that account. The matching account is assigned the admin role during registration. Do not expose admin registration or credentials publicly in a real deployment; use a controlled bootstrap process.

Start the API (requires a reachable PostgreSQL database):

```bash
npm run dev
```

API health check: `http://localhost:5000/api/health`

## 2. Configure the frontend
Open a second terminal in `CampusFind/frontend`:

```bash
npm install
```

Copy `.env.example` to `.env` (or use the default API URL). Start React/Vite:

```bash
npm run dev
```

Open `http://localhost:5173`.

## Deploy with Neon, Render and Vercel

1. **Neon:** Create a PostgreSQL project and copy its pooled connection string. Keep the password private; it is only used as the backend's `DATABASE_URL`.
2. **Push this project to GitHub.**
3. **Render:** Create a Blueprint from the repository and select `render.yaml` (or create a Node web service with `backend` as its root directory, `npm install` as its build command, and `npm start` as its start command). Set `DATABASE_URL` to the Neon connection string, and set `CLIENT_URL` to the Vercel site's origin, for example `https://campusfind.vercel.app`. Set `ADMIN_EMAIL` if bootstrapping an admin account. Add Cloudinary values if hosted image uploads are needed. Render supplies `PORT`; do not set it manually.
4. **Vercel:** Import the same repository and set the project root directory to `frontend`. Use `npm run build` and `dist` if prompted. Add `VITE_API_URL` as `https://<your-render-service>.onrender.com/api`, then deploy.
5. After Vercel creates the site, update Render's `CLIENT_URL` to its exact production origin and redeploy/restart the API. For Vercel preview deployments, add the required preview origins as a comma-separated list in `CLIENT_URL`.
6. Open `https://<your-render-service>.onrender.com/api/health` to verify the API is healthy, then test registration, login and report creation from the Vercel site.

The backend uses PostgreSQL UUIDs and creates the `users` and `reports` tables on startup. Existing MongoDB data is not copied automatically; export/transform/import it before switching if you need to preserve it. Configure Neon backups and keep `DATABASE_URL`, `JWT_SECRET`, and Cloudinary credentials out of the frontend.

## 3. Main API endpoints

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create student/admin-bootstrap account |
| POST | `/api/auth/login` | Public | Login and receive JWT |
| GET | `/api/auth/me` | Login | Current account |
| GET | `/api/reports` | Public | Browse/search/filter listings |
| GET | `/api/reports/:id` | Public | Listing details and contact |
| POST | `/api/reports` | Login | Create lost/found report (multipart form) |
| PUT | `/api/reports/:id` | Owner/admin | Edit report |
| DELETE | `/api/reports/:id` | Owner/admin | Delete report |
| PATCH | `/api/reports/:id/returned` | Owner/admin | Mark as returned |
| GET | `/api/reports/mine` | Login | Current user's reports |
| GET | `/api/admin/overview` | Admin | Platform counts |
| GET | `/api/admin/users` | Admin | List users |
| DELETE | `/api/admin/users/:id` | Admin | Remove user and their reports |

For protected endpoints send `Authorization: Bearer <token>`. The report creation/update endpoints accept `multipart/form-data`; the image field is named `image` and is optional.

## Implemented features
- Student registration/login/logout with JWT and bcrypt (12 salt rounds)
- Lost and found reports with title, category, description, location, date and optional photo
- Keyword search and category/status/location filters
- Item detail pages with poster contact information
- Edit/delete own reports and mark reports as Returned
- Personal dashboard and administrator dashboard
- Admin can review/remove listings and users
- Responsive desktop/mobile UI, API rate limiting on auth routes, Helmet security headers and input/file-size limits

## Notes before deployment
- This is an academic starter implementation. Use HTTPS, secure secrets, a managed database, backups, logging and monitoring for production.
- The `ADMIN_EMAIL` bootstrap is convenient for a local demo. For a real university deployment, replace it with a verified institutional admin provisioning workflow.
- Public item details expose the contact email and optional phone number to support the contact/recovery workflow described in the synopsis. Consider in-app messaging or masked contact details if stronger privacy is required.
- Cloudinary credentials must remain in the backend `.env`, never in the frontend.
- Add institutional email verification, notification matching and mobile applications as future extensions, consistent with the synopsis.

