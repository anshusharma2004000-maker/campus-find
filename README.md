# CampusFind — Campus Lost and Found Portal

CampusFind is a full-stack lost-and-found portal for campus communities. It includes a responsive React frontend, Express API, MongoDB Atlas storage, JWT authentication, bcrypt password hashing, report search, optional Cloudinary image uploads, personal dashboards, and an admin dashboard.

## Requirements

- Node.js 22 LTS and npm
- MongoDB Atlas project and database user
- Cloudinary account for hosted image uploads (optional; required to upload photos)
- GitHub account and Vercel account for deployment (Vercel Services are currently in Beta)

## Project layout

```text
CampusFind/
  vercel.json
  backend/   Express API, Mongoose models, auth, reports, admin
  frontend/  React/Vite application
  render.yaml   Optional Render deployment configuration
```

## Run locally on Windows 11

1. In MongoDB Atlas, create a database user and copy the cluster connection string. Replace its username/password placeholders and URL-encode special characters in the password.
2. In VS Code, open two PowerShell terminals in the project folder.
3. In the first terminal:

   ```powershell
   cd backend
   npm ci
   Copy-Item .env.example .env
   ```

   Open `backend/.env` and set `MONGODB_URI` to your Atlas connection string and `JWT_SECRET` to a random secret at least 32 characters long. For a local-only secret, generate one with:

   ```powershell
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```

   Keep `.env` private. Set all three Cloudinary values to enable image uploads. Then start the API:

   ```powershell
   npm run dev
   ```

4. In the second terminal:

   ```powershell
   cd frontend
   npm ci
   Copy-Item .env.example .env
   npm run dev
   ```

5. Open `http://localhost:5173`. Check the API at `http://localhost:5000/api/health`; a healthy response includes `"database":"connected"`.

All newly registered users start as students. To grant admin access, first register the intended account, then use MongoDB Atlas Data Explorer on the `campusfind.users` collection to update only that account's `role` field to `admin`. Do not add a public admin-creation endpoint or put privileged credentials in the frontend.

## Deploy frontend and API together on Vercel

The root `vercel.json` declares two services in one Vercel project:

- `campusfind-api`: Express service rooted at `backend`, built with `npm ci`, publicly routed under `/api/*`.
- `frontend`: Vite service rooted at `frontend`, publicly routed for every other path. Its service-level rewrite sends client-side routes to the Vite SPA entry.

Vercel Services are currently in Beta. Connect the GitHub repository to Vercel as a project using the repository root; do not set the project root to `frontend`, because the root `vercel.json` owns both services.

Set these project environment variables in Vercel for the backend runtime:

- `MONGODB_URI`: MongoDB Atlas connection string
- `JWT_SECRET`: private random value of at least 32 characters
- `CLIENT_URL`: canonical Vercel production origin, with no path, for example `https://your-site.vercel.app`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Cloudinary values when image uploads are required

The API service remains on the same origin and receives the original `/api/...` path. The browser uses `/api` as the default API base, so it reaches the API through the public rewrite; there is no server-to-server call and no service binding is needed. Vercel's `VERCEL_URL` and `VERCEL_PROJECT_PRODUCTION_URL` are also included in the backend CORS allowlist for deployment and preview origins.

Allow Vercel's outbound connections in Atlas Network Access. Prefer restricting access to known egress addresses where your Vercel plan supports them; if a broad network rule is necessary, use a strong database-user password and least-privilege database permissions.

After deployment, verify `https://<your-vercel-domain>/api/health` returns HTTP 200 and `"database":"connected"`. To run all declared services locally through Vercel's router, use a current Vercel CLI:

```powershell
npx vercel@latest dev --local
```

On Windows, if the Vercel CLI reports `EPERM` while creating symlinks in its cache, enable Windows Developer Mode or use a terminal with symlink permissions, then retry. This local CLI limitation does not affect the frontend production build.

Keep all backend secrets in Vercel's environment settings. `VITE_API_URL` is optional; the default `/api` works for both the Vercel shared domain and the Vite development proxy.

## Upload changes to GitHub

Run these commands from the project folder after reviewing the files staged for upload:

```powershell
git status
git add .
git status
git commit -m "Prepare CampusFind for production deployment"
git push origin main
```

`.gitignore` excludes `.env` files, dependencies, build output, Vercel local settings, and log files. Never force-add an environment file or paste secrets into a commit.

## API endpoints

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create student account |
| POST | `/api/auth/login` | Public | Login and receive JWT |
| GET | `/api/auth/me` | Login | Current account |
| GET | `/api/reports` | Public | Browse/search/filter reports |
| GET | `/api/reports/:id` | Public | Report details |
| POST | `/api/reports` | Login | Create lost/found report |
| PUT | `/api/reports/:id` | Owner/admin | Edit report |
| DELETE | `/api/reports/:id` | Owner/admin | Delete report |
| PATCH | `/api/reports/:id/returned` | Owner/admin | Mark report returned |
| GET | `/api/reports/mine` | Login | Current user's reports |
| GET | `/api/admin/overview` | Admin | Platform counts |
| GET | `/api/admin/users` | Admin | List users |
| DELETE | `/api/admin/users/:id` | Admin | Remove user and their reports |

Protected API requests use `Authorization: Bearer <token>`. Report images are sent as optional `multipart/form-data` in the `image` field (JPG, PNG, or WEBP; maximum 5 MB).

## Production checks

- Confirm Vercel `/api/health` returns HTTP 200 with the database connected.
- From the deployed frontend, test account registration/login/logout, lost/found reporting, image upload (if configured), search/filtering, report editing/deletion/return status, and admin access.
- Confirm invalid credentials are rejected and no `.env` file or secret is present in the GitHub repository.
