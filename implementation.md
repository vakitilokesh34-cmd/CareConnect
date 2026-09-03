Build a complete full-stack MERN application called:

CARECONNECT – HOME SERVICES BOOKING & OPERATIONS PLATFORM

Project Type:
AI-Enabled Full Stack Capstone Project

Tech Stack:
Frontend:
- React.js
- Vite
- React Router DOM
- Context API or Redux Toolkit for state management
- Tailwind CSS
- Axios
- React Hook Form
- Responsive design

Backend:
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcrypt password hashing
- Multer or Cloudinary for file uploads

AI Integration:
- Google Gemini API or another suitable AI API
- AI-based service request classification
- AI-based provider recommendation and ranking

==================================================
PROJECT OBJECTIVE
==================================================

Build a complete marketplace platform where customers can book home services such as:

- Appliance Repair
- Home Cleaning
- Electrical Work
- Plumbing
- Painting
- AC Repair
- Carpentry
- Home Maintenance

The platform must support multiple users and roles.

The system should allow:

1. Customers to create service requests.
2. AI to classify customer service requests.
3. The system to discover suitable service providers.
4. Providers to submit quotes.
5. Customers to compare and select quotes.
6. Customers to schedule bookings.
7. Providers to manage availability and jobs.
8. Customers and providers to track job progress.
9. Providers to upload before/after service evidence.
10. Customers to confirm service completion.
11. Customers to submit reviews.
12. Support agents to handle complaints and disputes.
13. Operations managers to monitor bookings and assign providers.
14. Platform administrators to manage the entire system.

==================================================
USER ROLES
==================================================

Implement the following roles:

1. CUSTOMER
2. SERVICE_PROVIDER
3. PLATFORM_ADMIN
4. OPERATIONS_MANAGER
5. SUPPORT_AGENT

Use Role-Based Access Control (RBAC).

Each role must only access its authorized pages and APIs.

==================================================
CUSTOMER RESPONSIBILITIES
==================================================

Customer can:

- Register and login
- Manage profile
- Add address and service location
- Browse service categories
- Create service requests
- Describe problems using free text
- Upload images related to the problem
- Receive AI-generated service category suggestions
- Receive AI-generated required skills
- Discover suitable providers
- View provider profiles
- Compare provider ratings
- Receive and compare quotes
- Select a provider
- Schedule a booking
- Track service progress
- Cancel bookings according to policy
- Confirm job completion
- Download/view invoices
- Submit reviews and ratings
- Create complaints
- Participate in disputes

==================================================
SERVICE PROVIDER RESPONSIBILITIES
==================================================

Service Provider can:

- Register and login
- Create provider profile
- Submit verification documents
- Wait for admin verification
- Add skills
- Select service categories
- Define service areas
- Set experience
- Define pricing information
- Manage availability slots
- View incoming service requests
- Receive matching recommendations
- Submit quotes
- Accept assigned jobs
- Update job status
- Add job notes
- Upload attachments
- Upload before-service images
- Upload after-service images
- Mark jobs as completed
- Generate/view invoices
- View ratings and reviews
- Manage profile

Provider job statuses:

- PENDING
- ASSIGNED
- ACCEPTED
- ON_THE_WAY
- IN_PROGRESS
- COMPLETED
- CUSTOMER_CONFIRMED
- CANCELLED
- DISPUTED

==================================================
PLATFORM ADMIN RESPONSIBILITIES
==================================================

Platform Admin can:

- Manage users
- Manage service categories
- Manage providers
- Verify providers
- Reject provider verification
- Manage pricing rules
- Manage disputes
- Manage platform policies
- View analytics
- View audit logs
- Suspend users
- Activate/deactivate categories
- Monitor platform activity

==================================================
OPERATIONS MANAGER RESPONSIBILITIES
==================================================

Operations Manager can:

- Monitor all bookings
- Monitor pending requests
- Assign providers manually
- Handle escalations
- Monitor service quality
- Monitor delayed jobs
- Monitor provider performance
- Monitor booking completion rates
- View operational analytics

==================================================
SUPPORT AGENT RESPONSIBILITIES
==================================================

Support Agent can:

- View customer complaints
- Handle booking cancellations
- Handle disputes
- Communicate with customers
- Communicate with providers
- Process refund requests
- Update dispute status
- Add resolution notes

==================================================
AUTHENTICATION AND SECURITY
==================================================

Implement:

- JWT authentication
- Access token authentication
- Password hashing using bcrypt
- Role-based authorization middleware
- Resource ownership validation
- Protected routes
- Server-side validation
- Secure error handling
- Environment variables
- Password validation
- Duplicate email prevention

Create middleware for:

1. authenticateUser
2. authorizeRoles
3. validateResourceOwnership
4. globalErrorHandler

==================================================
DATABASE MODELS
==================================================

Create MongoDB/Mongoose models for:

1. User
2. ServiceCategory
3. ProviderProfile
4. ProviderSkill
5. AvailabilitySlot
6. ServiceRequest
7. Quote
8. Booking
9. JobUpdate
10. Invoice
11. Review
12. Dispute
13. Notification
14. AuditLog

--------------------------------------------------
USER MODEL
--------------------------------------------------

Fields:

- name
- email
- password
- phone
- role
- profileImage
- addresses
- isActive
- createdAt
- updatedAt

Roles:

CUSTOMER
SERVICE_PROVIDER
PLATFORM_ADMIN
OPERATIONS_MANAGER
SUPPORT_AGENT

--------------------------------------------------
SERVICE CATEGORY MODEL
--------------------------------------------------

Fields:

- name
- description
- icon
- requiredSkills
- basePrice
- isActive

Examples:

- Plumbing
- Electrical
- Cleaning
- Appliance Repair
- Carpentry
- Painting
- AC Repair

--------------------------------------------------
PROVIDER PROFILE MODEL
--------------------------------------------------

Fields:

- user
- businessName
- description
- experience
- skills
- serviceCategories
- serviceAreas
- pricing
- verificationStatus
- verificationDocuments
- averageRating
- totalReviews
- completedJobs

Verification Status:

- PENDING
- VERIFIED
- REJECTED

--------------------------------------------------
AVAILABILITY SLOT MODEL
--------------------------------------------------

Fields:

- provider
- startTime
- endTime
- isAvailable

The system must prevent overlapping availability slots and overlapping confirmed bookings.

--------------------------------------------------
SERVICE REQUEST MODEL
--------------------------------------------------

Fields:

- customer
- title
- description
- images
- address
- preferredDate
- preferredTime
- category
- requiredSkills
- AIClassification
- status

Request Status:

- OPEN
- PROVIDERS_MATCHED
- QUOTES_RECEIVED
- BOOKED
- CANCELLED
- COMPLETED

--------------------------------------------------
QUOTE MODEL
--------------------------------------------------

Fields:

- serviceRequest
- provider
- estimatedPrice
- description
- estimatedDuration
- status
- createdAt

Quote Status:

- PENDING
- ACCEPTED
- REJECTED
- EXPIRED

--------------------------------------------------
BOOKING MODEL
--------------------------------------------------

Fields:

- customer
- provider
- serviceRequest
- quote
- scheduledStartTime
- scheduledEndTime
- address
- status
- cancellationReason
- totalPrice

Booking Status:

- PENDING
- CONFIRMED
- PROVIDER_ASSIGNED
- ACCEPTED
- ON_THE_WAY
- IN_PROGRESS
- COMPLETED
- CUSTOMER_CONFIRMED
- CANCELLED
- DISPUTED

--------------------------------------------------
JOB UPDATE MODEL
--------------------------------------------------

Fields:

- booking
- provider
- status
- note
- attachments
- beforeImages
- afterImages
- createdAt

--------------------------------------------------
INVOICE MODEL
--------------------------------------------------

Fields:

- booking
- invoiceNumber
- provider
- customer
- services
- subtotal
- taxes
- totalAmount
- paymentStatus

Payment Status:

- PENDING
- PAID
- REFUNDED

--------------------------------------------------
REVIEW MODEL
--------------------------------------------------

Fields:

- customer
- provider
- booking
- rating
- comment
- createdAt

Only customers who completed a booking should be allowed to submit a review.

