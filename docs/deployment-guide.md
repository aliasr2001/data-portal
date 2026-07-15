# Deployment guide

This project has three parts:

- Frontend: React + Vite
- Backend: Express + Mongoose
- Database: MongoDB Atlas

## Recommended free hosting

### Frontend
- Vercel
- Netlify

### Backend
- Render
- Railway

### Database
- MongoDB Atlas (free tier)

## 1. Prepare MongoDB Atlas

1. Create a free MongoDB Atlas account.
2. Create a cluster.
3. Create a database user.
4. Get the connection string.

Example:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/data-portal?retryWrites=true&w=majority
```

## 2. Deploy the backend

### Recommended: Render

1. Create a new Web Service on Render.
2. Connect your GitHub repository.
3. Set the root directory to your project root.
4. Use this start command:

```bash
node server/server.js
```

5. Add environment variables:

```env
PORT=5001
MONGODB_URI=your_mongodb_connection_string
NODE_ENV=production
```

6. Deploy.

Render will give you a public backend URL such as:

```text
https://your-backend-app.onrender.com
```

## 3. Deploy the frontend

### Recommended: Vercel

1. Create a new Vercel project.
2. Connect your GitHub repository.
3. Set the build command:

```bash
npm run build
```

4. Set the output directory:

```text
dist
```

5. Add environment variables:

```env
VITE_API_URL=https://your-backend-app.onrender.com
```

6. Deploy.

## 4. CORS configuration

The backend currently uses CORS permissively in [server/server.js](server/server.js). In production, it is better to limit it to your frontend origin.

For example:

```js
app.use(cors({
  origin: 'https://your-frontend-app.vercel.app'
}));
```

## 5. Important production note

The Vite proxy in [vite.config.js](vite.config.js) only works in local development.

In production, the frontend must use the backend URL through the VITE_API_URL environment variable.

## 6. Final test checklist

- Backend health check works
- MongoDB connection is successful
- Frontend can reach the backend API
- CV upload works
- Social connection save works
- Thank-you flow works

## 7. Common issues

### Frontend shows API errors
- Check that VITE_API_URL is set correctly.
- Make sure the backend URL is reachable.

### Backend cannot connect to MongoDB
- Check the MONGODB_URI value.
- Make sure your IP is allowed in Atlas Network Access.

### CORS error
- Add the frontend domain to the backend CORS allowlist.
