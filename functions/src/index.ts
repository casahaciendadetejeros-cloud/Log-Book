import { onRequest } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import express from 'express';
import { z } from 'zod';

// Initialize Firebase Admin
initializeApp();
const db = getFirestore();

// Define schemas
const insertVisitorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email format")
});

const insertUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required")
});

// Create Express app
const app = express();
app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Visitor routes
app.post('/visitors', async (req, res) => {
  try {
    const validatedData = insertVisitorSchema.parse(req.body);
    
    // Generate control number
    const year = new Date().getFullYear();
    const visitorsRef = db.collection('visitors');
    const snapshot = await visitorsRef.count().get();
    const controlNumber = `#TL-${year}-${(snapshot.data().count + 1).toString().padStart(3, '0')}`;
    
    const visitorData = {
      ...validatedData,
      controlNumber,
      createdAt: new Date(),
    };
    
    const docRef = await visitorsRef.add(visitorData);
    const visitor = { id: docRef.id, ...visitorData };
    
    res.json(visitor);
  } catch (error) {
    console.error('Error creating visitor:', error);
    res.status(400).json({ message: error instanceof Error ? error.message : 'Invalid visitor data' });
  }
});

app.get('/visitors', async (req, res) => {
  try {
    const { date, search } = req.query;
    const visitorsRef = db.collection('visitors');
    let query = visitorsRef.orderBy('createdAt', 'desc');
    
    if (search && typeof search === 'string') {
      // Simple search implementation
      const snapshot = await query.get();
      const visitors = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(visitor => 
          visitor.name?.toLowerCase().includes(search.toLowerCase()) ||
          visitor.phone?.includes(search) ||
          visitor.email?.toLowerCase().includes(search.toLowerCase()) ||
          visitor.controlNumber?.includes(search)
        );
      res.json(visitors);
    } else if (date && typeof date === 'string') {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      const snapshot = await query
        .where('createdAt', '>=', startOfDay)
        .where('createdAt', '<=', endOfDay)
        .get();
      
      const visitors = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(visitors);
    } else {
      const snapshot = await query.get();
      const visitors = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(visitors);
    }
  } catch (error) {
    console.error('Error fetching visitors:', error);
    res.status(500).json({ message: 'Failed to fetch visitors' });
  }
});

app.get('/visitors/:id', async (req, res) => {
  try {
    const doc = await db.collection('visitors').doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ message: 'Visitor not found' });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Error fetching visitor:', error);
    res.status(500).json({ message: 'Failed to fetch visitor' });
  }
});

// Statistics route
app.get('/statistics', async (req, res) => {
  try {
    const visitorsRef = db.collection('visitors');
    
    // Today's visitors
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todaySnapshot = await visitorsRef
      .where('createdAt', '>=', today)
      .where('createdAt', '<', tomorrow)
      .count()
      .get();
    
    // This week's visitors
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);
    
    const weekSnapshot = await visitorsRef
      .where('createdAt', '>=', weekAgo)
      .count()
      .get();
    
    // Total visitors
    const totalSnapshot = await visitorsRef.count().get();
    
    res.json({
      todayVisitors: todaySnapshot.data().count,
      weekVisitors: weekSnapshot.data().count,
      totalVisitors: totalSnapshot.data().count
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ message: 'Failed to fetch statistics' });
  }
});

// User authentication routes
app.post('/users', async (req, res) => {
  try {
    const validatedData = insertUserSchema.parse(req.body);
    const docRef = await db.collection('users').add({
      ...validatedData,
      createdAt: new Date()
    });
    res.json({ id: docRef.id, username: validatedData.username });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(400).json({ message: error instanceof Error ? error.message : 'Invalid user data' });
  }
});

app.get('/users/:username', async (req, res) => {
  try {
    const snapshot = await db.collection('users')
      .where('username', '==', req.params.username)
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const doc = snapshot.docs[0];
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});

// Export the Express app as a Firebase Function
export const api = onRequest(app);