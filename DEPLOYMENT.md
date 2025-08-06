# Firebase Deployment Guide

This guide will help you deploy your Tourist Log Book system to Firebase, making it accessible via a live URL.

## Prerequisites

1. **Firebase CLI**: Make sure you have Firebase CLI installed globally
2. **Firebase Project**: You should have access to the "touristlogbook" Firebase project
3. **Authentication**: You need to be logged into Firebase CLI

## Deployment Steps

### 1. Login to Firebase CLI
```bash
firebase login
```

### 2. Build the Application
```bash
npm run build
```

### 3. Install Functions Dependencies
```bash
cd functions
npm install
npm run build
cd ..
```

### 4. Deploy to Firebase
```bash
firebase deploy
```

## What Gets Deployed

### Frontend (Firebase Hosting)
- **Static Website**: Your React frontend will be hosted on Firebase Hosting
- **Live URL**: You'll get a URL like `https://touristlogbook.web.app`
- **Custom Domain**: You can later configure a custom domain if needed

### Backend (Firebase Functions)
- **API Endpoints**: All your backend API routes will be available as Firebase Functions
- **Automatic Scaling**: Firebase Functions scale automatically based on usage
- **Serverless**: No server management required

### Database (Firestore)
- **Real-time Database**: All visitor data will be stored in Firestore
- **Automatic Backups**: Firebase handles backups automatically
- **Real-time Updates**: Data syncs in real-time across all users

## API Endpoints After Deployment

Once deployed, your API will be available at:
- `https://touristlogbook.web.app/api/visitors` - Create and get visitors
- `https://touristlogbook.web.app/api/statistics` - Get visitor statistics
- `https://touristlogbook.web.app/api/users` - User management

## Frontend Features

- **Tourist Registration Form**: Available at the root URL
- **Admin Dashboard**: Accessible via `/admin` path
- **Admin Login**: Available at `/admin/login`

## Post-Deployment

1. **Test the Application**: Visit your live URL and test all features
2. **Monitor Usage**: Use Firebase Console to monitor usage and performance
3. **Configure Custom Domain**: (Optional) Set up a custom domain in Firebase Hosting settings

## Environment Variables

The deployed version will automatically use:
- **Firebase Project ID**: touristlogbook
- **Service Account**: Configured in Firebase Functions environment
- **Database**: Firestore collections (visitors, users)

## Troubleshooting

If deployment fails:
1. Check that you're logged into the correct Firebase account
2. Verify you have access to the "touristlogbook" project
3. Ensure all dependencies are installed
4. Check the Firebase Console for any error messages

## Updates

To deploy updates:
1. Make your code changes
2. Run `npm run build`
3. Run `firebase deploy`

Your live application will be updated within minutes.