# Pharmacy College Management System (PCMS)

A comprehensive backend solution for managing pharmacy education institutions with real-time monitoring of students' academic and clinical activities, document management, QR code integration, and structured workflows.

## 🌟 Features

### User Management
- Four-tier hierarchical user system (Super Admin, Manager, Staff, Student)
- Multi-step registration with email verification
- Role-based access control with detailed permissions
- Profile management with role-specific fields

### Clinical Case Management
- Case submission with structured SOAP notes
- Workflow management with assignment, review, and evaluation
- Rich feedback mechanisms with rubric-based assessment
- Dynamic PDF report generation with QR codes

### Document Management
- Comprehensive document organization with categories & metadata
- Version control and tracking
- QR code integration for secure, instant access
- Fine-grained access control

### QR Code System
- Secure document and case report access
- Customizable QR code generation
- Access tracking and analytics

### Activity Logging
- Comprehensive audit trail
- Detailed event tracking for compliance
- Hierarchical log access based on user roles

### Dashboard & Analytics
- Role-specific dashboards
- Performance metrics and statistics
- Usage pattern visualization

## 🛠️ Technology Stack

- **Node.js** (v16+): Server-side JavaScript runtime
- **Express.js** (v4.18+): Web application framework
- **MongoDB** (v5+): NoSQL database with Mongoose ODM
- **JWT**: Authentication with refresh token rotation
- **bcrypt**: Secure password hashing
- **PDFKit**: Dynamic PDF generation
- **QRCode**: QR code generation for document access
- **Winston**: Advanced logging system
- **Joi**: Request validation

## 📋 Prerequisites

- Node.js v16 or higher
- MongoDB v5 or higher
- NPM or Yarn package manager

## 🚀 Getting Started

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/pharmacy-college-ms.git
   cd pharmacy-college-ms
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env file with your configuration
   ```

4. Create required directories:
   ```bash
   mkdir -p src/uploads/documents src/uploads/profiles src/uploads/reports src/logs
   ```

5. Start the application:

   **For development:**
   ```bash
   npm run dev
   ```

   **For production:**
   ```bash
   npm start
   ```

## ⚙️ Configuration

The main configuration files are located in the `src/config` directory:

- `app.config.js`: General application settings
- `auth.config.js`: Authentication and authorization
- `database.config.js`: MongoDB connection
- `logger.config.js`: Logging configuration
- `email.config.js`: Email service settings

## 📁 Project Structure

```
pharmacy-college-ms/
├── src/
│   ├── config/            # Configuration files
│   ├── constants/         # Application constants
│   ├── api/
│   │   └── v1/
│   │       ├── routes/    # API routes
│   │       ├── controllers/ # Controllers
│   │       ├── middleware/ # Middleware functions
│   │       └── validators/ # Request validation schemas
│   ├── models/            # MongoDB schemas
│   ├── services/          # Business logic
│   ├── repositories/      # Data access layer
│   ├── utils/             # Utility functions
│   ├── errors/            # Custom error classes
│   ├── templates/         # Email and PDF templates
│   ├── uploads/           # File upload storage
│   ├── logs/              # Application logs
│   ├── app.js             # Express application setup
│   └── server.js          # Server entry point
├── tests/                 # Test files
├── docs/                  # API documentation
├── package.json
└── .env.example
```

## 🔑 API Endpoints

The API is organized into the following resource groups:

- `/api/v1/auth`: Authentication and account management
- `/api/v1/users`: User management
- `/api/v1/cases`: Clinical case management
- `/api/v1/documents`: Document management
- `/api/v1/qrcodes`: QR code generation and access
- `/api/v1/logs`: Activity log access
- `/api/v1/dashboard`: Statistics and analytics
- `/api/v1/notifications`: User notifications

Detailed API documentation can be found in the `/docs` directory.

## 🔒 Security Features

- JWT authentication with refresh token rotation
- Password hashing with bcrypt
- Role-based access control
- Request validation and sanitization
- Rate limiting and CORS protection
- Secure headers with Helmet
- Comprehensive error handling and logging

## 🧪 Testing

Run tests using:

```bash
npm test
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support, email `hi@alwinsimon.com` or open an issue in the GitHub repository.
