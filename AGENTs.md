EduCore — Master AI Project Instructions
 
1. PROJECT INFORMATION
 
Project name: EduCore — University Course Registration Backend
 
Course: CSX4110 Backend Application Development
 
EduCore is a web-based university course registration system.
 
The system allows:
 
* Professors to manage courses and course sections.
* Students to browse, search, register for, and drop courses.
* Administrators to manage users, roles, courses, sections, semesters, and enrollment reports.
* Users to authenticate using their university Microsoft account.
* The backend to use JWT authentication and Role-Based Access Control.
* The system to retrieve textbook information using the Open Library API.
* The system to communicate with another team’s HelpDesk API.
* Partner systems to verify student enrollment and department information through a protected EduCore endpoint.
* The production system to be securely deployed on an Azure Linux VM.
 
⸻
 
2. OFFICIAL PROJECT REQUIREMENTS
 
The proposal specifies these main requirements:
 
Authentication
 
* Microsoft Entra ID / university Active Directory login.
* JWT authentication.
* Role-Based Access Control.
 
Course Management
 
* Create course.
* Update course.
* Delete course.
* Manage course sections.
* Manage seat capacity.
* Automatically attach textbook information using ISBN.
 
Registration
 
* Browse courses.
* Search courses.
* Register for a section.
* Drop a course.
* Prevent duplicate registration.
* Enforce section capacity.
* View registration history.
 
Administration
 
* User management.
* Semester management.
* Enrollment reports.
* Role assignment.
* System activity monitoring.
 
Infrastructure
 
* Azure Linux Virtual Machine.
* Nginx reverse proxy.
* Let’s Encrypt SSL.
* Azure Key Vault.
* Docker Compose.
* GitHub.
 
These requirements are taken from the EduCore proposal.
 
⸻
 
3. TECHNOLOGY STACK
 
Use this technology stack unless there is a specific reason to change it:
 
Frontend:
 
* React
* TypeScript
 
Backend:
 
* Node.js
* Express
* TypeScript
 
Database:
 
* MySQL
 
ORM:
 
* Prisma
 
Authentication:
 
* Microsoft Entra ID
* MSAL
* OAuth2/OIDC concepts
 
Authorization:
 
* JWT
* RBAC
 
External API:
 
* Open Library API
 
Peer API:
 
* Another team’s HelpDesk API
 
Secret management:
 
* Azure Key Vault
 
Server:
 
* Azure Linux VM
 
Reverse proxy:
 
* Nginx
 
HTTPS:
 
* Let’s Encrypt
 
Deployment:
 
* Docker Compose
 
Version control:
 
* GitHub
 
The technology stack is explicitly specified in the project proposal.
 
⸻
 
4. DATABASE DESIGN
 
The main database entities are:
 
User
 
Fields:
 
* id
* microsoftId
* name
* email
* roleId
* department
 
Role
 
Fields:
 
* id
* roleName
 
Course
 
Fields:
 
* id
* courseCode
* title
* description
* credits
* department
* isbn
* textbookInfo
* createdBy
 
Section
 
Fields:
 
* id
* courseId
* semesterId
* professorId
* capacity
* schedule
 
Semester
 
Fields:
 
* id
* name
* startDate
* endDate
 
Enrollment
 
Fields:
 
* id
* studentId
* sectionId
* status
* createdAt
 
These entities and fields are based on the submitted proposal.
 
Do not redesign the database unnecessarily.
 
If an existing Prisma schema differs from the proposal, inspect the current schema first and make the smallest reasonable change.
 
⸻
 
5. USER ROLES
 
STUDENT
 
Student can:
 
* Login using Microsoft Entra ID.
* Browse courses.
* Search courses.
* Register for courses.
* Drop courses.
* View registration history.
 
PROFESSOR
 
Professor can:
 
* Login using Microsoft Entra ID.
* Create courses.
* Update courses.
* Delete their own courses.
* Manage sections.
* Manage seat capacity.
* View enrolled students.
 
ADMIN
 
Administrator can:
 
* Manage users.
* Manage roles.
* Manage courses.
* Manage sections.
* Manage semesters.
* View enrollment reports.
* Monitor system activities.
 
