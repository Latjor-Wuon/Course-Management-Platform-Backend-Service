# Course Management Platform Backend Service

A comprehensive, role-based backend system for managing academic courses, tracking facilitator activities, and supporting student engagement with internationalization support.

## 🚀 Features

### Module 1: Course Allocation System
- **Role-based Access Control**: Managers can perform CRUD operations, Facilitators can view assigned courses
- **Complete Data Models**: Users, Courses, Cohorts, Classes, Students, CourseOfferings, Modes
- **Advanced Filtering**: Filter by trimester, intake, facilitator, mode, etc.
- **Secure Authentication**: JWT-based authentication with bcrypt password hashing

### Module 2: Facilitator Activity Tracker (FAT)
- **Weekly Activity Logging**: Facilitators log detailed weekly course activities
- **Redis-Based Notifications**: Automated deadline reminders and late submission alerts
- **Manager Monitoring**: Real-time tracking of submission status and notifications
- **Background Workers**: Asynchronous task processing with Bull queue

### Module 3: Student Reflection Page (i18n/l10n)
- **Multilingual Support**: English and French translations
- **Interactive Interface**: Modern, responsive design with dark/light themes
- **Local Storage**: Auto-save drafts and progress tracking
- **Accessibility**: Full keyboard navigation and screen reader support
- **GitHub Pages**: Available at `https://[username].github.io/[repo-name]/`

## 🌐 Live Demo

**Student Reflection Portal**: Available via GitHub Pages (see deployment instructions below)

## 🛠 Technology Stack

- **Backend Framework**: Node.js with Express.js
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT tokens with bcrypt password hashing
- **Message Queue**: Redis with Bull for background job processing
- **Internationalization**: i18next for backend, custom solution for frontend
- **API Documentation**: Swagger/OpenAPI 3.0
- **Testing**: Jest with comprehensive unit tests
- **Security**: Helmet, CORS, Rate limiting, Input validation

## 📁 Project Structure

```
├── src/
│   ├── app.js                 # Main application entry point
│   ├── config/                # Configuration files
│   │   ├── database.js        # Database configuration
│   │   ├── redis.js           # Redis configuration
│   │   ├── swagger.js         # API documentation setup
│   │   └── i18n.js            # Internationalization setup
│   ├── models/                # Sequelize models
│   │   ├── User.js            # User model with authentication
│   │   ├── Course.js          # Course model
│   │   ├── Cohort.js          # Cohort model
│   │   ├── Class.js           # Class model
│   │   ├── Student.js         # Student model
│   │   ├── CourseOffering.js  # Course offering model
│   │   ├── ActivityTracker.js # Activity tracking model
│   │   ├── Mode.js            # Delivery mode model
│   │   └── index.js           # Model associations
│   ├── routes/                # Express routes
│   │   ├── auth.js            # Authentication routes
│   │   ├── courses.js         # Course management routes
│   │   ├── activities.js      # Activity tracking routes
│   │   └── users.js           # User management routes
│   ├── middleware/            # Custom middleware
│   │   ├── auth.js            # Authentication middleware
│   │   ├── errorHandler.js    # Global error handling
│   │   └── validation.js      # Input validation
│   ├── services/              # Business logic services
│   │   ├── notificationService.js # Redis queue management
│   │   └── emailService.js    # Email notification service
│   ├── workers/               # Background workers
│   │   └── notificationWorker.js # Queue job processor
│   └── locales/               # Translation files
│       ├── en/translation.json # English translations
│       └── fr/translation.json # French translations
├── public/reflection/         # Student reflection page (Module 3)
│   ├── index.html            # Main HTML page
│   ├── styles.css            # Responsive CSS styles
│   ├── script.js             # Interactive JavaScript
│   └── translations.js       # Client-side translations
├── tests/                    # Unit tests
│   ├── models/               # Model tests
│   └── utils/                # Utility function tests
├── config/                   # Sequelize CLI configuration
├── seeders/                  # Database seeders
└── package.json              # Dependencies and scripts
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- Redis (v6.0 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd course-management-platform-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=course_management
   DB_DIALECT=mysql

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRES_IN=7d

   # Redis Configuration
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=

   # Server Configuration
   PORT=3000
   NODE_ENV=development
   ```

4. **Database setup**
   ```bash
   # Create database
   mysql -u root -p -e "CREATE DATABASE course_management;"
   
   # Run migrations
   npm run db:migrate
   
   # Seed with sample data
   npm run db:seed
   ```

5. **Start Redis server**
   ```bash
   redis-server
   ```

6. **Start the application**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

The server will start on `http://localhost:3000`

## 📊 API Documentation

Once the server is running, visit `http://localhost:3000/api-docs` for interactive Swagger documentation.

### Sample API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/logout` - User logout

#### Course Management
- `GET /api/courses` - Get all courses (with filtering)
- `POST /api/courses` - Create new course (Managers only)
- `GET /api/courses/:id` - Get course details
- `PUT /api/courses/:id` - Update course (Managers only)
- `DELETE /api/courses/:id` - Delete course (Managers only)

#### Course Offerings
- `GET /api/courses/offerings` - Get course offerings (with filtering)
- `POST /api/courses/offerings` - Create course offering (Managers only)

#### Activity Tracking
- `GET /api/activities` - Get activity trackers
- `POST /api/activities` - Create activity log (Facilitators only)
- `PUT /api/activities/:id` - Update activity log (Facilitators only)
- `GET /api/activities/overview` - Get activity overview (Managers only)

