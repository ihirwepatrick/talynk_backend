# Talynk Backend Repository

Welcome to the **Talynk Backend** repository! This project powers the backend services for Talynk, a platform for emerging talents to showcase their skills via videos. The backend is built using **Node.js** and **PostgreSQL** and includes features such as user authentication, video management, and traceability.

## Features

### User Features
- 📱 Share images and videos
- 🏠 Browse approved content in home feed
- 👤 Personal profile management
- 📊 Track post status (pending/approved/rejected)
- 🔍 Filter content by categories
- ⏱️ Load more content functionality

### Admin Features
- ✅ Content moderation system
- 📺 Video watch-time verification (50% of video)
- ❌ Post rejection with reason
- 📁 Category management
- 📊 Post statistics dashboard

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **File Handling**: Multer for media uploads

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/talynk.git
cd talynk
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following:
```env
PORT=3000
DB_HOST=localhost
DB_USER=your_db_user
DB_PASS=your_db_password
DB_NAME=talynk_db
JWT_SECRET=your_jwt_secret
```

4. Set up the database:
```bash
npx sequelize-cli db:create
npx sequelize-cli db:migrate
```

5. Start the server:
```bash
npm start
```

## Project Structure

```
talynk/
├── src/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── app.js
├── public/
│   ├── css/
│   ├── js/
│   └── uploads/
├── .env
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Posts
- `GET /api/posts` - Get all posts (paginated)
- `POST /api/posts` - Create new post
- `GET /api/posts/pending` - Get pending posts (admin only)
- `GET /api/posts/approved` - Get approved posts
- `PATCH /api/posts/:id/approve` - Approve post (admin only)
- `PATCH /api/posts/:id/reject` - Reject post (admin only)
- `GET /api/posts/user/pending` - Get user's pending posts
- `GET /api/posts/user/approved` - Get user's approved posts
- `GET /api/posts/user/rejected` - Get user's rejected posts

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category (admin only)
- `PUT /api/categories/:id` - Update category (admin only)
- `DELETE /api/categories/:id` - Delete category (admin only)

### Admin Dashboard
- `GET /api/admin/stats` - Get platform statistics
- `GET /api/admin/users` - Get all users
- `PATCH /api/admin/users/:id` - Update user role

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Your Name - [@yourtwitter](https://twitter.com/yourtwitter)

Project Link: [https://github.com/yourusername/talynk](https://github.com/yourusername/talynk)