--------------------------------------------------
DISPUTE MODEL
--------------------------------------------------

Fields:

- booking
- raisedBy
- reason
- description
- evidence
- status
- assignedSupportAgent
- resolution
- createdAt

Dispute Status:

- OPEN
- UNDER_REVIEW
- RESOLVED
- CLOSED

--------------------------------------------------
NOTIFICATION MODEL
--------------------------------------------------

Fields:

- user
- title
- message
- type
- isRead
- relatedResource

Notification Types:

- BOOKING
- QUOTE
- DISPUTE
- PAYMENT
- SYSTEM

--------------------------------------------------
AUDIT LOG MODEL
--------------------------------------------------

Fields:

- user
- action
- resourceType
- resourceId
- metadata
- createdAt

==================================================
AI FEATURE 1:
SERVICE REQUEST CLASSIFICATION
==================================================

When a customer writes a free-text request such as:

"My kitchen tap is leaking continuously and water is coming under the sink."

Use AI to determine:

- Service Category
- Required Skills
- Urgency Level
- Suggested Keywords

Expected AI output:

{
  "category": "Plumbing",
  "requiredSkills": [
    "Leak Repair",
    "Pipe Repair"
  ],
  "urgency": "Medium",
  "keywords": [
    "water leakage",
    "kitchen tap",
    "pipe"
  ]
}

The AI must return structured JSON.

Store AI classification results in the ServiceRequest document.

==================================================
AI FEATURE 2:
PROVIDER RECOMMENDATION ENGINE
==================================================

Create an AI-assisted provider ranking system.

Rank providers based on:

- Matching service category
- Matching skills
- Service area compatibility
- Provider availability
- Experience
- Historical ratings
- Number of completed jobs
- Distance/service area match
- Pricing compatibility

Create a provider score.

Example:

Provider Match Score:

Skill Match        = 30%
Availability       = 20%
Rating             = 20%
Experience         = 15%
Service Area       = 10%
Completed Jobs     = 5%

Return providers sorted from highest score to lowest score.

Also display an explanation:

Example:

"Recommended because this provider has all required plumbing skills, serves your area, is available at your requested time, and has a 4.8 rating."

==================================================
BOOKING WORKFLOW
==================================================

Implement the following complete workflow:

STEP 1:
Customer creates a service request.

STEP 2:
AI classifies the request.

STEP 3:
System identifies required skills.

STEP 4:
Matching providers are discovered.

STEP 5:
Providers receive request notifications.

STEP 6:
Providers submit quotes.

STEP 7:
Customer compares quotes.

STEP 8:
Customer selects a quote/provider.

STEP 9:
System validates provider availability.

STEP 10:
Booking is created.

STEP 11:
Provider accepts the job.

STEP 12:
Provider updates job progress.

STEP 13:
Provider uploads before-service evidence.

STEP 14:
Provider marks service completed.

STEP 15:
Provider uploads after-service evidence.

STEP 16:
Customer reviews evidence.

STEP 17:
Customer confirms completion.

STEP 18:
Invoice is finalized.

STEP 19:
Customer submits review.

==================================================
AVAILABILITY ENGINE
==================================================

Implement logic that prevents providers from accepting overlapping jobs.

Before creating a booking:

Check:

newBooking.startTime < existingBooking.endTime

AND

newBooking.endTime > existingBooking.startTime

If both conditions are true, reject the booking because of an overlapping schedule.

Return a clear API error:

"Provider is not available during the selected time."

==================================================
REST API STRUCTURE
==================================================

Create REST APIs.

AUTH:

POST /api/auth/register
POST /api/auth/login
GET /api/auth/profile
PUT /api/auth/profile

SERVICE CATEGORIES:

GET /api/categories
POST /api/categories
PUT /api/categories/:id
DELETE /api/categories/:id

PROVIDERS:

GET /api/providers
GET /api/providers/:id
PUT /api/providers/profile
POST /api/providers/availability
GET /api/providers/availability
POST /api/providers/documents

SERVICE REQUESTS:

POST /api/requests
GET /api/requests
GET /api/requests/:id
PUT /api/requests/:id
DELETE /api/requests/:id

