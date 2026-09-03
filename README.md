# CareConnect

CareConnect is a home-services booking platform. It helps customers find verified professionals and helps providers receive suitable service work.

## 1. What CareConnect does

1. A customer describes a home-service problem.
2. The system identifies the service category, urgency, and useful skills.
3. Suitable verified providers are matched to the request.
4. Providers send quotes.
5. The customer compares quotes and creates a booking.
6. The provider updates the work until it is completed.
7. The customer confirms completion, receives an invoice, and can add a review.

## 2. User roles

1. **Customer**
   - Creates requests.
   - Compares quotes.
   - Books a provider.
   - Tracks work, invoices, reviews, and disputes.

2. **Service provider**
   - Views service requests matched to their profile.
   - Sends quotes.
   - Updates job status and evidence photos.
   - Manages profile, availability, and earnings.

3. **Operations manager**
   - Monitors bookings.
   - Assigns providers when needed.
   - Reviews service performance.

4. **Platform admin**
   - Manages users, providers, service categories, analytics, and disputes.

5. **Support agent**
   - Handles complaints.
   - Resolves customer disputes.

## 3. Technology used

### 3.1 Frontend

1. **React**
   - Builds all website screens.
   - Used for pages such as login, service requests, quotes, bookings, and dashboards.
   - Updates the interface without a full browser refresh.

2. **Vite**
   - Starts the frontend quickly during development.
   - Creates optimized frontend files for production.
   - Runs on port `5173` by default.

3. **React Router**
   - Controls navigation between pages.
   - Protects dashboard pages based on the signed-in user’s role.

4. **Tailwind CSS**
   - Creates the responsive design, layout, colors, spacing, and animations.
   - Helps the interface work well on desktop and mobile.

5. **Axios**
   - Sends API requests from the frontend to the backend.
   - Adds the user’s authentication token to protected requests.

6. **lucide-react**
   - Provides lightweight icons for the user interface.

### 3.2 Backend

1. **Node.js**
   - Runs JavaScript on the server.
   - Executes the backend business logic.

2. **Express**
   - Creates the REST API.
   - Receives frontend requests, checks rules, and sends JSON responses.
   - Runs on port `5001` by default.

3. **MongoDB**
   - Stores users, requests, quotes, bookings, invoices, reviews, notifications, and disputes.

4. **Mongoose**
   - Connects Express to MongoDB.
   - Defines and validates database models such as `User`, `Quote`, and `Booking`.

5. **JWT**
   - Keeps users securely signed in.
   - The backend checks the user token and role before allowing protected actions.

6. **bcryptjs**
   - Hashes passwords before they are saved in the database.

7. **Express Validator**
   - Checks incoming data before it reaches the main backend logic.
   - Prevents invalid booking, quote, and form data.

8. **Multer**
   - Handles evidence photos and other file uploads.

9. **Google Gemini API (optional)**
   - Helps classify the customer’s written problem.
   - Identifies category, urgency, and required skills.
   - A built-in fallback is used when no Gemini key is available.

## 4. How the technologies work together

1. A user opens the React website.
2. React uses Axios to send a request to `/api`.
3. Vite forwards that request to the Express backend during local development.
4. Express checks the JWT token, role, and request data.
5. Mongoose reads or writes data in MongoDB.
6. The backend returns JSON data to React.
7. React updates the screen with the latest data.

```text
React frontend (port 5173)
        |
        | Axios API request
        v
Express backend (port 5001)
        |
        +-- MongoDB database
        +-- Gemini AI service (optional)
        +-- Uploads folder
```

## 5. Request to booking flow

1. The customer creates a request with a title, description, address, date, and time.
2. The backend classifies the request.
3. The recommendation service finds providers with suitable skills.
4. Matched providers see the request.
5. A provider sends a quote with price, duration, and work description.
6. The customer compares all received quotes.
7. The customer selects one quote.
8. The backend creates the booking.
9. The chosen quote becomes `ACCEPTED`.
10. The service request becomes `BOOKED`.
11. The customer is redirected to the booking-details page.
12. The provider moves the job through statuses:
    - `CONFIRMED`
    - `ACCEPTED`
    - `ON_THE_WAY`
    - `IN_PROGRESS`
    - `COMPLETED`
