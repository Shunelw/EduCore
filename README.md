# EduCore

EduCore is a university course registration system built for CSX4110 Backend Application Development. It provides a React web interface and an Express API for students, professors, and administrators.

The current application supports Microsoft Entra ID sign-in, EduCore-issued JWTs, role-based access control, course and section management, student enrollment, semester and user administration, Open Library textbook lookup, enrollment reports, and a protected partner verification endpoint.

> This repository is an active course project. It is not yet production-ready; see [Current status and limitations](#current-status-and-limitations).

## Technology stack

| Area | Technology |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js 22, Express 5, TypeScript |
| Database | MySQL/MariaDB |
| ORM | Prisma 7 with the MariaDB adapter |
| Authentication | Microsoft Entra ID, MSAL Node, JWT |
| Authorization | Backend JWT middleware and role-based access control |
| External API | Open Library Books API |
| Secret management | `.env` for local development; partial Azure Key Vault support for production |
| Containers | Docker Compose, Node.js, Nginx, MariaDB |

## Implemented features

### Authentication and authorization

- Microsoft Entra ID authorization-code login.
- Automatic EduCore user lookup or creation after Microsoft authentication.
- One-hour JWTs containing only the EduCore user ID, email, and role.
- Protected frontend routes and backend endpoints.
- `STUDENT`, `PROFESSOR`, and `ADMIN` role checks.
- Admin allowlist through `ADMIN_EMAILS`.
- Last-login tracking for basic activity monitoring.

New users are assigned a role as follows:

- An email listed in `ADMIN_EMAILS` becomes `ADMIN`.
- A username matching `u` followed by digits, such as `u6642001@au.edu`, becomes `STUDENT`.
- Any other accepted Microsoft account becomes `PROFESSOR`.

### Student features

- Browse and search courses by title, code, or department.
- View course, textbook, and section details.
- Register for an available section.
- Prevent duplicate active enrollment and enforce section capacity.
- View registration history and drop an active enrollment.
- Enrollment operations derive the student ID from the verified JWT, not the request body.

### Professor and administrator features

- Create and update courses.
- Look up and store textbook metadata by ISBN-10 or ISBN-13.
- Create and update course sections, schedules, professors, and capacities.
- View enrolled students for a section.
- Administrators can delete courses and sections.
- Administrators can manage semesters, assign roles, view users and recent login activity, and view enrollment reports.

### Partner API

- A protected endpoint lets a trusted partner check a student's department and whether the student has at least one active enrollment.
- Authentication uses an exact `x-api-key` match with timing-safe comparison.
- The response deliberately excludes the student's name, email, and enrollment details.

## Repository structure

```text
EduCore/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── routes/
│       ├── services/
│       └── utils/
├── frontend/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── lib/
│       └── pages/
├── .env.example
└── docker-compose.yml
```

## Prerequisites

- Node.js 22 or later
- npm
- MySQL 8 or MariaDB 11
- A Microsoft Entra ID app registration
- Docker and Docker Compose, if using the container workflow

## Microsoft Entra ID setup

In the Microsoft Entra admin center:

1. Create an app registration for EduCore in the intended university tenant.
2. Add a **Web** redirect URI:

   ```text
   http://localhost:3000/api/auth/callback
   ```

3. Create a client secret and copy its value immediately.
4. Record the tenant ID and application (client) ID.
5. Do not commit the tenant credentials or client secret.

The backend requests the standard `openid`, `profile`, and `email` scopes. The redirect URI in Entra must exactly match `AZURE_REDIRECT_URI`.

## Local development

### 1. Start the database

The simplest option is to run only the Compose database service. From the repository root:

```bash
cp .env.example .env
docker compose up -d db
```

Change every `changeme` value in `.env`. These values configure the MariaDB container and must match the backend database settings.

Alternatively, use an existing local MySQL or MariaDB server and create an empty database named `educore`.

### 2. Configure the backend

Create `backend/.env` with real local values:

```dotenv
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

DATABASE_URL=mysql://educore:REPLACE_WITH_DB_PASSWORD@localhost:3306/educore
DB_HOST=localhost
DB_NAME=educore
DB_USER=educore
DB_PASSWORD=REPLACE_WITH_DB_PASSWORD

AZURE_TENANT_ID=REPLACE_WITH_TENANT_ID
AZURE_CLIENT_ID=REPLACE_WITH_CLIENT_ID
AZURE_CLIENT_SECRET=REPLACE_WITH_CLIENT_SECRET
AZURE_REDIRECT_URI=http://localhost:3000/api/auth/callback

JWT_SECRET=REPLACE_WITH_A_LONG_RANDOM_SECRET
PARTNER_API_KEY=REPLACE_WITH_A_LONG_RANDOM_API_KEY
ADMIN_EMAILS=admin1@university.example,admin2@university.example
```

`DATABASE_URL` is required by the Prisma CLI. The application runtime uses `DB_HOST`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD` through the Prisma MariaDB adapter.

Install dependencies, generate the Prisma client, create/synchronize the schema, and create the required roles:

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run bootstrap
npm run dev
```

The backend should report:

```text
EduCore API running on port 3000
```

Verify it in another terminal:

```bash
curl http://localhost:3000/api/health
```

Expected response:

```json
{"success":true,"message":"EduCore API is running"}
```

`npm run seed` is optional. It creates placeholder users for development, but it does not provide password login; normal authentication still uses Microsoft Entra ID.

### 3. Configure and start the frontend

Create `frontend/.env`:

```dotenv
VITE_API_URL=http://localhost:3000
```

Then start Vite:

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and choose **Continue with Microsoft**.

### 4. Test each role

1. Add the intended administrator email to `ADMIN_EMAILS` before that account signs in.
2. Sign in once with each test account so EduCore creates or connects the database user.
3. Use the administrator interface to correct roles if the naming rule does not match the intended account.
4. Test student registration only after an administrator has created a semester and a professor or administrator has created a course and section.

Removing an address from `ADMIN_EMAILS` does not automatically demote an existing administrator. Change that user's role from the administrator interface if needed.

## Docker Compose

For a local full-stack container run:

1. Configure the root `.env` as described above.
2. Create `backend/.env` with the authentication and application settings. Use `NODE_ENV=development` for local Docker so the backend does not require Azure Key Vault. Compose overrides the database host and frontend URL automatically.
3. Run:

   ```bash
   docker compose up --build
   ```

4. Open [http://localhost:8080](http://localhost:8080).

The containerized backend runs `prisma db push`, creates the three required roles, and starts the API. Data is stored in the `db_data` Docker volume.

To stop the services without deleting database data:

```bash
docker compose down
```

## Production deployment with HTTPS

The production stack in `docker-compose.prod.yml` places Nginx in front of the
frontend and API, redirects HTTP to HTTPS, and uses Certbot for Let's Encrypt
certificate issuance and renewal. Only ports 80 and 443 are published; the
API and database remain on Docker's internal network.

Before the first deployment:

1. Point the domain's DNS `A`/`AAAA` records to the server and allow inbound
   TCP ports 80 and 443 through the host and cloud firewalls.
2. Copy the production environment template and replace every example value:

   ```bash
   cp .env.prod.example .env.prod
   ```

3. Configure `backend/.env` with the Azure tenant, application, and Key Vault
   settings described below. The Key Vault `db-password` value must equal
   `DB_PASSWORD` in `.env.prod`. Use URL-safe characters in the database
   password because Compose places it in `DATABASE_URL`.
4. Add this exact Web redirect URI to the Microsoft Entra app registration,
   replacing the example host with `DOMAIN` from `.env.prod`:

   ```text
   https://app.example.com/api/auth/callback
   ```

Run the first-deployment helper from the repository root:

```bash
./deploy/init-letsencrypt.sh
```

The helper builds the application, briefly creates a local bootstrap
certificate so Nginx can start, obtains the trusted certificate through the
HTTP-01 challenge, reloads Nginx, and starts automatic renewal. It is safe to
run again when a certificate already exists. For a rehearsal, set
`CERTBOT_STAGING=1`. Staging certificates are not browser-trusted. Before the
real issuance, stop the stack, change the value back to `0`, move
`deploy/certbot/conf` to `deploy/certbot/conf-staging`, and rerun the helper.
Keeping the renamed directory provides a recoverable backup while ensuring
Certbot creates a new production certificate lineage.

For later application updates, rebuild and restart the stack with:

```bash
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build
```

Inspect service health and Certbot renewal logs with:

```bash
docker compose --env-file .env.prod -f docker-compose.prod.yml ps
docker compose --env-file .env.prod -f docker-compose.prod.yml logs certbot
```

Certificate state is kept under `deploy/certbot/conf/` and database state is
kept in the `db_data` Docker volume. Both survive ordinary container restarts.
Back up both locations as part of the server backup policy.

## API overview

All JSON APIs use the `/api` prefix. Except for login, callback, health, and the partner endpoint, protected requests require:

```http
Authorization: Bearer <jwt>
```

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/health` | Public | API health check |
| `GET` | `/api/auth/login` | Public | Begin Microsoft login |
| `GET` | `/api/auth/callback` | Public | Complete Microsoft login and issue a JWT |
| `GET` | `/api/auth/me` | Authenticated | Return the current EduCore user |
| `GET` | `/api/courses` | Authenticated | List courses |
| `GET` | `/api/courses/:id` | Authenticated | Get a course |
| `GET` | `/api/courses/textbooks/lookup?isbn=...` | Professor, Admin | Preview Open Library metadata |
| `POST` | `/api/courses` | Professor, Admin | Create a course |
| `PUT` | `/api/courses/:id` | Professor, Admin | Update a course |
| `DELETE` | `/api/courses/:id` | Admin | Delete a course |
| `GET` | `/api/sections` | Authenticated | List sections |
| `GET` | `/api/sections/:id` | Authenticated | Get a section and active enrollments |
| `POST` | `/api/sections` | Professor, Admin | Create a section |
| `PUT` | `/api/sections/:id` | Professor, Admin | Update a section |
| `DELETE` | `/api/sections/:id` | Admin | Delete a section |
| `POST` | `/api/enrollments` | Student | Register the current student using `{ "sectionId": 1 }` |
| `GET` | `/api/enrollments/me` | Student | View the current student's history |
| `DELETE` | `/api/enrollments/:id` | Student owner | Drop an enrollment |
| `GET` | `/api/semesters` | Authenticated | List semesters |
| `GET` | `/api/semesters/:id` | Authenticated | Get a semester |
| `POST` | `/api/semesters` | Admin | Create a semester |
| `PUT` | `/api/semesters/:id` | Admin | Update a semester |
| `DELETE` | `/api/semesters/:id` | Admin | Delete a semester |
| `GET` | `/api/admin/users` | Admin | List users by recent activity |
| `GET` | `/api/admin/users/:id` | Admin | Get one user |
| `PUT` | `/api/admin/users/:id/role` | Admin | Assign a role using `{ "roleName": "STUDENT" }` |
| `GET` | `/api/admin/reports/enrollments` | Admin | View enrollment records |
| `GET` | `/api/partner/verify-student?email=...` | Partner API key | Verify department and active enrollment |

Example partner request:

```bash
curl -H "x-api-key: REPLACE_WITH_PARTNER_API_KEY" \
  "http://localhost:3000/api/partner/verify-student?email=student@university.example"
```

Example successful response:

```json
{
  "success": true,
  "data": {
    "department": "Computer Science",
    "departmentConfigured": true,
    "isEnrolled": true
  }
}
```

## Open Library integration

When a professor or administrator creates or updates a course with a valid ISBN, the backend queries the Open Library Search API and stores available title, author, publication, cover, and edition data in `Course.textbookInfo`.

ISBN checksums are validated before lookup. An Open Library outage does not prevent course creation or update; the course is saved without new textbook metadata.

## Azure Key Vault support

When `NODE_ENV=production`, startup loads these secrets from the configured vault:

| Key Vault secret | Runtime variable |
| --- | --- |
| `jwt-secret` | `JWT_SECRET` |
| `db-password` | `DB_PASSWORD` |
| `partner-api-key` | `PARTNER_API_KEY` |

The production environment must also supply `AZURE_KEY_VAULT_URL`, `AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, and `AZURE_CLIENT_SECRET` so the application can authenticate to the vault. Never place real secrets in this README, a Docker image, or Git.

## Testing and verification

Run the backend build and test suite:

```bash
cd backend
npm test
```

The current suite contains 8 unit tests covering ISBN handling, Open Library response mapping, partner email parsing, and API-key comparison.

Build the frontend:

```bash
cd frontend
npm run build
```

At the time this README was updated, both production builds succeeded and all 8 backend tests passed. There are not yet automated database, API integration, authentication, RBAC, or browser tests.

## Current status and limitations

Implemented:

- Microsoft login, user creation, JWT authentication, and RBAC.
- Student, professor, and administrator web interfaces.
- Course, section, enrollment, semester, user-role, and enrollment-report APIs.
- Open Library lookup and the protected EduCore partner endpoint.
- Local Docker Compose configuration and initial Azure Key Vault loading.

Still required or incomplete:

- Professor ownership is filtered in the current UI, but the backend does not yet verify ownership when a professor updates a course or creates/updates a section. This must be fixed before production use.
- The professor section page currently displays a delete control, while the API correctly restricts section deletion to administrators.
- A dropped enrollment cannot currently be reactivated because the database has a unique `(studentId, sectionId)` record and registration always attempts to create a new row.
- Capacity checking and enrollment creation are not wrapped in a transaction, so simultaneous registrations can race.
- Input validation and API error detail are limited in several controllers.
- The JWT is returned in the callback query string and stored in browser local storage. A production security review should consider a short-lived handoff and secure, HTTP-only cookies.
- Prisma migration files are not present in the current working tree. Local and container setup therefore uses `prisma db push`; formal migrations should be restored or created before production deployment.
- HelpDesk API consumption is not implemented.
- Final production validation on the target VM is still required; DNS,
  firewall rules, Microsoft Entra configuration, and Azure Key Vault access
  depend on the deployment environment.

## Security notes

- Never commit `.env`, client secrets, JWT secrets, database passwords, or partner API keys.
- Treat frontend role checks as navigation convenience only. All sensitive authorization must remain enforced by the Express API.
- Student enrollment identity comes from the verified JWT; clients cannot choose another `studentId`.
- Rotate any credential that has ever been committed or shared publicly.
- Use long, independent random values for `JWT_SECRET`, database passwords, and `PARTNER_API_KEY`.

## Suggested next work

Before deployment, complete backend professor ownership checks and automated authentication/RBAC integration tests. Then continue with the project roadmap: HelpDesk API integration, production Key Vault configuration, Docker validation, Azure Linux VM deployment, conflict-safe Nginx routing, and Let's Encrypt HTTPS.