The proposal defines these role permissions.
 
⸻
 
6. IMPORTANT SECURITY RULE
 
Never trust the frontend.
 
For example, this is NOT secure:
 
POST /api/enrollments
 
{
“studentId”: 123,
“sectionId”: 5
}
 
where the backend assumes studentId 123 is the logged-in student.
 
Eventually the backend should determine the student from the authenticated JWT.
 
Correct architecture:
 
User
→ Microsoft Entra ID
→ EduCore authentication
→ JWT
→ backend verifies JWT
→ backend identifies user
→ backend performs authorization
→ backend performs operation
 
The frontend should not be allowed to impersonate another user simply by changing an ID.
 
⸻
 
7. CURRENT DEVELOPMENT STATUS
 
Already completed:
 
* Node.js setup
* Express setup
* TypeScript setup
* MySQL connection
* Prisma setup
* Prisma database schema
* Course CRUD
* Section CRUD
* Enrollment/registration functionality
 
Current position:
 
Microsoft Entra ID authentication is the next major task.
 
Do not skip directly to Docker, Nginx, or deployment yet.
 
⸻
 
8. COMPLETE DEVELOPMENT ROADMAP
 
Follow this order.
 
PHASE 1 — DATABASE AND BACKEND FOUNDATION
 
Step 1
 
Node.js + Express project setup.
 
Step 2
 
MySQL database setup.
 
Step 3
 
Prisma installation and configuration.
 
Step 4
 
Create Prisma schema.
 
Step 5
 
Run Prisma migrations.
 
Step 6
 
Create/test basic Express API.
 
These have already been completed.
 
⸻
 
PHASE 2 — COURSE SYSTEM
 
Step 7
 
Course CRUD.
 
Endpoints should eventually include:
 
GET /api/courses
 
GET /api/courses/:id
 
POST /api/courses
 
PUT /api/courses/:id
 
DELETE /api/courses/:id
 
Already implemented.
 
⸻
 
PHASE 3 — SECTION SYSTEM
 
Step 8
 
Section CRUD.
 
Sections must connect:
 
Course
+
Semester
+
Professor
 
and contain:
 
capacity
schedule
 
Already implemented.
 
⸻
 
PHASE 4 — STUDENT REGISTRATION
 
Step 9
 
Enrollment system.
 
Registration must check:
 
1. Student exists.
2. Section exists.
3. Student is not already enrolled.
4. Section is not full.
5. Create enrollment.
 
Also implement:
 
* Drop course.
* View registration history.
 
Basic enrollment functionality has already been implemented.
 
⸻
 
PHASE 5 — MICROSOFT ENTRA ID
 
Step 10 — CURRENT PRIORITY
 
Implement Microsoft Entra ID authentication.
 
Architecture:
 
Student/Professor
↓
Microsoft login
↓
Microsoft Entra ID
↓
Authentication callback
↓
EduCore identifies Microsoft user
↓
Find/create user in MySQL
↓
Continue to JWT authentication
 
Need:
 
* Entra App Registration.
* Tenant ID.
* Client ID.
* Client Secret.
* Redirect URI.
* MSAL Node.
* Login route.
* Callback route.
* Microsoft user information.
* User lookup/creation in Prisma.
 
Local development may use environment variables temporarily.
 
Example:
 
AZURE_TENANT_ID
 
AZURE_CLIENT_ID
 
AZURE_CLIENT_SECRET
 
AZURE_REDIRECT_URI
 
Do not commit these values to GitHub.
 
Production secrets must later be moved to Azure Key Vault.
 
⸻
 
PHASE 6 — JWT
 
Step 11
 
After successful Microsoft authentication, implement JWT.
 
Flow:
 
Microsoft authentication
↓
EduCore identifies user
↓
EduCore creates JWT
↓
Frontend receives/uses JWT
↓
Frontend sends JWT with API requests
 
Example:
 
Authorization: Bearer
 
JWT should identify the authenticated user.
 
Do not put passwords or unnecessary sensitive information inside the JWT.
 
⸻
 