13. The customer confirms completion.
14. The system finalizes an invoice and asks for a review.

## 6. Project folders

1. `frontend/`
   - React application.
   - `src/pages/` contains pages.
   - `src/components/` contains reusable UI components.
   - `src/context/` contains authentication and notification state.
   - `src/services/api.js` configures API requests.

2. `backend/`
   - Express API.
   - `routes/` defines endpoints.
   - `controllers/` contains business logic.
   - `models/` contains MongoDB schemas.
   - `services/` contains AI, matching, availability, and notifications.
   - `middleware/` contains authentication, validation, uploads, and error handling.
   - `validators/` contains input-validation rules.

## 7. Run the project locally

### Step 1: Install requirements

1. Install Node.js 18 or newer.
2. Start MongoDB locally, or use a hosted MongoDB connection string.
3. Open two terminals.

### Step 2: Configure and start backend

1. Go to the backend folder:

```powershell
cd backend
```

2. Create `backend/.env` from `backend/.env.example`.

3. Add configuration:

```env
PORT=5001
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://localhost:27017/careconnect
JWT_SECRET=replace-with-a-long-random-secret

# Optional AI configuration
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.0-flash
```

4. Install packages and start the API:

```powershell
npm install
npm.cmd start
```

5. Check backend health:

```text
http://localhost:5001/api/health
```

### Step 3: Configure and start frontend

1. Go to the frontend folder in the second terminal:

```powershell
cd frontend
```

2. Install packages and start the app:

```powershell
npm install
npm.cmd run dev
```

3. Open:

```text
http://localhost:5173
```

## 8. Useful commands

1. Start frontend:

```powershell
cd frontend
npm.cmd run dev
```

2. Build frontend:

```powershell
cd frontend
npm.cmd run build
```

3. Start backend:

```powershell
cd backend
npm.cmd start
```

4. Start backend with auto-reload:

```powershell
cd backend
npm.cmd run dev
```

5. Seed development data:

```powershell
cd backend
npm.cmd run seed
```

## 9. API groups

1. `/api/auth` — register, login, and current user.
2. `/api/requests` — service requests.
3. `/api/providers` — provider search and profile details.
4. `/api/quotes` — quote creation and quote comparison.
5. `/api/bookings` — booking creation, updates, and confirmation.
6. `/api/jobs` — job progress updates and evidence.
7. `/api/invoices` — invoices.
8. `/api/reviews` — provider reviews.
9. `/api/disputes` — complaints and resolutions.
10. `/api/notifications` — user notifications.

## 10. Important business rules

1. Only verified providers can submit quotes.
2. Providers see only requests matched to their profile.
3. A provider can submit only one quote per request.
4. A booking can be created only from a `PENDING` quote.
5. Creating a booking accepts the selected quote and marks the request as `BOOKED`.
6. Customers can view only their own bookings.
7. Providers can view only assigned jobs.
8. Customers must confirm a completed job before the invoice is finalized.

## 11. Troubleshooting

1. **Backend does not start**
   - Confirm MongoDB is running.
   - Confirm `MONGO_URI` in `backend/.env` is correct.

2. **Port 5001 is already in use**
   - Another backend process is running.
   - Stop it or change `PORT` in `backend/.env`.

3. **Frontend API calls fail**
   - Start the backend first.
   - Confirm `frontend/vite.config.js` points to `http://localhost:5001`.

4. **Provider sees no requests**
   - Confirm the provider is verified.
   - Confirm the provider was matched by the recommendation service.

5. **Booking cannot be created**
   - Confirm the quote is still pending.
   - Confirm the provider is available at the selected time.
   - Confirm the customer owns the service request.

## 12. Before production deployment

1. Replace the development JWT secret.
2. Use a secure production MongoDB database.
3. Set `NODE_ENV=production`.
4. Set `CLIENT_URL` to the deployed frontend address.
5. Store uploads in cloud object storage instead of the local uploads folder.
6. Restrict CORS to trusted domains.
7. Add rate limiting, monitoring, backups, and payment integration.
8. Do not use seeded development accounts in production.