#### User Management
- `GET /api/users` - Get all users (Managers only)
- `GET /api/users/facilitators` - Get all facilitators
- `GET /api/users/students` - Get all students (Managers only)
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user profile

## 🔐 Authentication & Authorization

### User Roles

1. **Manager**
   - Full CRUD access to courses and course offerings
   - View all users and activity tracking data
   - Receive notifications about late submissions

2. **Facilitator**
   - View assigned courses only
   - Log weekly activities for assigned courses
   - Receive deadline reminders

3. **Student**
   - Access to reflection page
   - View own profile

### Sample Credentials

After running the seed script, you can use these test accounts:

```
Manager:
Email: manager@coursemanagement.com
Password: ManagerPass123!

Facilitator:
Email: facilitator1@coursemanagement.com
Password: FacilitatorPass123!

Student:
Email: student1@coursemanagement.com
Password: StudentPass123!
```

## 📬 Redis Queue System

The system uses Redis-based message queues for:

- **Deadline Reminders**: Sent 24 hours before activity log due dates
- **Late Submission Alerts**: Sent to managers when logs are not submitted on time
- **Course Assignment Notifications**: Sent when facilitators are assigned to new courses
- **Weekly Reminders**: Sent every Friday to remind facilitators about weekly logs

### Queue Monitoring

To monitor queue jobs, you can use Redis CLI:
```bash
redis-cli
> KEYS "*bull*"
> LLEN "bull:notification processing:waiting"
```

## 🌍 Internationalization (i18n)

The system supports multiple languages:

### Backend i18n
- Translation files located in `src/locales/`
- Automatic language detection from `Accept-Language` header
- Support for English (en) and French (fr)

### Frontend i18n (Reflection Page)
- Client-side translation system
- Language preference saved in localStorage
- Real-time language switching

## 🧪 Testing

Run the comprehensive test suite:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Coverage

The project includes unit tests for:
- User model validation and authentication
- Course model CRUD operations
- Activity tracker functionality
- Authentication utilities
- Authorization middleware

## 🔧 Development

### Development Scripts

```bash
npm run dev          # Start development server with nodemon
npm run start        # Start production server
npm test             # Run test suite
npm run test:coverage # Run tests with coverage report
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with sample data
npm run db:reset     # Reset database (drop, create, migrate, seed)
```

### Adding New Features

1. **Create Models**: Add new Sequelize models in `src/models/`
2. **Add Routes**: Create new route files in `src/routes/`
3. **Update Documentation**: Add Swagger comments for new endpoints
4. **Write Tests**: Add unit tests in `tests/` directory
5. **Update Translations**: Add new translation keys in locale files

## 🚦 Error Handling

The application includes comprehensive error handling:

- **Global Error Middleware**: Catches and formats all errors
- **Validation Errors**: Detailed field-level validation messages
- **Authentication Errors**: Clear authorization failure messages
- **Database Errors**: Handles connection and constraint violations
- **Rate Limiting**: Prevents API abuse

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Configurable request limits
- **CORS Protection**: Cross-origin request security
- **Helmet**: Security headers middleware
- **Input Validation**: Comprehensive request validation
- **SQL Injection Prevention**: Sequelize ORM protection

## 📱 Student Reflection Page

Access the multilingual student reflection page at:
`http://localhost:3000/reflection`

### Features:
- **Responsive Design**: Works on all device sizes
- **Auto-save**: Drafts saved automatically
- **Progress Tracking**: Shows reflection statistics
- **Language Toggle**: Switch between English and French
- **Keyboard Shortcuts**: Ctrl+S to save, Escape to close modals

## 🌐 Production Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3000
DB_HOST=your-production-db-host
DB_USER=your-production-db-user
DB_PASSWORD=your-production-db-password
DB_NAME=course_management_prod
REDIS_HOST=your-production-redis-host
JWT_SECRET=your-super-secure-production-jwt-secret
EMAIL_HOST=your-smtp-host
EMAIL_USER=your-smtp-user
EMAIL_PASS=your-smtp-password
```

### Deployment Checklist

- [ ] Set up production MySQL database
- [ ] Configure production Redis instance
- [ ] Set secure JWT secret
- [ ] Configure SMTP for email notifications
- [ ] Set up SSL/TLS certificates
- [ ] Configure reverse proxy (nginx/Apache)
- [ ] Set up monitoring and logging
- [ ] Configure backup strategies

## 🚀 GitHub Pages Deployment (Student Reflection Page)

The Student Reflection Page can be deployed to GitHub Pages for public access:

### Quick Setup:
1. **Push your repository to GitHub**
2. **Go to Repository Settings → Pages**
3. **Select source: "Deploy from a branch"**
4. **Choose: Branch "main" + Folder "/docs"**
5. **Click "Save"**

### Your live page will be available at:
`https://[your-username].github.io/[repository-name]/`

### Features available on GitHub Pages:
- ✅ Multilingual student reflection portal (English/French)
- ✅ Responsive design with dark/light themes
- ✅ Auto-save functionality using localStorage
- ✅ Progress tracking and word count
- ✅ Accessibility features
- ✅ Keyboard shortcuts (Ctrl+S to save, Escape to close)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes and add tests
4. Commit your changes: `git commit -m 'Add new feature'`
5. Push to the branch: `git push origin feature/new-feature`
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Email: support@coursemanagement.com
- Documentation: `http://localhost:3000/api-docs`

---

## 📊 Health Check

Visit `http://localhost:3000/health` to check server status and uptime.

**Happy Coding! 🎓**