PHASE 7 — RBAC
 
Step 12
 
Implement RBAC middleware.
 
Example:
 
requireAuth()
 
requireRole(“STUDENT”)
 
requireRole(“PROFESSOR”)
 
requireRole(“ADMIN”)
 
Architecture:
 
HTTP request
↓
JWT middleware
↓
Authenticated?
↓
RBAC middleware
↓
Correct role?
↓
Controller
↓
Database
 
⸻
 
PHASE 8 — PROTECT EXISTING APIs
 
Step 13
 
Go back to Course, Section, and Enrollment APIs.
 
Protect them.
 
Examples:
 
Students should not be able to create/delete courses.
 
Professors should not access admin-only functions.
 
Students should only view/manage their own enrollments.
 
Professors should only manage appropriate courses/sections.
 
Admins can manage administrative data.
 
Do not break the existing working functionality while adding security.
 
⸻
 
PHASE 9 — OPEN LIBRARY API
 
Step 14
 
Integrate Open Library.
 
Purpose:
 
When a professor enters an ISBN while creating/updating a course:
 
EduCore
↓
Open Library API
↓
Book information
↓
Save textbook information to Course
↓
Display textbook information
 
The proposal specifically describes retrieving:
 
* title
* author
* publication year
* cover image
* edition information
 
Example ISBN from proposal:
 
9780262033848
 
The proposal specifies Open Library as the third-party API integration.
 
⸻
 
 
⸻
 
PHASE 11 — EXPOSE OUR PEER API
 
Step 16
 
EduCore must expose a protected API for partner systems.
 
Purpose:
 
Allow another system to verify:
 
* Student department.
* Enrollment status.
 
The proposal gives an example of another system using this information for department-specific discounts.
 
Example architecture:
 
Partner system
↓
x-api-key
↓
EduCore endpoint
↓
Verify API key
↓
Query MySQL
↓
Return permitted student information
 
Do not expose unnecessary personal information.
 
⸻
 
PHASE 12 — ADMIN FEATURES
 
Step 17
 
Implement:
 
* User management.
* Semester management.
* Role assignment.
* Enrollment reports.
* System activity monitoring.
 
Only implement what is necessary for the course project.
 
Do not over-engineer.
 
⸻
 
PHASE 13 — REACT FRONTEND
 
Step 18
 
Build React frontend.
 
Student interface:
 
* Login.
* Course list.
* Course search.
* Course details.
* Register.
* Drop.
* Registration history.
 
Professor interface:
 
* Login.
* Course management.
* Section management.
* Capacity management.
* Enrolled student list.
* ISBN/textbook integration.
 
Admin interface:
 
* User management.
* Role management.
* Semester management.
* Course/section management.
* Enrollment reports.
 
Frontend communicates with the backend API.
 
Frontend must never connect directly to MySQL.
 
Correct:
 
React
↓
Express API
↓
Prisma
↓
MySQL
 
⸻
 
PHASE 14 — AZURE KEY VAULT
 
Step 19
 
Move production secrets to Azure Key Vault.
 
Secrets may include:
 
* Database connection string.
* JWT secret.
* Microsoft client secret.
* Peer API key.
* Other external API credentials if needed.
 
Production architecture:
 
EduCore
↓
Azure Key Vault
↓
Secrets
 
Do not put production secrets inside GitHub.
 
Do not put production secrets directly inside Docker images.
 
Do not commit .env files containing real secrets.
 
⸻
 
PHASE 15 — DOCKER COMPOSE
 
Step 20
 
Create Docker deployment configuration.
 
Goal:
 
Make deployment repeatable.
 
The proposal requires scalable deployment using Docker Compose.
 
Test the Docker setup locally before deploying.
 
⸻
 
PHASE 16 — AZURE LINUX VM
 
Step 21
 
Deploy EduCore to the Azure Linux VM.
 
Configure:
 
* Linux server.
* Required packages.
* Docker.
* Docker Compose.
* Application.
* Required firewall/network settings.
 
Do not destroy existing services on the server.
 
⸻
 
PHASE 17 — NGINX
 
Step 22
 
Configure Nginx reverse proxy.
 
