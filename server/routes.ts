import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertVisitorSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Visitor routes
  app.post("/api/visitors", async (req, res) => {
    try {
      console.log('Received visitor data:', req.body);
      const validatedData = insertVisitorSchema.parse(req.body);
      console.log('Validated data:', validatedData);
      const visitor = await storage.createVisitor(validatedData);
      console.log('Created visitor:', visitor);
      res.json(visitor);
    } catch (error) {
      console.error('Error creating visitor:', error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: "Invalid visitor data" });
      }
    }
  });

  app.get("/api/visitors", async (req, res) => {
    try {
      const { date, search } = req.query;
      
      let visitors;
      if (search && typeof search === 'string') {
        visitors = await storage.searchVisitors(search);
      } else if (date && typeof date === 'string') {
        visitors = await storage.getVisitorsByDate(date);
      } else {
        visitors = await storage.getAllVisitors();
      }
      
      res.json(visitors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch visitors" });
    }
  });

  app.get("/api/visitors/:id", async (req, res) => {
    try {
      const visitor = await storage.getVisitor(req.params.id);
      if (!visitor) {
        return res.status(404).json({ message: "Visitor not found" });
      }
      res.json(visitor);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch visitor" });
    }
  });

  app.put("/api/visitors/:id", async (req, res) => {
    try {
      const visitor = await storage.updateVisitor(req.params.id, req.body);
      if (!visitor) {
        return res.status(404).json({ message: "Visitor not found" });
      }
      res.json(visitor);
    } catch (error) {
      res.status(500).json({ message: "Failed to update visitor" });
    }
  });

  app.delete("/api/visitors/:id", async (req, res) => {
    try {
      const success = await storage.deleteVisitor(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Visitor not found" });
      }
      res.json({ message: "Visitor deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete visitor" });
    }
  });

  // Statistics endpoint
  app.get("/api/statistics", async (req, res) => {
    try {
      const allVisitors = await storage.getAllVisitors();
      const today = new Date().toDateString();
      const todayVisitors = allVisitors.filter(v => 
        new Date(v.createdAt).toDateString() === today
      );

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const weekVisitors = allVisitors.filter(v => 
        new Date(v.createdAt) >= oneWeekAgo
      );

      const stats = {
        todayVisitors: todayVisitors.length,
        weekVisitors: weekVisitors.length,
        totalVisitors: allVisitors.length,
        avgDaily: Math.round(allVisitors.length / Math.max(1, 
          Math.ceil((Date.now() - new Date(allVisitors[allVisitors.length - 1]?.createdAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24))
        ))
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
