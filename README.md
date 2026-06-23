# Witter

A full-stack social media platform that allows users to create profiles, share content, upload images, and interact with a community-driven leaderboard. Built with Node.js, Express, MySQL, and AWS S3, Witter emphasizes secure authentication, responsive design, and modern web development practices.

## Live Demo

https://witter-d4c230a6736c.herokuapp.com/

## Features

### User Authentication

* Secure account registration and login
* Two-factor email verification
* Password encryption using bcrypt
* Session-based authentication

### User Profiles

* Customizable user profiles
* Profile pictures stored in AWS S3
* User bios and account management

### Social Features

* Create and share posts ("Wits")
* View community content
* Engage with other users
* Dynamic "Top Wits" leaderboard

### Media Uploads

* Upload profile pictures and content images
* Cloud storage powered by AWS S3
* Optimized image handling

### Responsive Design

* Desktop, tablet, and mobile support
* Mobile-first user experience
* Cross-browser compatibility

## Technology Stack

### Frontend

* HTML5
* CSS3
* Bootstrap
* JavaScript (ES6)
* jQuery
* AJAX

### Backend

* Node.js
* Express.js
* REST APIs
* Passport.js Authentication

### Database

* MySQL
* Sequelize ORM

### Cloud Services

* AWS S3

### Security

* bcrypt Password Hashing
* Session Authentication
* Email Verification

## Architecture

Client → Express Server → MySQL Database

```
                 ↘

                  AWS S3 Storage
```

## Installation

Clone the repository:

```bash
git clone https://github.com/JayPTucker/Witter.git
```

Navigate into the project:

```bash
cd Witter
```

Install dependencies:

```bash
npm install
```

Create a `.env` file and configure:

```env
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_BUCKET_NAME=

EMAIL_USER=
EMAIL_PASSWORD=
SESSION_SECRET=
```

Start the application:

```bash
npm start
```

## Learning Outcomes

This project was built to strengthen skills in:

* Full-stack application development
* RESTful API design
* Database modeling with MySQL
* Authentication and authorization
* AWS cloud services
* Secure user account management
* Responsive web design

## Future Enhancements

* Real-time notifications
* Direct messaging
* Dark mode
* Progressive Web App support
* React frontend migration

## Author

Jay Paul Tucker

Portfolio: https://jayptucker.com

GitHub: https://github.com/JayPTucker

LinkedIn: https://www.linkedin.com/in/jayptucker

## License

This project is licensed under the MIT License.