Important:
 
The server may already have existing paths such as:
 
/content
 
/api
 
EduCore must use a separate path.
 
For example:
 
/educore
 
The exact path must be checked against the existing server configuration before editing Nginx.
 
Do not overwrite existing routes.
 
⸻
 
PHASE 18 — HTTPS
 
Step 23
 
Configure Let’s Encrypt.
 
Final system should use:
 
https://your-domain.com/educore
 
or the final approved path.
 
Verify:
 
* HTTPS works.
* Certificate is valid.
* HTTP redirects appropriately if required.
* Existing routes still work.
 
⸻
 
PHASE 19 — TESTING
 
Step 24
 
Test all important scenarios.
 
Authentication:
 
* Successful Microsoft login.
* Invalid authentication.
* JWT verification.
 
RBAC:
 
* Student accessing student features.
* Student attempting professor/admin features.
* Professor accessing professor features.
* Professor attempting admin-only features.
* Admin functionality.
 
Course:
 
* Create.
* Read.
* Update.
* Delete.
 
Section:
 
* Create.
* Update.
* Capacity.
 
Registration:
 
* Successful registration.
* Duplicate registration.
* Full section.
* Invalid section.
* Drop course.
* Registration history.
 
Open Library:
 
* Valid ISBN.
* Invalid ISBN.
* API failure.
 
Peer API:
 
* Correct API key.
* Wrong API key.
* Missing API key.
* Successful HelpDesk request.
* HelpDesk failure.
 
Deployment:
 
* HTTPS.
* Nginx routing.
* Existing /content still works.
* Existing /api still works.
* EduCore path works.
 
⸻
 
PHASE 20 — GITHUB AND README
 
Step 25
 
Make GitHub repository professional.
 
Include:
 
* Source code.
* Prisma schema.
* Docker files.
* README.
* API documentation.
* Setup instructions.
* Deployment instructions.
 
Never commit:
 
* .env
* passwords
* API keys
* client secrets
* JWT secrets
* database passwords
 
⸻
 
PHASE 21 — FINAL DEMONSTRATION
 
Step 26
 
Prepare the final demonstration.
 
Recommended flow:
 
1. Open live EduCore URL.
2. Show HTTPS.
3. Microsoft login.
4. Show Student dashboard.
5. Browse/search courses.
6. Register for a section.
7. Show enrollment history.
8. Show Professor login.
9. Create/manage course.
10. Demonstrate ISBN/Open Library integration.
11. Show section management.
12. Demonstrate HelpDesk peer API.
13. Show protected partner endpoint.
14. Show GitHub repository.
15. Show Prisma schema/ERD.
16. Show Azure Key Vault.
17. Explain Docker Compose.
18. Explain Nginx.
19. Explain deployment.
 
Keep the video under 10 minutes.
 
⸻
 
9. DEVELOPMENT RULES FOR THE AI
 
When helping me with EduCore, follow these rules.
 
Rule 1 — Do not jump ahead
 
Work on one phase at a time.
 
Current priority:
 
Microsoft Entra ID authentication.
 
Do not start Docker/Nginx/deployment unless I specifically ask.
 
Rule 2 — Inspect existing code before changing it
 
Before telling me to replace a file, ask for or inspect the current file if you need its exact contents.
 
Important files include:
 
* prisma/schema.prisma
* src/app.ts
* src/server.ts
* src/config/prisma.ts
* controllers
* services
* routes
* middleware
* package.json
 
Do not blindly replace working code.
 
Rule 3 — Preserve existing functionality
 
Course CRUD, Section CRUD, Enrollment, Prisma, and MySQL are already working.
 
Do not break them.
 
Rule 4 — Give exact instructions
 
For every coding step, explain:
 
1. Which folder to open.
2. Which command to run.
3. Which file to create/edit.
4. What code to put there.
5. What the code does.
6. How to test it.
7. What successful output should look like.
 
Rule 5 — Keep code beginner-friendly
 
I am a university CS student.
 
Prefer simple, understandable code.
 
Do not introduce unnecessary:
 
* design patterns
* frameworks
* abstractions
* libraries
* complicated architecture
 
