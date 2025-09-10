# InstollConnect - Job Matching Platform (Assessment for FullStack Developer Role at Instollar)

A comprehensive full-stack job-matching platform built with Next.js 15, Node.js/Express, and MongoDB Atlas. This application connects talented professionals with job opportunities through advanced role-based authentication, middleware protection, and intelligent job-user matching with a modern glassmorphism UI design.

## 🚀 Features

### Authentication & Authorization
- **JWT-based Authentication**: Secure token-based authentication with HTTP-only cookies
- **Middleware Protection**: Server-side route protection using Next.js middleware
- **Role-based Access Control**: 
  - **Talent**: Job seekers who can apply to jobs and view matches
  - **Admin**: HR/Recruiters with full dashboard and management capabilities
- **Automatic Redirects**: Role-based login redirects and protected route access
- **Security**: bcrypt password hashing, JWT tokens, and comprehensive input validation

### Job Management
- **Public Job Browsing**: View all active job listings with detailed information
- **Admin Job Management**:
  - Create, and delete job postings
  - Advanced job validation and management
- **Responsive Job Cards**: Modern card-based design with salary formatting and experience indicators

### Advanced Matching System
- **Smart Job Matching**: Admin-controlled matching between talents and suitable positions
- **Application Management**: 
  - Duplicate application prevention
- **Match Analytics**: Dashboard insights and match success tracking

### Modern Admin Dashboard
- **Glassmorphism Design**: Beautiful, modern UI with gradient effects and glass morphism
- **Quick Actions**: Fast access to common administrative tasks

## 🛠 Tech Stack

### Frontend
- **Next.js 15.5.2** with App Router and TypeScript
- **React 19.1.0** with modern hooks and context
- **Tailwind CSS v4** with custom glassmorphism design
- **React Hook Form 7.62.0** with Zod validation
- **Axios 1.11.0** for API communications
- **Lucide React** for modern iconography
- **React Toastify** for user notifications
- **Next.js Middleware** for server-side route protection

### Backend
- **Node.js** with **Express.js 5.1.0**
- **MongoDB Atlas** with **Mongoose 8.18.0**
- **JWT 9.0.2** for secure authentication
- **bcryptjs 3.0.2** for password hashing
- **Joi 18.0.1** and **Zod 4.1.5** for validation
- **Helmet 8.1.0** for security headers
- **CORS 2.8.5** for cross-origin requests

### Architecture
- **Repository Pattern**: Clean separation of data access
- **Service Layer**: Business logic abstraction  
- **Controller Pattern**: Request/response handling
- **Middleware Architecture**: Authentication and validation layers
- **Environment Configuration**: Secure environment variable management

## 📁 Project Architecture

