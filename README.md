# Job Matching Platform

A full-stack job-matching platform built with Next.js, Node.js/Express, and MongoDB. This application connects talented professionals with job opportunities through role-based authentication and manual job-user matching.

## 🚀 Features

### User Management
- **Registration & Login**: JWT-based authentication system
- **Role-based Access**: 
  - **Talent**: Job seekers who can view matched jobs
  - **Admin**: HR/Recruiters who can manage jobs and create matches
- **Security**: Password hashing with bcrypt and JWT middleware protection

### Job Management
- **Public Access**:
  - View all available jobs
  - Get detailed job information
- **Admin-only Features**:
  - Create new job postings
  - Delete existing jobs
  - Manage job listings

### Matching System
- **Admin Functionality**: 
  - Match talents to specific jobs
  - Create job-user relationships
- **Talent Features**:
  - View all jobs matched to their profile
  - Browse matched opportunities

## 🛠 Tech Stack

### Frontend
- **Next.js 15** with TypeScript
- **Tailwind CSS** for styling
- **React Hook Form** for form management
- **Axios** for API calls
- **Lucide React** for icons

### Backend
- **Node.js** with **Express.js**
- **MongoDB** with **Mongoose**
- **JWT** for authentication
- **bcrypt** for password hashing
- **CORS** for cross-origin requests

## 📁 Project Structure

```
├── frontend/                   # Next.js frontend application
│   ├── src/
│   │   ├── app/               # App router pages
│   │   │   ├── auth/          # Authentication pages
│   │   │   ├── admin/         # Admin-only pages
│   │   │   ├── jobs/          # Job listing pages
│   │   │   └── my-matches/    # Talent's matched jobs
│   │   ├── components/        # Reusable components
│   │   ├── contexts/          # React contexts
│   │   └── lib/              # Utilities and API clients
│   ├── package.json
│   └── ...
├── backend/                   # Node.js/Express backend
│   ├── controllers/          # Route controllers
│   ├── middleware/           # Authentication middleware
│   ├── models/              # MongoDB models
│   ├── routes/              # API routes
│   ├── server.js            # Main server file
│   ├── package.json
│   └── .env                 # Environment variables
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   # Copy and edit the .env file
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/job-matching
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   # Create .env.local file
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   npm start
   ```

## 📱 Usage

### For Talents (Job Seekers)

1. **Register** with role "Talent"
2. **Browse Jobs** in the jobs section
3. **View Matches** in "My Matches" to see jobs assigned by admins
4. **Apply** to matched opportunities

### For Admins (HR/Recruiters)

1. **Register** with role "Admin"
2. **Create Jobs** in the admin panel
3. **Manage Jobs** - edit or delete existing postings
4. **Create Matches** between talents and suitable jobs
5. **Monitor** the matching system

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)

### Jobs
- `GET /api/jobs` - Get all jobs (public)
- `GET /api/jobs/:id` - Get job by ID (public)
- `POST /api/jobs` - Create job (admin only)
- `DELETE /api/jobs/:id` - Delete job (admin only)

### Matches
- `POST /api/matches` - Create match (admin only)
- `GET /api/matches/my-matches` - Get talent's matches (talent only)

## 🔧 Development

### Running in Development Mode

1. Start MongoDB (if running locally)
2. Start the backend server: `cd backend && npm run dev`
3. Start the frontend server: `cd frontend && npm run dev`
4. Access the application at `http://localhost:3000`

### Database Models

#### User Model
- email, password, name, role (talent/admin)
- Password hashing and JWT token generation

#### Job Model
- title, description, company, location, salary
- jobType, experienceLevel, requirements
- Created by admin reference

#### Match Model
- jobId (reference to Job)
- userId (reference to User - talent)
- matchedBy (reference to User - admin)
- status and timestamps

## 🛡 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Role-based Access Control**: Protected routes based on user roles
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Configured for frontend-backend communication

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop and mobile devices
- **Clean Interface**: Modern design with Tailwind CSS
- **Loading States**: User feedback during API calls
- **Error Handling**: User-friendly error messages
- **Role-based Navigation**: Different UI based on user role

## 🚀 Production Deployment

### Frontend (Vercel/Netlify)
1. Build the project: `npm run build`
2. Deploy the `out` folder to your hosting provider
3. Set environment variables for production API URL

### Backend (Railway/Heroku/VPS)
1. Set up production MongoDB database
2. Configure environment variables
3. Deploy with `npm start`

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Support

For support or questions, please open an issue in the repository or contact the development team.

---

Built with ❤️ using Next.js, Node.js, and MongoDB by Joshua Oyewole
