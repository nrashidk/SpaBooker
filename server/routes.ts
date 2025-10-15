import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin } from "./replitAuth";
import {
  insertSpaSettingsSchema,
  insertServiceCategorySchema,
  insertServiceSchema,
  insertStaffSchema,
  insertStaffScheduleSchema,
  insertProductSchema,
  insertCustomerSchema,
  insertBookingSchema,
  insertBookingItemSchema,
} from "@shared/schema";

// Helper function for consistent error handling
function handleRouteError(res: any, error: any, message: string) {
  if (error.name === "ZodError") {
    return res.status(400).json({ message: "Validation error", errors: error.errors });
  }
  console.error(message, error);
  res.status(500).json({ message });
}

// Helper function to parse and validate numeric ID params
function parseNumericId(param: string): number | null {
  const id = parseInt(param);
  return Number.isFinite(id) ? id : null;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware setup
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Public search endpoint for finding spas
  app.get("/api/search/spas", async (req, res) => {
    try {
      const { search, location, date, time } = req.query;
      
      const searchParams = {
        search: search as string | undefined,
        location: location as string | undefined,
        date: date as string | undefined,
        time: time as string | undefined,
      };
      
      const results = await storage.searchSpas(searchParams);
      res.json(results);
    } catch (error) {
      handleRouteError(res, error, "Failed to search spas");
    }
  });

  // Admin-only routes (protected with isAdmin middleware)
  app.get("/api/admin/check", isAdmin, async (req, res) => {
    res.json({ message: "Admin access granted" });
  });

  // Spa Settings routes
  app.get("/api/admin/settings", isAdmin, async (req, res) => {
    try {
      const settings = await storage.getSpaSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching spa settings:", error);
      res.status(500).json({ message: "Failed to fetch spa settings" });
    }
  });

  app.put("/api/admin/settings", isAdmin, async (req, res) => {
    try {
      const validatedData = insertSpaSettingsSchema.parse(req.body);
      const settings = await storage.updateSpaSettings(validatedData);
      res.json(settings);
    } catch (error) {
      console.error("Error updating spa settings:", error);
      res.status(500).json({ message: "Failed to update spa settings" });
    }
  });

  // Service Category routes
  app.get("/api/admin/service-categories", isAdmin, async (req, res) => {
    try {
      const categories = await storage.getAllServiceCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching service categories:", error);
      res.status(500).json({ message: "Failed to fetch service categories" });
    }
  });

  app.post("/api/admin/service-categories", isAdmin, async (req, res) => {
    try {
      const validatedData = insertServiceCategorySchema.parse(req.body);
      const category = await storage.createServiceCategory(validatedData);
      res.json(category);
    } catch (error) {
      console.error("Error creating service category:", error);
      res.status(500).json({ message: "Failed to create service category" });
    }
  });

  app.put("/api/admin/service-categories/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertServiceCategorySchema.partial().parse(req.body);
      const category = await storage.updateServiceCategory(id, validatedData);
      if (!category) {
        return res.status(404).json({ message: "Service category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Error updating service category:", error);
      res.status(500).json({ message: "Failed to update service category" });
    }
  });

  app.delete("/api/admin/service-categories/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteServiceCategory(id);
      if (!deleted) {
        return res.status(404).json({ message: "Service category not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting service category:", error);
      res.status(500).json({ message: "Failed to delete service category" });
    }
  });

  // Service routes
  app.get("/api/admin/services", isAdmin, async (req, res) => {
    try {
      const services = await storage.getAllServices();
      res.json(services);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  app.post("/api/admin/services", isAdmin, async (req, res) => {
    try {
      const validatedData = insertServiceSchema.parse(req.body);
      const service = await storage.createService(validatedData);
      res.json(service);
    } catch (error) {
      console.error("Error creating service:", error);
      res.status(500).json({ message: "Failed to create service" });
    }
  });

  app.put("/api/admin/services/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertServiceSchema.partial().parse(req.body);
      const service = await storage.updateService(id, validatedData);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      res.json(service);
    } catch (error) {
      console.error("Error updating service:", error);
      res.status(500).json({ message: "Failed to update service" });
    }
  });

  app.delete("/api/admin/services/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteService(id);
      if (!deleted) {
        return res.status(404).json({ message: "Service not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting service:", error);
      res.status(500).json({ message: "Failed to delete service" });
    }
  });

  // Staff routes
  app.get("/api/admin/staff", isAdmin, async (req, res) => {
    try {
      const staff = await storage.getAllStaff();
      res.json(staff);
    } catch (error) {
      console.error("Error fetching staff:", error);
      res.status(500).json({ message: "Failed to fetch staff" });
    }
  });

  app.post("/api/admin/staff", isAdmin, async (req, res) => {
    try {
      const validatedData = insertStaffSchema.parse(req.body);
      const staffMember = await storage.createStaff(validatedData);
      res.json(staffMember);
    } catch (error) {
      console.error("Error creating staff member:", error);
      res.status(500).json({ message: "Failed to create staff member" });
    }
  });

  app.put("/api/admin/staff/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertStaffSchema.partial().parse(req.body);
      const staffMember = await storage.updateStaff(id, validatedData);
      if (!staffMember) {
        return res.status(404).json({ message: "Staff member not found" });
      }
      res.json(staffMember);
    } catch (error) {
      console.error("Error updating staff member:", error);
      res.status(500).json({ message: "Failed to update staff member" });
    }
  });

  app.delete("/api/admin/staff/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteStaff(id);
      if (!deleted) {
        return res.status(404).json({ message: "Staff member not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting staff member:", error);
      res.status(500).json({ message: "Failed to delete staff member" });
    }
  });

  // Staff Schedule routes
  app.get("/api/admin/staff/:staffId/schedules", isAdmin, async (req, res) => {
    try {
      const staffId = parseInt(req.params.staffId);
      const schedules = await storage.getStaffSchedules(staffId);
      res.json(schedules);
    } catch (error) {
      console.error("Error fetching staff schedules:", error);
      res.status(500).json({ message: "Failed to fetch staff schedules" });
    }
  });

  app.post("/api/admin/staff/:staffId/schedules", isAdmin, async (req, res) => {
    try {
      const staffId = parseInt(req.params.staffId);
      const validatedData = insertStaffScheduleSchema.parse({ ...req.body, staffId });
      const schedule = await storage.createStaffSchedule(validatedData);
      res.json(schedule);
    } catch (error) {
      console.error("Error creating staff schedule:", error);
      res.status(500).json({ message: "Failed to create staff schedule" });
    }
  });

  app.delete("/api/admin/staff/:staffId/schedules/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteStaffSchedule(id);
      if (!deleted) {
        return res.status(404).json({ message: "Staff schedule not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting staff schedule:", error);
      res.status(500).json({ message: "Failed to delete staff schedule" });
    }
  });

  // Product routes
  app.get("/api/admin/products", isAdmin, async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post("/api/admin/products", isAdmin, async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.put("/api/admin/products/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(id, validatedData);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/admin/products/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteProduct(id);
      if (!deleted) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Booking routes
  app.get("/api/admin/bookings", isAdmin, async (req, res) => {
    try {
      const bookings = await storage.getAllBookings();
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.post("/api/bookings", async (req, res) => {
    try {
      const validatedBooking = insertBookingSchema.parse(req.body.booking);
      const booking = await storage.createBooking(validatedBooking);
      
      // Create booking items
      if (req.body.items && Array.isArray(req.body.items)) {
        for (const item of req.body.items) {
          const validatedItem = insertBookingItemSchema.parse({
            ...item,
            bookingId: booking.id,
          });
          await storage.createBookingItem(validatedItem);
        }
      }
      
      res.json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.put("/api/admin/bookings/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Extract services BEFORE Zod parsing (which strips unknown fields)
      const services = req.body.services;
      
      const validatedData = insertBookingSchema.partial().parse(req.body);
      const booking = await storage.updateBooking(id, validatedData);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Update booking items if services are provided
      if (services && Array.isArray(services)) {
        // Delete existing booking items
        const existingItems = await storage.getBookingItemsByBookingId(id);
        for (const item of existingItems) {
          await storage.deleteBookingItem(item.id);
        }

        // Create new booking items
        for (const service of services) {
          const serviceDetails = await storage.getService(service.serviceId);
          const validatedItem = insertBookingItemSchema.parse({
            bookingId: id,
            serviceId: service.serviceId,
            staffId: validatedData.staffId || null,
            price: serviceDetails?.price || "0",
            duration: service.duration,
          });
          await storage.createBookingItem(validatedItem);
        }
      }

      res.json(booking);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid booking data", errors: error.errors });
      }
      console.error("Error updating booking:", error);
      res.status(500).json({ message: "Failed to update booking" });
    }
  });

  app.delete("/api/admin/bookings/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteBooking(id);
      if (!deleted) {
        return res.status(404).json({ message: "Booking not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting booking:", error);
      res.status(500).json({ message: "Failed to delete booking" });
    }
  });

  // Booking Items routes
  app.get("/api/admin/booking-items", isAdmin, async (req, res) => {
    try {
      const items = await storage.getAllBookingItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching booking items:", error);
      res.status(500).json({ message: "Failed to fetch booking items" });
    }
  });

  app.get("/api/admin/bookings/:bookingId/items", isAdmin, async (req, res) => {
    try {
      const bookingId = parseInt(req.params.bookingId);
      const items = await storage.getBookingItemsByBookingId(bookingId);
      res.json(items);
    } catch (error) {
      console.error("Error fetching booking items:", error);
      res.status(500).json({ message: "Failed to fetch booking items" });
    }
  });

  // Customer routes
  app.get("/api/admin/customers", isAdmin, async (req, res) => {
    try {
      const customers = await storage.getAllCustomers();
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.post("/api/admin/customers", isAdmin, async (req, res) => {
    try {
      const validatedData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(validatedData);
      res.json(customer);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid customer data", errors: error.errors });
      }
      console.error("Error creating customer:", error);
      res.status(500).json({ message: "Failed to create customer" });
    }
  });

  app.put("/api/admin/customers/:id", isAdmin, async (req, res) => {
    try {
      const id = parseNumericId(req.params.id);
      if (id === null) {
        return res.status(400).json({ message: "Invalid customer ID" });
      }
      const validatedData = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(id, validatedData);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error: any) {
      handleRouteError(res, error, "Failed to update customer");
    }
  });

  app.delete("/api/admin/customers/:id", isAdmin, async (req, res) => {
    try {
      const id = parseNumericId(req.params.id);
      if (id === null) {
        return res.status(400).json({ message: "Invalid customer ID" });
      }
      const deleted = await storage.deleteCustomer(id);
      if (!deleted) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      handleRouteError(res, error, "Failed to delete customer");
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const validatedData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(validatedData);
      res.json(customer);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid customer data", errors: error.errors });
      }
      console.error("Error creating customer:", error);
      res.status(500).json({ message: "Failed to create customer" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