AI:

POST /api/ai/classify-request
POST /api/ai/recommend-providers

QUOTES:

POST /api/quotes
GET /api/quotes/request/:requestId
PUT /api/quotes/:id
DELETE /api/quotes/:id

BOOKINGS:

POST /api/bookings
GET /api/bookings
GET /api/bookings/:id
PUT /api/bookings/:id/status
POST /api/bookings/:id/cancel
POST /api/bookings/:id/confirm-completion

JOB TRACKING:

POST /api/jobs/:bookingId/updates
GET /api/jobs/:bookingId/updates

INVOICES:

POST /api/invoices
GET /api/invoices/:id
GET /api/invoices/booking/:bookingId

REVIEWS:

POST /api/reviews
GET /api/reviews/provider/:providerId

DISPUTES:

POST /api/disputes
GET /api/disputes
PUT /api/disputes/:id
POST /api/disputes/:id/resolve

ADMIN:

GET /api/admin/users
GET /api/admin/providers
PUT /api/admin/providers/:id/verify
PUT /api/admin/users/:id/status

ANALYTICS:

GET /api/analytics/dashboard
GET /api/analytics/bookings
GET /api/analytics/providers
GET /api/analytics/revenue

==================================================
FRONTEND PAGES
==================================================

Create a modern responsive frontend.

PUBLIC PAGES:

1. Home Page
2. Services Page
3. Provider Search Page
4. Provider Details Page
5. Login Page
6. Register Page

CUSTOMER DASHBOARD:

1. Dashboard Overview
2. Create Service Request
3. My Service Requests
4. Provider Recommendations
5. Compare Quotes
6. My Bookings
7. Booking Details
8. Invoice Page
9. Reviews
10. Complaints/Disputes
11. Profile Settings

SERVICE PROVIDER DASHBOARD:

1. Provider Dashboard
2. Profile Management
3. Verification Documents
4. Skills Management
5. Service Areas
6. Availability Calendar
7. Incoming Requests
8. My Quotes
9. Active Jobs
10. Job Details
11. Upload Service Evidence
12. Earnings
13. Reviews

ADMIN DASHBOARD:

1. Dashboard Overview
2. User Management
3. Provider Verification
4. Service Categories
5. Pricing Rules
6. Dispute Management
7. Analytics
8. Audit Logs

OPERATIONS DASHBOARD:

1. Booking Monitoring
2. Provider Assignment
3. Escalations
4. Service Quality
5. Performance Analytics

SUPPORT DASHBOARD:

1. Complaints
2. Disputes
3. Cancellations
4. Refund Requests
5. Customer Communication

==================================================
FRONTEND COMPONENTS
==================================================

Create reusable components:

- Navbar
- Sidebar
- ProtectedRoute
- RoleProtectedRoute
- ServiceCategoryCard
- ProviderCard
- ProviderRecommendationCard
- QuoteCard
- BookingCard
- BookingStatusTimeline
- AvailabilityCalendar
- ReviewCard
- NotificationDropdown
- SearchFilters
- Pagination
- LoadingSpinner
- ErrorMessage
- ConfirmationModal

==================================================
STATE MANAGEMENT
==================================================

Use Context API or Redux Toolkit.

Manage:

- Authentication state
- Current user
- User role
- Notifications
- Service requests
- Provider recommendations
- Quotes
- Bookings

Persist authentication using localStorage or secure cookies.

==================================================
SEARCH AND FILTERING
==================================================

Implement search and filters for:

Providers:

- Category
- Skills
- Service Area
- Rating
- Availability
- Price Range

Bookings:

- Status
- Date
- Provider
- Customer

Service Requests:

- Category
- Status
- Date

==================================================
NOTIFICATION SYSTEM
==================================================

Generate notifications when:

- Provider receives a matching request
- Provider receives a booking
- Customer receives a quote
- Quote is accepted/rejected
- Booking status changes
- Provider is assigned
- Dispute status changes
- Job is completed

Use in-app notifications.

Design the backend so email/SMS notifications can be added later.

==================================================
VALIDATION
==================================================

Use server-side validation.

Validate:

- Email
- Password
- Phone
- MongoDB IDs
- Booking dates
- Provider availability
- Quote amounts
- Ratings between 1 and 5
- Required fields
- Role permissions

==================================================
ERROR HANDLING
==================================================

Implement centralized error handling.

Use consistent API response format.

Success:

{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}

Error:

{
  "success": false,
  "message": "Error message",
  "errors": []
}

Handle:

- Invalid credentials
- Unauthorized access
- Forbidden access
- Resource not found
- Validation errors
- Duplicate records
- Booking conflicts
- Server errors

==================================================
PROJECT FOLDER STRUCTURE
==================================================

Create the project using:

careconnect/

  client/
    src/
      components/
      pages/
      layouts/
      context/
      hooks/
      services/
      utils/

  server/
    config/
    controllers/
    middleware/
    models/
    routes/
    services/
    validators/
    utils/

==================================================
UI DESIGN REQUIREMENTS
==================================================

Create a professional modern UI.

Use:

- Clean dashboard design
- Responsive layout
- Mobile-friendly interface
- Sidebar navigation
- Cards
- Tables
- Status badges
- Modal dialogs
- Loading states
- Empty states
- Error states
- Search and filters

The home page should clearly display:

- Hero section
- Service categories
- How CareConnect works
- Benefits
- Popular providers
- Customer reviews
- Call-to-action section

==================================================
ANALYTICS
==================================================

Create analytics dashboards showing:

Admin:

- Total users
- Total customers
- Total providers
- Verified providers
- Pending verifications
- Total bookings
- Completed bookings
- Cancelled bookings
- Open disputes

Operations Manager:

- Active jobs
- Delayed jobs
- Provider utilization
- Booking completion rate
- Average service rating

Provider:

- Total jobs
- Completed jobs
- Active jobs
- Average rating
- Total earnings

==================================================
TEST DATA
==================================================

Create seed data containing:

- 1 Platform Admin
- 1 Operations Manager
- 1 Support Agent
- 5 Customers
- 10 Service Providers
- Multiple service categories
- Provider skills
- Availability slots
- Sample service requests
- Sample quotes
- Sample bookings
- Sample reviews

Use realistic demo data.

==================================================
DEVELOPMENT REQUIREMENTS
==================================================

Generate the project incrementally and ensure it runs correctly.

Step 1:
Create backend structure.

Step 2:
Configure Express server.

Step 3:
Connect MongoDB.

Step 4:
Create Mongoose models.

Step 5:
Implement authentication.

Step 6:
Implement RBAC middleware.

Step 7:
Implement service category APIs.

Step 8:
Implement provider APIs.

Step 9:
Implement service request workflow.

Step 10:
Implement AI request classification.

Step 11:
Implement provider recommendation engine.

Step 12:
Implement quotes.

Step 13:
Implement booking and availability engine.

Step 14:
Implement job tracking.

Step 15:
Implement invoices.

Step 16:
Implement reviews.

Step 17:
Implement disputes.

Step 18:
Implement notifications.

Step 19:
Build React frontend.

Step 20:
Build dashboards for every role.

Step 21:
Connect frontend with APIs.

Step 22:
Add responsive UI.

Step 23:
Add seed data.

Step 24:
Test complete workflows.

==================================================
IMPORTANT DEVELOPMENT RULES
==================================================

- Write clean, modular, production-quality code.
- Use MVC architecture on the backend.
- Do not put all logic inside controllers.
- Use services for business logic.
- Add comments for complex logic.
- Use environment variables.
- Never hardcode API keys.
- Implement proper authorization.
- Validate resource ownership.
- Prevent provider booking conflicts.
- Use reusable React components.
- Make the UI responsive.
- Show loading and error states.
- Add meaningful test/demo data.
- Ensure every role has separate permissions.
- Ensure the complete request-to-book workflow works end-to-end.

FINAL EXPECTED RESULT:

A fully functional AI-enabled MERN application named CareConnect where customers can request home services, AI classifies the request, suitable providers are recommended, providers submit quotes, customers book providers, providers complete jobs, customers confirm completion, and administrators and operations teams manage the entire platform.