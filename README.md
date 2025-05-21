# Spring Angular Authentication

A full-stack application demonstrating authentication and authorization using Spring Boot and Angular, including OAuth2 with Google.

## Features

- User registration and login
- JWT-based authentication
- OAuth2 authentication with Google
- Role-based authorization
- Secure password handling
- CORS configuration
- Form validation
- Responsive UI with Bootstrap

## Tech Stack

### Backend
- Java 17
- Spring Boot 3.2.3
- Spring Security
- Spring Data JPA
- H2 Database
- JWT  (JJWT library)
- OAuth2

### Frontend
- Angular 17
- TypeScript
- Bootstrap 5
- Font Awesome
- RxJS

## Prerequisites

- Java 17 or higher
- Node.js 14 or higher
- Maven
- Angular CLI

## Setup

### Backend Setup

1. H2 Database preloaded users :
   - admin@example.com      (admin role)
     moderator@example.com  (moderator role)
     user@example.com       (user role)

     password : test
   - H2 Database console administraion available at http://localhost:8080/h2-console  (no password)

2. Configure OAuth2:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project
   - Enable Google OAuth2 API
   - Create OAuth2 credentials
   - Add authorized redirect URIs:
     - `http://localhost:8080/oauth2/callback/google`
     - `http://localhost:4200/oauth2/callback/google`
   - Update `application.properties` with your Google OAuth2 credentials

3. Run the backend:
```bash
cd backend
mvn spring-boot:run
```

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Run the frontend:
```bash
ng serve
```

The application will be available at `http://localhost:4200`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/signin` - Login with username/password
- `GET /oauth2/authorization/google` - Initiate Google OAuth2 login
- `GET /api/auth/oauth2/success` - Handle OAuth2 success callback

### User Management
- `GET /api/test/user` - Get user profile (requires authentication)
- `GET /api/test/mod` - Moderator access (requires MODERATOR role)
- `GET /api/test/admin` - Admin access (requires ADMIN role)

## Security Features

- Password encryption using BCrypt
- JWT token-based authentication
- Role-based access control
- CORS configuration
- Form validation
- OAuth2 integration
- Secure session management

## Testing

### Backend Tests
```bash
cd backend
mvn test
```

### Frontend Tests
```bash
cd frontend
ng test
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Spring Security documentation](https://docs.spring.io/spring-security/reference/)
- [Angular documentation](https://angular.io/docs)
- [Bootstrap documentation](https://getbootstrap.com/docs/)
- [JWT.io](https://jwt.io/introduction)

## Author

Developed by **Karim AIT GHERGHERT (https://karim-ait-gherghert.com/)**