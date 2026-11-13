# CampusFind — Campus Lost and Found Portal

CampusFind is a full-stack lost-and-found portal for campus communities. It includes a responsive React frontend, Express API, MongoDB Atlas storage, JWT authentication, bcrypt password hashing, report search, optional Cloudinary image uploads, personal dashboards, and an admin dashboard.

## Requirements

- Node.js 22 LTS and npm
- MongoDB Atlas project and database user
- Cloudinary account for hosted image uploads (optional; required to upload photos)
- GitHub account, plus Vercel and Render accounts for deployment

## Project layout

```text
CampusFind/
  backend/   Express API, Mongoose models, auth, reports, admin
  frontend/  React/Vite application
  render.yaml
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

## Deploy the backend to Render

1. Push the project to GitHub and connect that repository to Render using the included `render.yaml` Blueprint.
2. In the Render service's Environment settings, set:
   - `MONGODB_URI`: your Atlas connection string (backend only)
   - `JWT_SECRET`: a private random value of at least 32 characters
   - `CLIENT_URL`: the exact Vercel site origin, with no path (for example `https://your-site.vercel.app`)
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`: values from Cloudinary if image uploads are needed
3. In Atlas Network Access, allow connections from Render. Restrict this to Render's outbound IPs where available; if using a provider plan with dynamic outbound IPs, use an appropriate network rule and a strong database-user password.
4. Deploy and wait for Render's health check. Your API URL will look like `https://<service-name>.onrender.com`; verify `https://<service-name>.onrender.com/api/health` returns HTTP 200 and `"database":"connected"`.

Render uses `npm ci`, `npm start`, and its assigned `PORT`. Do not expose backend environment values in Vercel or commit them to GitHub.

## Deploy the frontend to Vercel

1. Import the same GitHub repository into Vercel and set the project Root Directory to `frontend`.
2. Use `npm run build` as the build command and `dist` as the output directory.
3. In Vercel Project Settings → Environment Variables, set `VITE_API_URL` to `https://<service-name>.onrender.com/api`.
4. Deploy. Copy the resulting Vercel origin into the Render `CLIENT_URL` setting, then redeploy/restart the backend. The Vercel SPA rewrite is configured in `frontend/vercel.json`.
5. Check the frontend and API in a browser. Do not share deployment links until both services are deployed and verified.

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

- Confirm Render `/api/health` returns HTTP 200 with the database connected.
- From the deployed frontend, test account registration/login/logout, lost/found reporting, image upload (if configured), search/filtering, report editing/deletion/return status, and admin access.
- Confirm invalid credentials are rejected and no `.env` file or secret is present in the GitHub repository.