```
instollar/
├── frontend/                           # Next.js 15 Frontend Application
│   ├── src/
│   │   ├── app/                       # App Router Pages
│   │   │   ├── auth/                  # Authentication (Login/Register)
│   │   │   │   ├── login/page.tsx     # Login with role-based redirects
│   │   │   │   └── register/page.tsx  # Registration with Suspense
│   │   │   ├── admin/                 # Admin-Only Protected Routes
│   │   │   │   ├── dashboard/page.tsx # Modern glassmorphism dashboard
│   │   │   │   ├── jobs/              # Job management interface
│   │   │   │   └── matches/page.tsx   # Match management system
│   │   │   ├── jobs/                  # Public Job Browsing
│   │   │   │   ├── page.tsx           # Job listings with search
│   │   │   │   └── [id]/page.tsx      # Detailed job view & applications
│   │   │   ├── my-matches/page.tsx    # Talent's matched jobs
│   │   │   ├── layout.tsx             # Root layout with auth context
│   │   │   └── page.tsx               # Landing page
│   │   ├── components/                # Reusable UI Components
│   │   │   ├── JobCard.tsx            # Modern job card with formatting
│   │   │   ├── Navbar.tsx             # Role-based navigation
│   │   │   └── ProtectedRoute.tsx     # Client-side route protection
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx        # Global auth state with cookies
│   │   ├── lib/                       # Utilities & Configuration
│   │   │   ├── api.ts                 # Axios API client
│   │   │   ├── auth.ts                # Auth utilities
│   │   │   └── cookies.ts             # Cookie management
│   │   └── middleware.ts              # Server-side route protection
│   ├── tailwind.config.ts             # Tailwind CSS v4 configuration
│   ├── next.config.ts                 # Next.js configuration
│   └── package.json                   # Dependencies & scripts
├── backend/                           # Node.js/Express Backend API
│   ├── controllers/                   # Request/Response Logic
│   │   ├── auth.js                    # Authentication controller
│   │   ├── jobs.js                    # Job management controller
│   │   ├── matches.js                 # Match system controller
│   │   ├── talents.js                 # Talent-specific operations
│   │   └── users.js                   # User management controller
│   ├── middleware/
│   │   └── auth.js                    # JWT verification middleware
│   ├── models/                        # MongoDB Schemas
│   │   ├── User.js                    # User model with roles
│   │   ├── Job.js                     # Job postings model
│   │   └── Match.js                   # Job-user matching model
│   ├── repositories/                  # Data Access Layer
│   │   ├── UserRepository.js          # User data operations
│   │   ├── JobRepository.js           # Job data operations
│   │   └── MatchRepository.js         # Match data operations
│   ├── services/                      # Business Logic Layer
│   │   ├── UserService.js             # User business logic
│   │   ├── JobService.js              # Job business logic
│   │   └── MatchService.js            # Match business logic
│   ├── routes/                        # API Route Definitions
│   │   ├── auth.js                    # Authentication routes
│   │   ├── jobs.js                    # Job CRUD routes
│   │   ├── matches.js                 # Match management routes
│   │   └── users.js                   # User management routes
│   ├── validators/                    # Input Validation
│   │   ├── AuthValidator.js           # Auth input validation
│   │   ├── JobValidator.js            # Job input validation
│   │   └── MatchValidator.js          # Match input validation
│   ├── database/
│   │   └── db.js                      # MongoDB Atlas connection
│   ├── utils/
│   │   └── helpers.js                 # Utility functions
│   ├── index.js                       # Express server entry point
│   ├── package.json                   # Dependencies & scripts
│   └── .env                           # Environment configuration
└── README.md                          # Project documentation
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
   # Create/edit the .env file
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/instollar
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
   NEXT_PUBLIC_APP_URL=http://localhost:3000
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

## 📱 Usage Guide

### For Talents (Job Seekers)

1. **Registration & Login**
   - Register with role "Talent" 
   - Automatic redirect to `/jobs` after login
   - Secure authentication with HTTP-only cookies

2. **Job Discovery**
   - Browse all active job listings
   - View detailed job descriptions
   - Apply to jobs you're interested in (prevents duplicate applications)

3. **Match Management**
   - View jobs matched to your profile in "My Matches"

### For Admins (HR/Recruiters)

1. **Admin Access**
   - Register with role "Admin"
   - Access comprehensive admin dashboard with analytics
   - Automatic redirect to `/admin/dashboard` after login

2. **Job Management**
   - Create new job postings with detailed requirements
   - Delete Job

3. **Talent Matching**
   - Create strategic matches between talents and suitable jobs

4. **Dashboard Analytics**
   - View platform statistics and insights
   - Access quick action shortcuts for common tasks

## 🔐 API Endpoints

### Authentication Routes
- `POST /api/auth/register` - User registration with role validation
- `POST /api/auth/login` - User login with role-based response
- `GET /api/auth/me` - Get current authenticated user (protected)
- `POST /api/auth/logout` - Secure logout with token invalidation

### Job Management Routes
- `GET /api/jobs` - Get all jobs (public access)
- `GET /api/jobs/:id` - Get detailed job information (public)
- `POST /api/jobs` - Create new job posting (admin only)
- `DELETE /api/jobs/:id` - Delete job posting (admin only)

### User Management Routes
- `GET /api/users` - Get All users (admin only)
- `GET /api/users?role=talent` - Filter users by role (admin only)
- `GET /api/users?role=admin` - Filter users by role (admin only)

### Match Management Routes
- `POST /api/matches` - Create job-talent match (admin only)
- `GET /api/matches/my-matches` - Get talent's matched jobs (talent only)

## 🔧 Development Guide

### Development Setup

1. **Prerequisites Check:**
   ```bash
   node --version  # Should be v18 or higher
   npm --version   # Should be v8 or higher
   ```

2. **Start Development Servers:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev     # Starts with nodemon on port 5000
   
   # Terminal 2 - Frontend  
   cd frontend
   npm run dev     # Starts with Turbopack on port 3000
   ```

3. **Access the Application:**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5000/api`
   - API Documentation: Available in TESTING.md

### Development Tools

**Useful npm Scripts:**
```bash
# Backend
npm run dev         # Development with nodemon
npm start          # Production server

