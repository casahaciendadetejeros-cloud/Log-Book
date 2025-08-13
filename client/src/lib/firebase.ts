import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, where, doc, deleteDoc, updateDoc, Timestamp } from 'firebase/firestore';
import type { Visitor, InsertVisitor, User, InsertUser } from '@shared/schema';

// Firebase configuration - these are CLIENT-SAFE values
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDFqT1CG7GA66bwZkjZsayc5YlQkUp-U08",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "touristlogbook.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "touristlogbook",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "touristlogbook.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "337366190974",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:337366190974:web:393efbeec645ba1866412f",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-9S157H1N94"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Collections
const visitorsCollection = collection(db, 'visitors');
const usersCollection = collection(db, 'users');

// Visitor Operations
export const visitorAPI = {
  // Create new visitor
  async createVisitor(visitorData: InsertVisitor): Promise<Visitor> {
    try {
      // Generate control number
      const year = new Date().getFullYear();
      const timestamp = Date.now();
      const controlNumber = `#TL-${year}-${timestamp.toString().slice(-6)}`;

      const visitor = {
        ...visitorData,
        controlNumber,
        createdAt: Timestamp.now(),
      };

      const docRef = await addDoc(visitorsCollection, visitor);
      return { 
        id: docRef.id, 
        ...visitor,
        createdAt: visitor.createdAt.toDate()
      } as Visitor;
    } catch (error) {
      console.error('Error creating visitor:', error);
      throw new Error('Failed to create visitor');
    }
  },

  // Get all visitors
  async getAllVisitors(): Promise<Visitor[]> {
    try {
      const q = query(visitorsCollection, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Visitor[];
    } catch (error) {
      console.error('Error fetching visitors:', error);
      return [];
    }
  },

  // Get visitors by date
  async getVisitorsByDate(date: string): Promise<Visitor[]> {
    try {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

      const q = query(
        visitorsCollection,
        where('createdAt', '>=', Timestamp.fromDate(startOfDay)),
        where('createdAt', '<=', Timestamp.fromDate(endOfDay)),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Visitor[];
    } catch (error) {
      console.error('Error fetching visitors by date:', error);
      return [];
    }
  },

  // Search visitors
  async searchVisitors(searchQuery: string): Promise<Visitor[]> {
    try {
      const allVisitors = await this.getAllVisitors();
      const lowercaseQuery = searchQuery.toLowerCase();
      const cleanQuery = searchQuery.replace(/[\s\-\(\)\+]/g, '');
      
      return allVisitors.filter((visitor) =>
        visitor.name.toLowerCase().includes(lowercaseQuery) ||
        visitor.email.toLowerCase().includes(lowercaseQuery) ||
        visitor.phone.replace(/[\s\-\(\)\+]/g, '').includes(cleanQuery) ||
        visitor.controlNumber.toLowerCase().includes(lowercaseQuery)
      );
    } catch (error) {
      console.error('Error searching visitors:', error);
      return [];
    }
  },

  // Delete visitor
  async deleteVisitor(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'visitors', id));
      return true;
    } catch (error) {
      console.error('Error deleting visitor:', error);
      return false;
    }
  },

  // Update visitor
  async updateVisitor(id: string, updates: Partial<Visitor>): Promise<Visitor | null> {
    try {
      const docRef = doc(db, 'visitors', id);
      await updateDoc(docRef, updates);
      
      // Get updated document
      const updatedDoc = await getDocs(query(visitorsCollection, where('__name__', '==', id)));
      if (!updatedDoc.empty) {
        const data = updatedDoc.docs[0].data();
        return {
          id: updatedDoc.docs[0].id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as Visitor;
      }
      return null;
    } catch (error) {
      console.error('Error updating visitor:', error);
      return null;
    }
  }
};

// User Operations
export const userAPI = {
  // Create user
  async createUser(userData: InsertUser): Promise<User> {
    try {
      const user = {
        ...userData,
        createdAt: Timestamp.now(),
      };
      const docRef = await addDoc(usersCollection, user);
      return { id: docRef.id, ...user } as User;
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  },

  // Get user by username
  async getUserByUsername(username: string): Promise<User | null> {
    try {
      const q = query(usersCollection, where('username', '==', username));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() } as User;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }
};

// Statistics
export const statisticsAPI = {
  async getStatistics() {
    try {
      const allVisitors = await visitorAPI.getAllVisitors();
      const today = new Date().toDateString();
      
      const todayVisitors = allVisitors.filter(v => 
        new Date(v.createdAt).toDateString() === today
      );

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const weekVisitors = allVisitors.filter(v => 
        new Date(v.createdAt) >= oneWeekAgo
      );

      return {
        todayVisitors: todayVisitors.length,
        weekVisitors: weekVisitors.length,
        totalVisitors: allVisitors.length,
        avgDaily: Math.round(allVisitors.length / Math.max(1, 
          Math.ceil((Date.now() - new Date(allVisitors[allVisitors.length - 1]?.createdAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24))
        ))
      };
    } catch (error) {
      console.error('Error fetching statistics:', error);
      return {
        todayVisitors: 0,
        weekVisitors: 0,
        totalVisitors: 0,
        avgDaily: 0
      };
    }
  }
}; 