Use a professional structure, but keep the project manageable.
 
Rule 6 — One step at a time
 
After completing an important step, stop and test it.
 
For example:
 
Install MSAL
↓
Test
 
Create login route
↓
Test
 
Create callback
↓
Test
 
Connect user to database
↓
Test
 
Then continue.
 
Rule 7 — Diagnose errors first
 
If I show an error:
 
1. Explain what the error means.
2. Identify the likely cause.
3. Tell me exactly how to check it.
4. Give the smallest fix.
5. Retest.
6. Only then continue.
 
Do not give me unrelated new features while an existing error is unresolved.
 
Rule 8 — Never invent credentials
 
Never invent:
 
* Azure tenant IDs.
* Client IDs.
* Client secrets.
* API keys.
* Database passwords.
* Partner API keys.
* Domain names.
* Server IP addresses.
 
Use placeholders when necessary.
 
Rule 9 — Security first
 
Never tell me to commit secrets.
 
Use .env only for temporary local development.
 
Production must use Azure Key Vault.
 
Rule 10 — Follow the proposal
 
The proposal is the source of truth for the project’s intended functionality.
 
Do not silently add major features that are not required.
 
Future enhancements listed in the proposal, such as:
 
* waitlists
* prerequisites
* email notifications
* AI recommendations
* timetable conflict detection
* enrollment analytics
 
are NOT required for the main implementation unless I specifically decide to add them.
 
⸻
 
10. CURRENT TASK
 
We are currently at:
 
Microsoft Entra ID Authentication
 
The immediate goal is:
 
Microsoft account
↓
Entra ID
↓
EduCore callback
↓
Identify user
↓
Find/create User in MySQL
↓
Successful authentication
 
After that:
 
JWT → RBAC → protected APIs
 
Do not skip this order.
 
⸻
 
11. HOW THE AI SHOULD RESPOND
 
When I say:
 
“What do I do next?”
 
Look at this roadmap and continue from the current unfinished step.
 
When I say:
 
“I got this error”
 
Focus on fixing the error first.
 
When I say:
 
“Give me the code”
 
Give me code that matches my existing project structure. Ask for the relevant existing file if necessary.
 
When I say:
 
“Explain”
 
Explain it simply and step by step.
 
When I say:
 
“Is this correct?”
 
Check it against:
 
1. Current EduCore architecture.
2. Project proposal.
3. Security requirements.
4. Existing code.
5. The current development phase.
 
Do not assume something is correct simply because it works locally.
 
⸻
 
12. FINAL ARCHITECTURE
 
The intended final architecture is:
 
User
↓
React Frontend
↓
Microsoft Entra ID
↓
JWT
↓
Express Backend
↓
JWT/RBAC Middleware
↓
Controllers/Services
↓
Prisma
↓
MySQL
 
External integrations:
 
Express Backend
├── Open Library API
│
├── Partner HelpDesk API
│
└── Protected EduCore Partner API
 
Production:
 
Internet
↓
HTTPS
↓
Nginx
↓
EduCore
↓
Docker Compose
↓
Node.js/Express
↓
Prisma
↓
MySQL
 
Secrets:
 
EduCore
↓
Azure Key Vault
 
Source:
 
GitHub
 
⸻
 
13. SUCCESS CRITERIA
 
The project is finished when we can demonstrate:
 
* Microsoft university login works.
* JWT authentication works.
* RBAC works.
* Students can register/drop courses.
* Professors can manage courses/sections.
* Admins can perform administrative functions.
* Seat limits work.
* Duplicate registrations are prevented.
* Open Library integration works.
* EduCore exposes a protected partner endpoint using x-api-key.
* Production secrets come from Azure Key Vault.
* Application runs using Docker Compose.
* Application is deployed on an Azure Linux VM.
* Nginx routes the application correctly.
* HTTPS works through Let’s Encrypt.
* Existing server routes are not broken.
* GitHub repository is complete.
* README is professional.
* Live system can be demonstrated.
* Final video is no more than 10 minutes.
 
This is the complete EduCore project roadmap.  
your-domain.com
 