# Frontend
npm run dev        # Next.js dev with Turbopack
npm run build      # Production build
npm run lint       # ESLint checking
```

**Environment Setup:**
- Backend uses nodemon for auto-reload
- Frontend uses Turbopack for fast refresh
- MongoDB Atlas connection with debug logging (can be toggled)
- JWT tokens with configurable expiration


## 🛡 Advanced Security Features

- **JWT Authentication**: Secure token-based authentication with HTTP-only cookies
- **Middleware Protection**: Server-side route protection using Next.js middleware  
- **Password Security**: bcrypt hashing with salt rounds for secure password storage
- **Role-based Access Control**: Granular permissions based on user roles (talent/admin)
- **Input Validation**: Comprehensive server-side validation using Joi and Zod schemas
- **CORS Protection**: Configured cross-origin requests with specific allowed origins
- **Security Headers**: Helmet.js for setting secure HTTP headers
- **Environment Variables**: Secure configuration management with dotenv
- **Token Expiration**: Configurable JWT expiration with automatic refresh
- **Protected Routes**: Both client-side and server-side route protection
- **SQL Injection Prevention**: Mongoose ODM with parameterized queries
- **XSS Protection**: Input sanitization and output encoding

## 🎨 Modern UI/UX Features

- **Glassmorphism Design**: Beautiful glass-effect UI with gradient backgrounds
- **Responsive Design**: Fully optimized for desktop, tablet, and mobile devices
- **Tailwind CSS v4**: Latest utility-first CSS framework with custom configurations
- **Interactive Components**: Smooth animations and hover effects throughout
- **Loading States**: Elegant loading indicators and skeleton screens
- **Toast Notifications**: Real-time user feedback with react-toastify
- **Role-based Navigation**: Dynamic navigation menus based on user permissions
- **Error Handling**: Comprehensive error states with helpful user messages
- **Form Validation**: Real-time client-side validation with visual feedback
- **Modern Icons**: Lucide React icon library for consistent iconography
- **Card-based Layout**: Clean, organized content presentation
- **Color-coded Elements**: Visual indicators for different job types and statuses
- **Accessibility**: WCAG compliant with proper ARIA labels and keyboard navigation
- **Dark Mode Ready**: Prepared for dark mode implementation

## 🚀 Production Deployment

### Frontend Deployment (Vercel Recommended)

**Vercel Deployment:**
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard:
   ```bash
   NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api
   NEXT_PUBLIC_APP_URL=https://your-frontend-domain.vercel.app
   ```
3. Deploy automatically on push to main branch

**Manual Build:**
```bash
cd frontend
npm run build
npm start
```

### Backend Deployment (Railway/Render/Heroku)

**Railway Deployment:**
1. Connect your GitHub repository to Railway
2. Set environment variables:
   ```bash
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/instollar
   JWT_SECRET=your-production-jwt-secret
   JWT_EXPIRE=7d
   ```

### Database Setup (MongoDB Atlas)
1. Create MongoDB Atlas cluster
2. Whitelist deployment server IPs
3. Create database user with read/write permissions
4. Update connection string in environment variables

### SSL/HTTPS Configuration
- Enable HTTPS for both frontend and backend
- Update CORS settings for production domains
- Configure secure cookie settings for production

## � Key Features Implemented

### ✅ Authentication System
- [x] JWT-based authentication with HTTP-only cookies
- [x] Role-based access control (Talent/Admin)
- [x] Server-side middleware protection
- [x] Automatic role-based redirects after login
- [x] Secure password hashing with bcrypt

### ✅ Job Management System  
- [x] Public job browsing with detailed views
- [x] Admin job creation, and deletion
- [x] Responsive job cards with modern design

### ✅ Matching & Application System
- [x] Admin-controlled job-talent matching
- [x] Duplicate application prevention
- [x] Match analytics and insights

### ✅ Modern Admin Dashboard
- [x] Glassmorphism design with gradient effects
- [x] Comprehensive platform analytics
- [x] User management capabilities
- [x] Quick action shortcuts
- [x] Recent activity monitoring

### ✅ Advanced UI/UX
- [x] Tailwind CSS v4 with custom styling
- [x] Fully responsive design
- [x] Loading states and error handling
- [x] Toast notifications
- [x] Modern iconography with Lucide React

## 📝 Contributing

1. **Fork the Repository**
   ```bash
   git clone https://github.com/yourusername/instollar.git
   cd instollar
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Development Setup**
   ```bash
   # Install dependencies
   cd backend && npm install
   cd ../frontend && npm install
   ```

4. **Make Changes & Test**
   ```bash
   cd backend && npm test
   # Test locally
   npm run dev
   ```

5. **Submit Pull Request**
   - Ensure all tests pass
   - Add tests for new features
   - Update documentation if needed
   - Submit PR with detailed description

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Support

For support or questions, please open an issue in the repository or contact the development team.

## 🏆 Project Achievements

- **Modern Tech Stack**: Built with the latest Next.js 15, React 19, and Node.js
- **Enterprise Architecture**: Implements clean architecture with repository and service patterns
- **Production Ready**: Comprehensive testing, security, and deployment configurations
- **Outstanding UI/UX**: Modern glassmorphism design with exceptional user experience
- **Scalable Design**: Modular architecture ready for future enhancements
- **Security First**: Multiple layers of security with industry best practices

## 📞 Support & Contact

- **GitHub Issues**: For bug reports and feature requests
- **Developer**: Joshua Oyewole
- **Project**: InstollConnect Job Matching Platform

---

**🚀 Built with passion using Next.js 15, Node.js, MongoDB Atlas, and modern web technologies**

*InstollConnect - Connecting talent with opportunity through intelligent job matching* ✨
