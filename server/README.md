# College Website Backend

Node.js backend API for the college website built with Express.js, MongoDB, and modern security practices.

## 🚀 Quick Start

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Setup environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:

   ```env
   MONGO_URI=mongodb://localhost:27017/collegewebsite
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
server/
├── config/             # Configuration files
│   └── database.js     # MongoDB connection
├── controllers/        # Route handlers
│   ├── contactController.js
│   ├── galleryController.js
│   ├── newsController.js
│   └── pageController.js
├── models/             # MongoDB models
│   ├── Contact.js
│   ├── Gallery.js
│   ├── News.js
│   └── PageContent.js
├── routes/             # API routes
│   ├── contact.js
│   ├── gallery.js
│   ├── news.js
│   └── pages.js
├── uploads/            # File upload directory
├── .env.example        # Environment variables template
├── package.json        # Dependencies and scripts
└── server.js           # Main server file
```

## 🔌 API Endpoints

### News

- `GET /api/news` - Get all published news
- `GET /api/news/:id` - Get single news item

### Gallery

- `GET /api/gallery` - Get all gallery images
- `GET /api/gallery/:id` - Get single gallery image

### Contact

- `POST /api/contact` - Submit contact form

### Page Content

- `GET /api/pages/:pageId` - Get page content

### Health Check

- `GET /api/health` - Server health status

## 🗄️ Database Models

### News

```javascript
{
  title: String,
  content: String,
  excerpt: String,
  category: Enum,
  status: Enum,
  featured: Boolean,
  image: Object,
  publishDate: Date,
  eventDate: Date,
  tags: [String],
  views: Number,
  slug: String
}
```

### Gallery

```javascript
{
  title: String,
  description: String,
  image: Object,
  category: Enum,
  tags: [String],
  isActive: Boolean,
  displayOrder: Number
}
```

### Contact

```javascript
{
  name: String,
  email: String,
  phone: String,
  subject: String,
  message: String,
  status: Enum,
  priority: Enum,
  category: Enum,
  ipAddress: String,
  userAgent: String
}
```

### PageContent

```javascript
{
  pageId: String,
  title: String,
  content: Map,
  metaData: Object,
  isActive: Boolean,
  version: Number
}
```

## 🛡️ Security Features

- **Rate Limiting** - Prevents API abuse
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Input Validation** - Data sanitization
- **Environment Variables** - Secret management

## 🛠️ Development Commands

```bash
# Development with nodemon
npm run dev

# Production
npm start

# Check dependencies
npm audit
```

## 🌐 Environment Variables

| Variable     | Description               | Required | Default               |
| ------------ | ------------------------- | -------- | --------------------- |
| `MONGO_URI`  | MongoDB connection string | Yes      | -                     |
| `PORT`       | Server port               | No       | 5000                  |
| `NODE_ENV`   | Environment mode          | No       | development           |
| `CLIENT_URL` | Frontend URL for CORS     | No       | http://localhost:5173 |

## 📊 API Response Format

### Success Response

```json
{
  "success": true,
  "data": {},
  "message": "Optional message",
  "count": 10,
  "total": 100,
  "currentPage": 1,
  "totalPages": 10
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description"
}
```

## 🚀 Deployment

### Environment Setup

1. Set production environment variables
2. Ensure MongoDB connection
3. Configure CORS for production domain

### Production Considerations

- Use MongoDB Atlas for database
- Set NODE_ENV=production
- Configure proper CORS origins
- Enable compression middleware
- Set up proper logging

## 📈 Monitoring

The API includes:

- Health check endpoint (`/api/health`)
- Error logging to console
- Rate limiting with configurable windows
- CORS configuration for security

Built with Express.js and MongoDB for scalable, secure API operations.
