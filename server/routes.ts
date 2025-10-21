import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin, isSuperAdmin, injectAdminSpa, enforceSetupWizard, ensureSetupComplete } from "./replitAuth";
import { generateAvailableTimeSlots, validateBooking } from "./timeSlotService";
import { notificationService } from "./notificationService";
import { requireStaff, requireStaffRole, getStaffByUserId, canViewStaffCalendar, canEditAppointments, canAccessDashboard } from "./staffPermissions";
import { staffRoles, staffRoleInfo } from "@shared/schema";
import { AuditLogger } from "./auditLog";
import { 
  validateTwilioCredentials, 
  validateMsg91Credentials, 
  validateEmailCredentials 
} from "./providerValidation";
import { encryptJSON } from "./encryptionService";
import { 
  generateAuthUrl, 
  exchangeCodeForTokens, 
  encryptTokensForStorage,
  getValidAccessToken 
} from "./oauthService";
import { googleCalendarService } from "./googleCalendarService";
import multer from "multer";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";

// Helper: Get DST-aware timezone offset for RFC3339 format
function getTimezoneOffset(date: Date, timeZone: string): string {
  try {
    // Format the date in both UTC and the target timezone
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(date.toLocaleString('en-US', { timeZone }));
    
    // Calculate offset in minutes
    const offsetMinutes = (tzDate.getTime() - utcDate.getTime()) / (1000 * 60);
    
    // Convert to RFC3339 format (+HH:MM or -HH:MM)
    const sign = offsetMinutes >= 0 ? '+' : '-';
    const absOffset = Math.abs(offsetMinutes);
    const hours = Math.floor(absOffset / 60);
    const minutes = absOffset % 60;
    
    return `${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  } catch (error) {
    console.error('Error calculating timezone offset:', error);
    return '+04:00'; // Fallback to Dubai
  }
}

// Helper: Format date in timezone without UTC conversion
function formatDateInTimezone(date: Date, timeZone: string): { date: string; time: string } {
  // Use Intl.DateTimeFormat to get components in the target timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  
  const parts = formatter.formatToParts(date);
  const year = parts.find(p => p.type === 'year')?.value || '';
  const month = parts.find(p => p.type === 'month')?.value || '';
  const day = parts.find(p => p.type === 'day')?.value || '';
  const hour = parts.find(p => p.type === 'hour')?.value || '';
  const minute = parts.find(p => p.type === 'minute')?.value || '';
  
  return {
    date: `${year}-${month}-${day}`,
    time: `${hour}:${minute}`,
  };
}

// Helper: Sync booking to Google Calendar
async function syncBookingToCalendar(
  spaId: number,
  bookingId: number,
  bookingData: any,
  items: any[]
): Promise<void> {
  try {
    // Check if Google Calendar is connected
    const integrations = await storage.getSpaIntegrations(spaId);
    const calendarIntegration = integrations.find(
      i => i.integrationType === 'google_calendar' && i.status === 'active'
    );

    if (!calendarIntegration) {
      console.log('Google Calendar not connected, skipping sync');
      return;
    }

    // Get valid access token
    const accessToken = await getValidAccessToken(
      calendarIntegration.provider as 'google',
      calendarIntegration.integrationType,
      calendarIntegration.encryptedTokens
    );

    // Get spa details for timezone
    const spa = await storage.getSpaById(spaId);
    const spaTimeZone = (spa?.timeZone as string) || 'Asia/Dubai';

    // Get staff details for calendar event
    let staffEmail: string | undefined;
    if (bookingData.staffId) {
      const staff = await storage.getStaffById(bookingData.staffId);
      if (staff?.email) {
        staffEmail = staff.email;
      }
    }

    // Get customer details
    const customer = await storage.getCustomerById(bookingData.customerId);
    
    // Get service details
    const allServices = await storage.getAllServices();
    const services = items.map(item => {
      return allServices.find((s: any) => s.id === item.serviceId);
    }).filter(Boolean);

    // Convert booking to calendar event - preserve timezone
    const serviceNames = services.map((s: any) => ({ name: s.name }));
    const totalDuration = items.reduce((sum: number, item: any) => sum + (item.duration || 0), 0);
    
    // Extract date and time from booking date in the spa's timezone (no UTC conversion)
    const bookingDateTime = new Date(bookingData.bookingDate);
    const { date: appointmentDate, time: appointmentTime } = formatDateInTimezone(bookingDateTime, spaTimeZone);
    
    const event = googleCalendarService.createEventFromBooking({
      id: bookingId,
      customerName: customer?.name || 'Customer',
      customerEmail: customer?.email,
      customerPhone: customer?.phone,
      appointmentDate,
      appointmentTime,
      duration: totalDuration || 60,
      services: serviceNames,
      spaName: bookingData.spaName || spa?.name,
      spaAddress: bookingData.spaAddress || spa?.address,
      timeZone: spaTimeZone, // Google Calendar handles DST automatically with timeZone property
    });

    // Get staff calendar from integration metadata, fallback to 'primary'
    const integrationMetadata = calendarIntegration.metadata as any;
    const calendarId = integrationMetadata?.staffCalendars?.[staffEmail] || 'primary';
    
    // Create event in Google Calendar
    const calendarEvent = await googleCalendarService.createEvent(
      accessToken,
      calendarId,
      event
    );
    
    // Store calendar event ID in booking metadata
    if (calendarEvent.id) {
      await storage.updateBooking(bookingId, {
        metadata: {
          ...bookingData.metadata,
          googleCalendarEventId: calendarEvent.id,
        },
      });
    }

    console.log(`Booking ${bookingId} synced to Google Calendar: ${calendarEvent.id}`);
  } catch (error) {
    console.error('Failed to sync booking to calendar:', error);
    // Don't throw - we don't want calendar sync failures to break booking creation
  }
}
import {
  insertSpaSettingsSchema,
  insertServiceCategorySchema,
  insertServiceSchema,
  insertMembershipSchema,
  insertMembershipServiceSchema,
  insertCustomerMembershipSchema,
  insertMembershipUsageSchema,
  insertStaffSchema,
  insertStaffScheduleSchema,
  insertProductSchema,
  insertCustomerSchema,
  insertPromoCodeSchema,
  insertBookingSchema,
  insertBookingItemSchema,
  insertTransactionSchema,
  insertLoyaltyCardSchema,
  insertLoyaltyCardUsageSchema,
  insertProductSaleSchema,
  insertVendorSchema,
  insertExpenseSchema,
  insertBillSchema,
} from "@shared/schema";

// Domain error class for business logic errors
export class DomainError extends Error {
  status: number;
  code?: string;
  
  constructor(message: string, status = 400, code?: string) {
    super(message);
    this.name = 'DomainError';
    this.status = status;
    this.code = code;
  }
}

// Helper function for consistent error handling
function handleRouteError(res: any, error: any, message: string) {
  // Domain errors (business logic)
  if (error instanceof DomainError) {
    return res.status(error.status).json({ 
      message: error.message, 
      code: error.code 
    });
  }
  
  // Zod validation errors
  if (error.name === "ZodError") {
    return res.status(400).json({ 
      message: "Validation error", 
      errors: error.errors 
    });
  }
  
  // Postgres database errors
  if (error.code === '23505') { // Unique constraint violation
    return res.status(409).json({ 
      message: "Duplicate entry - this record already exists" 
    });
  }
  
  if (error.code === '23503') { // Foreign key constraint violation
    return res.status(400).json({ 
      message: "Foreign key constraint failed - referenced record does not exist" 
    });
  }
  
  if (error.code === '23502') { // Not null violation
    return res.status(400).json({ 
      message: "Missing required field" 
    });
  }
  
  // Log full error for debugging
  console.error(message, error);
  
  // Return error message if available, otherwise use default message
  res.status(500).json({ 
    message: error.message || message 
  });
}

// Helper function to parse and validate numeric ID params
function parseNumericId(param: string): number | null {
  const id = parseInt(param);
  return Number.isFinite(id) ? id : null;
}

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads', 'licenses');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'license-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png'];
    const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(ext) && allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPG, JPEG, and PNG files are allowed.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware setup
  await setupAuth(app);

  // File upload endpoint for license documents
  app.post('/api/upload/license', upload.single('file'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      // Return the file URL (relative path that can be accessed)
      const fileUrl = `/uploads/licenses/${req.file.filename}`;
      res.json({ fileUrl });
    } catch (error) {
      console.error('License upload error:', error);
      res.status(500).json({ message: 'Failed to upload license document' });
    }
  });

  // Serve uploaded files (with authentication for super admin only)
  app.use('/uploads', isAuthenticated, isSuperAdmin, (req, res) => {
    try {
      // Secure file serving to prevent path traversal
      const uploadsBase = path.join(process.cwd(), 'uploads');
      
      // Normalize and sanitize the requested path
      const relativePath = path.normalize(req.path).replace(/^\/+/, '');
      const filePath = path.join(uploadsBase, relativePath);
      
      // Prevent path traversal by ensuring resolved path is within uploads directory
      if (!filePath.startsWith(uploadsBase)) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'File not found' });
      }
      
      // Serve the file
      res.sendFile(filePath);
    } catch (error) {
      console.error('Error serving file:', error);
      res.status(500).json({ message: 'Error serving file' });
    }
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      handleRouteError(res, error, "Failed to fetch user");
    }
  });

  // Staff permission routes
  app.get('/api/staff/me', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const staffMember = await getStaffByUserId(userId);
      
      if (!staffMember) {
        return res.status(404).json({ error: "Staff profile not found" });
      }

      // Return staff info with permissions
      res.json({
        ...staffMember,
        permissions: staffRoleInfo[staffMember.role as keyof typeof staffRoleInfo] || staffRoleInfo.basic,
      });
    } catch (error) {
      handleRouteError(res, error, "Failed to fetch staff profile");
    }
  });

  // Check staff permissions
  app.get('/api/staff/permissions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Admins have all permissions
      if (user?.role === "admin" || user?.role === "super_admin") {
        return res.json({
          canViewOwnCalendar: true,
          canViewAllCalendars: true,
          canEditAppointments: true,
          canAccessDashboard: true,
          role: user.role,
          isAdmin: true,
        });
      }

      const staffMember = await getStaffByUserId(userId);
      
      if (!staffMember) {
        return res.json({
          canViewOwnCalendar: false,
          canViewAllCalendars: false,
          canEditAppointments: false,
          canAccessDashboard: false,
          role: null,
          isAdmin: false,
        });
      }

      const role = staffMember.role || staffRoles.BASIC;
      
      res.json({
        canViewOwnCalendar: canViewStaffCalendar(role, staffMember.id, staffMember.id),
        canViewAllCalendars: canViewStaffCalendar(role, staffMember.id, -1), // -1 for different staff
        canEditAppointments: canEditAppointments(role),
        canAccessDashboard: canAccessDashboard(role),
        role: role,
        isAdmin: false,
        staffId: staffMember.id,
      });
    } catch (error) {
      handleRouteError(res, error, "Failed to check permissions");
    }
  });

  // Admin login route (email/password authentication)
  app.post('/api/admin/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      console.log('Admin login attempt:', { email, hasPassword: !!password });
      
      // Validate input
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      // Look up user by email
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        console.log('User not found:', email);
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Check if user is admin or super_admin
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        console.log('User is not admin:', { email, role: user.role });
        return res.status(403).json({ message: "Access denied. Admin access required." });
      }
      
      // Check if user is approved
      if (user.status !== 'approved') {
        console.log('User not approved:', { email, status: user.status });
        return res.status(403).json({ message: "Your account is pending approval" });
      }
      
      // Verify password
      if (!user.password) {
        console.log('User has no password set:', email);
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const passwordMatch = await bcrypt.compare(password, user.password);
      
      if (!passwordMatch) {
        console.log('Password mismatch for user:', email);
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Set up session with required OIDC-like properties
      const sessionUser = {
        claims: { sub: user.id },
        expires_at: Math.floor(Date.now() / 1000) + 86400, // 24 hours from now
        refresh_token: 'email-password-login', // Dummy refresh token
      };
      
      req.login(sessionUser, (err) => {
        if (err) {
          console.error('req.login error:', err);
          return res.status(500).json({ message: "Login failed" });
        }
        console.log('Login successful, session created for:', email);
        return res.json({ success: true, user });
      });
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Get current authenticated user info
  app.get('/api/user', isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const userId = user.claims.sub;
      const dbUser = await storage.getUser(userId);
      
      if (!dbUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(dbUser);
    } catch (error) {
      handleRouteError(res, error, "Failed to get user info");
    }
  });

  // DEV/TEST: Make current user a super admin
  app.post('/api/dev/make-super-admin', isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const userId = user.claims.sub;
      const userEmail = user.claims.email || `dev-${userId}@test.com`;
      
      // Upsert user with super_admin role
      const superAdminUser = await storage.upsertUser({
        id: userId,
        email: userEmail,
        role: 'super_admin',
        status: 'approved'
      });
      
      res.json({ 
        success: true, 
        message: "You are now a super admin! Refresh the page to access the admin panel.",
        user: superAdminUser
      });
    } catch (error) {
      handleRouteError(res, error, "Failed to create super admin");
    }
  });

  // Get current user's admin application (if any)
  app.get('/api/admin/my-application', isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const userId = user.claims.sub;
      
      const application = await storage.getAdminApplicationByUserId(userId);
      
      if (!application) {
        return res.status(404).json({ message: "No application found" });
      }
      
      res.json(application);
    } catch (error) {
      handleRouteError(res, error, "Failed to get application");
    }
  });

  // Admin register route - creates pending application with email/password
  app.post('/api/admin/register', async (req, res) => {
    try {
      const { email, password, spaName, licenseUrl } = req.body;
      
      if (!email || !password || !spaName) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      console.log("Admin application submission:", { email, spaName, hasLicenseUrl: !!licenseUrl });
      
      // Check if email already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ 
          message: "An account with this email already exists"
        });
      }
      
      // Hash password
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 10);
      
      console.log("Creating new admin user and application...");
      
      // Create new user with pending status
      const newUser = await storage.upsertUser({
        email: email,
        password: hashedPassword,
        role: 'admin',
        status: 'pending'
      });
      
      // Create admin application
      await storage.createAdminApplication({
        userId: newUser.id,
        businessName: spaName,
        businessType: 'spa',
        licenseUrl: licenseUrl || null,
        status: 'pending',
      });
      
      console.log("Admin application created successfully for user:", newUser.id);
      
      res.json({ 
        success: true, 
        message: 'Application submitted successfully and is pending for review.',
        pendingApproval: true
      });
    } catch (error) {
      console.error("Admin register error:", error);
      console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
      res.status(500).json({ message: "Application submission failed", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // ===== SETUP WIZARD ENFORCEMENT =====
  // Apply setup wizard enforcement globally to all /api/admin/* routes
  // This blocks admin access when setupComplete !== true, except for /api/admin/setup/* routes
  app.use('/api/admin', isAuthenticated, enforceSetupWizard);

  // OAuth Integration Routes
  
  // Get all integrations for a spa
  app.get('/api/integrations/:spaId', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const spaId = parseNumericId(req.params.spaId);
      if (!spaId) {
        return res.status(400).json({ message: "Invalid spa ID" });
      }

      const integrations = await storage.getSpaIntegrations(spaId);
      
      // Return integrations with status but without encrypted tokens
      const safeIntegrations = integrations.map(int => ({
        id: int.id,
        spaId: int.spaId,
        integrationType: int.integrationType,
        status: int.status,
        metadata: int.metadata,
        lastSyncedAt: int.lastSyncedAt,
        createdAt: int.createdAt,
      }));
      
      res.json(safeIntegrations);
    } catch (error) {
      handleRouteError(res, error, "Failed to fetch integrations");
    }
  });

  // Initiate OAuth flow
  app.get('/api/oauth/:provider/connect', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const provider = req.params.provider as 'google' | 'hubspot' | 'mailchimp';
      const { spaId, integrationType } = req.query;

      if (!spaId || !integrationType) {
        return res.status(400).json({ message: "Missing spaId or integrationType" });
      }

      const parsedSpaId = parseNumericId(spaId as string);
      if (!parsedSpaId) {
        return res.status(400).json({ message: "Invalid spa ID" });
      }

      // Create state with spaId, integrationType, and userId for verification
      const state = Buffer.from(JSON.stringify({
        spaId: parsedSpaId,
        integrationType,
        userId: req.user.claims.sub,
        timestamp: Date.now(),
      })).toString('base64');

      const authUrl = generateAuthUrl(provider, integrationType as string, state);
      
      res.json({ authUrl });
    } catch (error) {
      handleRouteError(res, error, "Failed to initiate OAuth");
    }
  });

  // OAuth callback handler
  app.get('/api/oauth/:provider/callback', async (req, res) => {
    try {
      const provider = req.params.provider as 'google' | 'hubspot' | 'mailchimp';
      const { code, state, error } = req.query;

      if (error) {
        return res.redirect(`/admin/settings?oauth_error=${error}`);
      }

      if (!code || !state) {
        return res.redirect('/admin/settings?oauth_error=missing_params');
      }

      // Decode state
      const stateData = JSON.parse(Buffer.from(state as string, 'base64').toString());
      const { spaId, integrationType, userId, timestamp } = stateData;

      // Verify state is recent (within 10 minutes)
      if (Date.now() - timestamp > 10 * 60 * 1000) {
        return res.redirect('/admin/settings?oauth_error=expired_state');
      }

      // Exchange code for tokens
      const tokens = await exchangeCodeForTokens(provider, integrationType, code as string);
      
      // Encrypt tokens for storage
      const { encryptedTokens, tokenMetadata } = encryptTokensForStorage(tokens);

      // Save integration to database
      await storage.createOrUpdateSpaIntegration({
        spaId,
        integrationType,
        provider,
        encryptedTokens,
        tokenMetadata,
        status: 'active',
        metadata: {
          connectedAt: new Date().toISOString(),
          connectedBy: userId,
        },
      });

      // Log the integration
      await AuditLogger.log({
        userId,
        action: 'integration_connected',
        entityType: 'spa_integration',
        entityId: spaId.toString(),
        metadata: { integrationType, provider },
      });

      // Redirect back to settings with success message
      res.redirect(`/admin/settings?oauth_success=${integrationType}`);
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.redirect('/admin/settings?oauth_error=exchange_failed');
    }
  });

  // Disconnect integration
  app.post('/api/integrations/:integrationId/disconnect', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const integrationId = parseNumericId(req.params.integrationId);
      if (!integrationId) {
        return res.status(400).json({ message: "Invalid integration ID" });
      }

      const integration = await storage.getSpaIntegrationById(integrationId);
      if (!integration) {
        return res.status(404).json({ message: "Integration not found" });
      }

      // Update status to inactive
      await storage.updateSpaIntegration(integrationId, {
        status: 'inactive',
        metadata: {
          ...integration.metadata,
          disconnectedAt: new Date().toISOString(),
          disconnectedBy: req.user.claims.sub,
        },
      });

      await AuditLogger.log({
        userId: req.user.claims.sub,
        action: 'integration_disconnected',
        entityType: 'spa_integration',
        entityId: integrationId.toString(),
        metadata: { integrationType: integration.integrationType },
      });

      res.json({ success: true });
    } catch (error) {
      handleRouteError(res, error, "Failed to disconnect integration");
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

  // Public spa details endpoint
  app.get("/api/spas/:id", async (req, res) => {
    try {
      const id = parseNumericId(req.params.id);
      if (!id) {
        return res.status(400).json({ message: "Invalid spa ID" });
      }
      
      const spa = await storage.getSpaById(id);
      if (!spa) {
        return res.status(404).json({ message: "Spa not found" });
      }
      
      res.json(spa);
    } catch (error) {
      handleRouteError(res, error, "Failed to fetch spa");
    }
  });

  // Public spa services endpoint
  app.get("/api/spas/:id/services", async (req, res) => {
    try {
      const id = parseNumericId(req.params.id);
      if (!id) {
        return res.status(400).json({ message: "Invalid spa ID" });
      }
      
      const services = await storage.getAllServices();
      const spaServices = services.filter(s => s.spaId === id);
      res.json(spaServices);
    } catch (error) {
      handleRouteError(res, error, "Failed to fetch spa services");
    }
  });

  // Public spa staff endpoint
  app.get("/api/spas/:id/staff", async (req, res) => {
    try {
      const id = parseNumericId(req.params.id);
      if (!id) {
        return res.status(400).json({ message: "Invalid spa ID" });
      }
      
      const staff = await storage.getAllStaff();
      const spaStaff = staff.filter(s => s.spaId === id);
      res.json(spaStaff);
    } catch (error) {
      handleRouteError(res, error, "Failed to fetch spa staff");
    }
  });

  // Get available time slots for a spa
  app.get("/api/spas/:id/available-slots", async (req, res) => {
    try {
      const id = parseNumericId(req.params.id);
      if (!id) {
        return res.status(400).json({ message: "Invalid spa ID" });
      }

      const { date, duration, staffId } = req.query;
      
      if (!date || !duration) {
        return res.status(400).json({ message: "Date and duration are required" });
      }

      const serviceDuration = parseInt(duration as string);
      if (!Number.isFinite(serviceDuration) || serviceDuration <= 0) {
        return res.status(400).json({ message: "Invalid duration" });
      }

      const staffIdNum = staffId ? parseNumericId(staffId as string) ?? undefined : undefined;
      
      const slots = await generateAvailableTimeSlots(
        id,
        date as string,
        serviceDuration,
        staffIdNum
      );

      res.json(slots);
    } catch (error) {
      handleRouteError(res, error, "Failed to fetch available time slots");
    }
  });

  // Public booking creation endpoint
  app.post("/api/bookings", async (req, res) => {
    try {
      const { spaId, customerName, customerEmail, customerPhone, services, date, time, staffId, notes } = req.body;

      // Log booking request without PII
      console.log('Booking request received:', { 
        spaId, 
        hasCustomerName: !!customerName,
        hasEmail: !!customerEmail,
        hasPhone: !!customerPhone,
        servicesCount: services?.length || 0, 
        date, 
        time, 
        hasStaffId: !!staffId 
      });

      if (!spaId || !customerName || !services || !Array.isArray(services) || services.length === 0 || !date || !time) {
        console.log('Booking validation failed - missing fields:', { 
          spaId: !!spaId, 
          customerName: !!customerName, 
          services: !!services && Array.isArray(services) && services.length > 0,
          date: !!date,
          time: !!time 
        });
        return res.status(400).json({ message: "Missing required fields" });
      }

      if (!customerEmail && !customerPhone) {
        return res.status(400).json({ message: "Either email or phone is required" });
      }

      // Find or create customer
      let customer;
      const userId = (req.user as any)?.claims?.sub; // Get userId from Replit Auth if available

      if (userId) {
        customer = await storage.getCustomerByUserId(userId);
      }

      if (!customer && customerEmail) {
        customer = await storage.getCustomerByEmail(customerEmail);
      }

      if (!customer && customerPhone) {
        customer = await storage.getCustomerByPhone(customerPhone);
      }

      if (!customer) {
        customer = await storage.createCustomer({
          userId: userId || undefined,
          name: customerName,
          email: customerEmail || null,
          phone: customerPhone || null,
        });
      }

      // Calculate total amount and duration
      const serviceRecords = await storage.getAllServices();
      const selectedServices = serviceRecords.filter(s => services.includes(s.id));
      const totalAmount = selectedServices.reduce((sum, service) => {
        const price = typeof service.price === 'string' ? parseFloat(service.price) : service.price;
        return sum + price;
      }, 0);
      
      // Calculate total service duration
      const totalDuration = selectedServices.reduce((sum, service) => sum + service.duration, 0);

      // Convert time to 24-hour format if needed and create booking date
      let bookingDate: Date;
      try {
        // Check if time is in 12-hour format (contains AM/PM)
        if (time.match(/[AP]M$/i)) {
          // Convert 12-hour to 24-hour format
          const timeParts = time.match(/(\d+):(\d+)\s*([AP]M)/i);
          if (timeParts) {
            let hours = parseInt(timeParts[1]);
            const minutes = timeParts[2];
            const period = timeParts[3].toUpperCase();
            
            if (period === 'PM' && hours !== 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;
            
            const hours24 = hours.toString().padStart(2, '0');
            bookingDate = new Date(`${date}T${hours24}:${minutes}:00`);
          } else {
            throw new Error('Invalid time format');
          }
        } else {
          // Already in 24-hour format
          bookingDate = new Date(`${date}T${time}:00`);
        }
      } catch (error) {
        console.error('Error parsing date/time:', error);
        return res.status(400).json({ message: 'Invalid date or time format' });
      }

      // Validate booking against calendar rules
      const validation = await validateBooking(spaId, bookingDate, totalDuration, staffId || undefined);
      if (!validation.valid) {
        return res.status(400).json({ message: validation.message });
      }

      const booking = await storage.createBooking({
        spaId,
        customerId: customer.id,
        staffId: staffId || null,
        bookingDate,
        totalAmount: totalAmount.toString(),
        notes: notes || null,
        status: 'confirmed',
      });

      // Create booking items
      for (const serviceId of services) {
        const service = selectedServices.find(s => s.id === serviceId);
        if (service) {
          await storage.createBookingItem({
            bookingId: booking.id,
            serviceId: service.id,
            staffId: staffId || null,
            price: service.price.toString(),
            duration: service.duration,
          });
        }
      }

      // Log booking creation to audit trail
      await AuditLogger.logCreate(req, "booking", booking.id, {
        spaId,
        customerId: customer.id,
        staffId,
        bookingDate: booking.bookingDate,
        totalAmount,
        services: services.map(id => id),
      }, spaId);

      // Send booking confirmation notification (async, non-blocking)
      (async () => {
        try {
          const spa = await storage.getSpaById(spaId);
          const staff = staffId ? await storage.getStaffById(staffId) : null;
          
          const templateData = {
            customerName: customer.name,
            spaName: spa?.name || 'Spa',
            spaAddress: spa?.address || undefined,
            spaPhone: spa?.contactPhone || undefined,
            bookingDate: date,
            bookingTime: time,
            services: selectedServices.map(s => ({
              name: s.name,
              duration: s.duration,
              price: String(s.price),
              currency: spa?.currency || 'AED',
            })),
            staffName: staff?.name || undefined,
            totalAmount: totalAmount.toFixed(2),
            currency: spa?.currency || 'AED',
            bookingId: booking.id,
            cancellationPolicy: spa?.cancellationPolicy 
              ? `${(spa.cancellationPolicy as any).description || 'Please check our cancellation policy.'}` 
              : undefined,
          };

          // Send customer notification
          await notificationService.sendNotification(
            spaId,
            'confirmation',
            { email: customer.email || undefined, phone: customer.phone || undefined },
            booking.id,
            templateData
          );

          // Send staff notification if staff is assigned
          if (staff && (staff.email || staff.phone)) {
            await notificationService.sendStaffNotification(
              spaId,
              'confirmation',
              { email: staff.email || undefined, phone: staff.phone || undefined },
              booking.id,
              {
                ...templateData,
                staffName: staff.name,
              }
            );
          }
        } catch (error) {
          console.error('Failed to send booking confirmation:', error);
        }
      })();

      res.json({ 
        success: true, 
        booking,
        customerId: customer.id 
      });
    } catch (error) {
      handleRouteError(res, error, "Failed to create booking");
    }
  });

  // Get customer's bookings (requires authentication)
  app.get("/api/my-bookings", async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const customer = await storage.getCustomerByUserId(userId);
      if (!customer) {
        return res.json([]);
      }

      const bookings = await storage.getBookingsByCustomerId(customer.id);
      
      // Fetch related data for each booking
      const bookingsWithDetails = await Promise.all(
        bookings.map(async (booking) => {
          const bookingItems = await storage.getBookingItemsByBookingId(booking.id);
          const spa = await storage.getSpaById(booking.spaId);
          const staff = booking.staffId ? await storage.getStaffById(booking.staffId) : null;
          
          const allServices = await storage.getAllServices();
          const servicesData = bookingItems.map((item) => {
            return allServices.find((s: any) => s.id === item.serviceId);
          });

          return {
            ...booking,
            spa,
            staff,
            services: servicesData.filter((s: any) => s !== undefined),
            bookingItems,
          };
        })
      );

      res.json(bookingsWithDetails);
    } catch (error) {
      handleRouteError(res, error, "Failed to fetch bookings");
    }
  });

  // Cancel booking
  app.put("/api/bookings/:id/cancel", async (req, res) => {
    try {
      const id = parseNumericId(req.params.id);
      if (!id) {
        return res.status(400).json({ message: "Invalid booking ID" });
      }

      const booking = await storage.getBookingById(id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Check if user owns this booking
      const userId = (req.user as any)?.claims?.sub;
      if (userId) {
        const customer = await storage.getCustomerByUserId(userId);
        if (customer && customer.id !== booking.customerId) {
          return res.status(403).json({ message: "Unauthorized" });
        }
      }

      // Check cancellation policy
      const spa = await storage.getSpaById(booking.spaId);
      const cancellationPolicy = spa?.cancellationPolicy as { hoursBeforeBooking?: number; description?: string } | null;
      
      if (cancellationPolicy?.hoursBeforeBooking) {
        const hoursUntilBooking = (new Date(booking.bookingDate).getTime() - Date.now()) / (1000 * 60 * 60);
        if (hoursUntilBooking < cancellationPolicy.hoursBeforeBooking) {
          return res.status(400).json({ 
            message: `Cannot cancel booking. Cancellation must be made at least ${cancellationPolicy.hoursBeforeBooking} hours before appointment.` 
          });
        }
      }

      const { reason } = req.body;
      
      const updated = await storage.updateBooking(id, {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancellationReason: reason || null,
      });

      // Log booking cancellation to audit trail
      if (updated) {
        await AuditLogger.logUpdate(req, "booking", id, 
          { status: booking.status },
          { status: 'cancelled', reason },
          booking.spaId
        );
      }

      // Send booking cancellation notification (async, non-blocking)
      if (updated) {
        (async () => {
          try {
            const customer = await storage.getCustomerById(booking.customerId);
            const staff = booking.staffId ? await storage.getStaffById(booking.staffId) : null;
            const bookingItems = await storage.getBookingItemsByBookingId(id);
            const allServices = await storage.getAllServices();

            const servicesData = bookingItems.map((item) => {
              const service = allServices.find((s) => s.id === item.serviceId);
              return service ? {
                name: service.name,
                duration: item.duration,
                price: String(item.price),
                currency: spa?.currency || 'AED',
              } : null;
            }).filter(Boolean);

            const templateData = {
              customerName: customer?.name || 'Valued Customer',
              spaName: spa?.name || 'Spa',
              spaAddress: spa?.address || undefined,
              spaPhone: spa?.contactPhone || undefined,
              bookingDate: new Date(updated!.bookingDate).toISOString().split('T')[0],
              bookingTime: new Date(updated!.bookingDate).toTimeString().substring(0, 5),
              services: servicesData as any,
              staffName: staff?.name || undefined,
              totalAmount: String(updated!.totalAmount),
              currency: spa?.currency || 'AED',
              bookingId: updated!.id,
              notes: reason || undefined,
              cancellationPolicy: cancellationPolicy?.description || undefined,
            };

            // Send customer notification
            await notificationService.sendNotification(
              booking.spaId,
              'cancellation',
              { email: customer?.email || undefined, phone: customer?.phone || undefined },
              updated!.id,
              templateData
            );

            // Send staff notification if staff is assigned
            if (staff && (staff.email || staff.phone)) {
              await notificationService.sendStaffNotification(
                booking.spaId,
                'cancellation',
                { email: staff.email || undefined, phone: staff.phone || undefined },
                updated!.id,
                templateData
              );
            }
          } catch (error) {
            console.error('Failed to send booking cancellation notification:', error);
          }
        })();
      }

      res.json(updated);
    } catch (error) {
      handleRouteError(res, error, "Failed to cancel booking");
    }
  });

  // Modify booking
  app.put("/api/bookings/:id", async (req, res) => {
    try {
      const id = parseNumericId(req.params.id);
      if (!id) {
        return res.status(400).json({ message: "Invalid booking ID" });
      }

      const booking = await storage.getBookingById(id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Check if user owns this booking
      const userId = (req.user as any)?.claims?.sub;
      if (userId) {
        const customer = await storage.getCustomerByUserId(userId);
        if (customer && customer.id !== booking.customerId) {
          return res.status(403).json({ message: "Unauthorized" });
        }
      }

      // Check cancellation policy for modifications
      const spa = await storage.getSpaById(booking.spaId);
      const cancellationPolicy = spa?.cancellationPolicy as { hoursBeforeBooking?: number; description?: string } | null;
      
      if (cancellationPolicy?.hoursBeforeBooking) {
        const hoursUntilBooking = (new Date(booking.bookingDate).getTime() - Date.now()) / (1000 * 60 * 60);
        if (hoursUntilBooking < cancellationPolicy.hoursBeforeBooking) {
          return res.status(400).json({ 
            message: `Cannot modify booking. Changes must be made at least ${cancellationPolicy.hoursBeforeBooking} hours before appointment.` 
          });
        }
      }

      const { date, time, staffId, notes } = req.body;
      const updates: any = {};

      if (date && time) {
        updates.bookingDate = new Date(`${date}T${time}:00`);
      }

      if (staffId !== undefined) {
        updates.staffId = staffId || null;
      }

      if (notes !== undefined) {
        updates.notes = notes;
      }

      if (Object.keys(updates).length > 0) {
        updates.status = 'modified';
      }

      const updated = await storage.updateBooking(id, updates);

      // Log booking modification to audit trail
      if (updated && Object.keys(updates).length > 0) {
        await AuditLogger.logUpdate(req, "booking", id, 
          {
            bookingDate: booking.bookingDate,
            staffId: booking.staffId,
            notes: booking.notes,
          },
          updates,
          booking.spaId
        );
      }

      // Send booking modification notification (async, non-blocking)
      if (updated && Object.keys(updates).length > 0) {
        (async () => {
          try {
            const customer = await storage.getCustomerById(booking.customerId);
            const bookingItems = await storage.getBookingItemsByBookingId(id);
            const allServices = await storage.getAllServices();
            const staff = updated!.staffId ? await storage.getStaffById(updated!.staffId) : null;

            const servicesData = bookingItems.map((item) => {
              const service = allServices.find((s) => s.id === item.serviceId);
              return service ? {
                name: service.name,
                duration: item.duration,
                price: String(item.price),
                currency: spa?.currency || 'AED',
              } : null;
            }).filter(Boolean);

            const templateData = {
              customerName: customer?.name || 'Valued Customer',
              spaName: spa?.name || 'Spa',
              spaAddress: spa?.address || undefined,
              spaPhone: spa?.contactPhone || undefined,
              bookingDate: date || new Date(updated!.bookingDate).toISOString().split('T')[0],
              bookingTime: time || new Date(updated!.bookingDate).toTimeString().substring(0, 5),
              services: servicesData as any,
              staffName: staff?.name || undefined,
              totalAmount: String(updated!.totalAmount),
              currency: spa?.currency || 'AED',
              bookingId: updated!.id,
              notes: updated!.notes || undefined,
            };

            // Send customer notification
            await notificationService.sendNotification(
              booking.spaId,
              'modification',
              { email: customer?.email || undefined, phone: customer?.phone || undefined },
              updated!.id,
              templateData
            );

            // Send staff notification if staff is assigned
            if (staff && (staff.email || staff.phone)) {
              await notificationService.sendStaffNotification(
                booking.spaId,
                'modification',
                { email: staff.email || undefined, phone: staff.phone || undefined },
                updated!.id,
                templateData
              );
            }
          } catch (error) {
            console.error('Failed to send booking modification notification:', error);
          }
        })();
      }

      res.json(updated);
    } catch (error) {
      handleRouteError(res, error, "Failed to modify booking");
    }
  });

  // Super Admin-only routes (protected with isSuperAdmin middleware)
  app.get("/api/super-admin/applications", isSuperAdmin, async (req, res) => {
    try {
      const { status } = req.query;
      
      let applications;
      if (status && typeof status === 'string') {
        applications = await storage.getAdminApplicationsByStatus(status);
      } else {
        applications = await storage.getAllAdminApplications();
      }

      // Enrich applications with user data and reviewer data
      const enrichedApplications = await Promise.all(
        applications.map(async (app) => {
          const user = await storage.getUser(app.userId);
          let reviewer = null;
          if (app.reviewedBy) {
            const reviewerUser = await storage.getUser(app.reviewedBy);
            if (reviewerUser) {
              reviewer = {
                id: reviewerUser.id,
                email: reviewerUser.email,
                firstName: reviewerUser.firstName,
                lastName: reviewerUser.lastName,
              };
            }
          }
          return {
            ...app,
            user: user ? {
              id: user.id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
            } : null,
            reviewer,
          };
        })
      );

      res.json(enrichedApplications);
    } catch (error) {
      handleRouteError(res, error, "Failed to fetch admin applications");
    }
  });

  app.post("/api/super-admin/applications/:id/approve", isSuperAdmin, async (req, res) => {
    try {
      const id = parseNumericId(req.params.id);
      if (!id) {
        return res.status(400).json({ message: "Invalid application ID" });
      }

      const application = await storage.getAdminApplicationById(id);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      // Check if already reviewed
      if (application.status !== "pending") {
        return res.status(409).json({ message: "Application already reviewed" });
      }

      // Require business license for approval
      if (!application.licenseUrl) {
        return res.status(400).json({ message: "License document is required for approval" });
      }

      // Idempotent spa creation: check if spa already exists for this user
      let spa = await storage.getSpaByOwnerUserId(application.userId);
      
      if (!spa) {
        // Create new spa for this admin
        // Generate URL-friendly slug from business name
        const slug = application.businessName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '') + '-' + Date.now();
        
        spa = await storage.createSpa({
          name: application.businessName,
          slug,
          businessType: application.businessType,
          ownerUserId: application.userId,
          setupComplete: false,
          setupSteps: {
            basicInfo: false,
            location: false,
            hours: false,
            services: false,
            staff: false,
            policies: false,
            inventory: false,
            activation: false,
          },
        } as any);
      }

      // Link admin to spa (idempotent - always update to ensure consistency)
      await storage.upsertUser({
        id: application.userId,
        status: 'approved',
        adminSpaId: spa.id,
      } as any);

      // Update application status with reviewer info
      const userId = (req as any).user?.claims?.sub || (req as any).user?.id;
      console.log('Approving application:', { applicationId: id, userId });
      
      await storage.updateAdminApplication(id, {
        status: 'approved',
        reviewedAt: new Date(),
        reviewedBy: userId,
      });

      res.json({ 
        message: "Admin application approved successfully",
        spaId: spa.id 
      });
    } catch (error) {
      console.error('Detailed approval error:', {
        error,
        errorCode: (error as any).code,
        errorMessage: (error as any).message,
        errorDetail: (error as any).detail,
        errorColumn: (error as any).column,
        applicationId: id,
      });
      handleRouteError(res, error, "Failed to approve admin application");
    }
  });

  app.post("/api/super-admin/applications/:id/reject", isSuperAdmin, async (req, res) => {
    try {
      const id = parseNumericId(req.params.id);
      if (!id) {
        return res.status(400).json({ message: "Invalid application ID" });
      }

      const { reason } = req.body;

      const application = await storage.getAdminApplicationById(id);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      // Update application status with reviewer info
      const userId = (req as any).user?.claims?.sub || (req as any).user?.id;
      console.log('Rejecting application:', { applicationId: id, userId, reason });
      
      await storage.updateAdminApplication(id, {
        status: 'rejected',
        reviewedAt: new Date(),
        reviewedBy: userId,
        rejectionReason: reason,
      });

      // Update user status
      await storage.upsertUser({
        id: application.userId,
        status: 'rejected',
      } as any);

      res.json({ message: "Admin application rejected successfully" });
    } catch (error) {
      console.error('Error rejecting application:', error);
      handleRouteError(res, error, "Failed to reject admin application");
    }
  });

  // Spa Setup Wizard endpoints (for approved admins)
  app.get("/api/admin/setup/status", isAdmin, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.adminSpaId) {
        return res.json({
          spaId: null,
          setupComplete: false,
          userEmail: user.email, // Include user email for pre-filling contact email
          steps: {
            basicInfo: false,
            location: false,
            hours: false,
            services: false,
            staff: false,
            activation: false,
          },
        });
      }

      const spa = await storage.getSpaById(user.adminSpaId);
      if (!spa) {
        return res.status(404).json({ message: "Spa not found" });
      }

      const steps = (spa.setupSteps as any) || {
        basicInfo: false,
        location: false,
        hours: false,
        services: false,
        staff: false,
        activation: false,
      };

      res.json({
        spaId: spa.id,
        setupComplete: spa.setupComplete,
        userEmail: user.email, // Include user email for pre-filling contact email
        steps,
        spa,
      });
    } catch (error) {
      handleRouteError(res, error, "Failed to fetch setup status");
    }
  });

  app.post("/api/admin/setup/step/:stepName", isAdmin, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const user = await storage.getUser(userId);
      const { stepName } = req.params;
      const stepData = req.body;

      // If no spa exists yet, create one for basic info step
      let spaId = user?.adminSpaId;
      
      if (!spaId && stepName === "basicInfo") {
        const newSpa = await storage.createSpa({
          name: stepData.name,
          slug: stepData.slug || stepData.name.toLowerCase().replace(/\s+/g, '-'),
          description: stepData.description,
          contactEmail: stepData.contactEmail,
          contactPhone: stepData.contactPhone,
          currency: stepData.currency || 'AED',
          active: false, // Not active until setup is complete
          setupComplete: false,
          setupSteps: { basicInfo: true } as any,
        });
        
        spaId = newSpa.id;
        
        // Link admin user to spa
        await storage.upsertUser({
          id: userId,
          adminSpaId: spaId,
        } as any);
      }

      if (!spaId) {
        return res.status(400).json({ message: "Spa not found. Please complete basic info first." });
      }

      const spa = await storage.getSpaById(spaId);
      if (!spa) {
        return res.status(404).json({ message: "Spa not found" });
      }

      const currentSteps = (spa.setupSteps as any) || {};
      
      // Update spa data based on step
      let updateData: any = {
        setupSteps: { ...currentSteps, [stepName]: true },
      };

      if (stepName === "basicInfo") {
        updateData = {
          ...updateData,
          name: stepData.name,
          slug: stepData.slug || stepData.name.toLowerCase().replace(/\s+/g, '-'),
          description: stepData.description,
          contactEmail: stepData.contactEmail,
          contactPhone: stepData.contactPhone,
          currency: stepData.currency || 'AED',
        };
      } else if (stepName === "location") {
        updateData = {
          ...updateData,
          address: stepData.address,
          city: stepData.city,
          area: stepData.area,
          latitude: stepData.latitude,
          longitude: stepData.longitude,
        };
      } else if (stepName === "hours") {
        updateData = {
          ...updateData,
          businessHours: stepData.businessHours,
        };
      } else if (stepName === "services") {
        // Create first service for the spa
        if (stepData.serviceName && stepData.serviceDuration && stepData.servicePrice) {
          await storage.createService({
            spaId,
            name: stepData.serviceName,
            description: stepData.serviceDescription || null,
            duration: parseInt(stepData.serviceDuration),
            price: stepData.servicePrice,
            categoryId: null, // Will be set later from dashboard
          });
        }
      } else if (stepName === "staff") {
        // Create first staff member for the spa
        if (stepData.staffFirstName && stepData.staffEmail) {
          const staffName = stepData.staffLastName 
            ? `${stepData.staffFirstName} ${stepData.staffLastName}`.trim()
            : stepData.staffFirstName;
          
          await storage.createStaff({
            spaId,
            name: staffName,
            email: stepData.staffEmail,
            phone: stepData.staffPhone || null,
            role: 'basic',
          });
        }
      } else if (stepName === "activation") {
        // Activation step just marks the step as complete
        // No additional data to update
      }

      const updated = await storage.updateSpa(spaId, updateData);
      res.json(updated);
    } catch (error) {
      handleRouteError(res, error, "Failed to save setup step");
    }
  });

  app.post("/api/admin/setup/complete", isAdmin, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.adminSpaId) {
        return res.status(400).json({ message: "No spa found" });
      }

      const spa = await storage.getSpaById(user.adminSpaId);
      if (!spa) {
        return res.status(404).json({ message: "Spa not found" });
      }

      const steps = (spa.setupSteps as any) || {};
      // Require all essential steps except activation (which is being completed now)
      const allStepsComplete = steps.basicInfo && steps.location && steps.hours && steps.services && steps.staff;

      if (!allStepsComplete) {
        const requiredSteps = ['basicInfo', 'location', 'hours', 'services', 'staff'];
        const missingRequiredSteps = requiredSteps.filter(step => !steps[step]);
        
        return res.status(400).json({ 
          message: "All required setup steps must be completed first",
          missingSteps: missingRequiredSteps
        });
      }

      const updated = await storage.updateSpa(user.adminSpaId, {
        setupComplete: true,
        active: true, // Activate spa after setup
        setupSteps: {
          ...(spa.setupSteps as any),
          activation: true, // Mark activation step as complete
        },
      });

      res.json({ message: "Spa setup completed successfully", spa: updated });
    } catch (error) {
      handleRouteError(res, error, "Failed to complete setup");
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
      console.log("PUT /api/admin/settings - Request body:", JSON.stringify(req.body, null, 2));
      // Use partial schema for updates to allow partial updates
      const validatedData = insertSpaSettingsSchema.partial().parse(req.body);
      console.log("PUT /api/admin/settings - Validated data:", JSON.stringify(validatedData, null, 2));
      const settings = await storage.updateSpaSettings(validatedData as any);
      console.log("PUT /api/admin/settings - Updated settings:", JSON.stringify(settings, null, 2));
      res.json(settings);
    } catch (error) {
      console.error("PUT /api/admin/settings - Error:", error);
      res.status(500).json({ message: "Failed to update spa settings" });
    }
  });

  // Notification Settings routes
  app.get("/api/admin/notification-settings", isAdmin, async (req, res) => {
    try {
      const user = await storage.getUserByReplitId((req.user as any)?.id);
      if (!user?.adminSpaId) {
        return res.status(400).json({ message: "No spa found" });
      }
      
      const settings = await storage.getNotificationSettings(user.adminSpaId);
      res.json(settings || {});
    } catch (error) {
      console.error("Error fetching notification settings:", error);
      res.status(500).json({ message: "Failed to fetch notification settings" });
    }
  });

  app.put("/api/admin/notification-settings", isAdmin, async (req, res) => {
    try {
      const user = await storage.getUserByReplitId((req.user as any)?.id);
      if (!user?.adminSpaId) {
        return res.status(400).json({ message: "No spa found" });
      }
      
      const settings = await storage.upsertNotificationSettings(user.adminSpaId, req.body);
      res.json(settings);
    } catch (error) {
      console.error("Error updating notification settings:", error);
      res.status(500).json({ message: "Failed to update notification settings" });
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

  app.post("/api/admin/service-categories", isAdmin, injectAdminSpa, ensureSetupComplete, async (req: any, res) => {
    try {
      // Inject spaId from admin's spa (from middleware)
      const validatedData = insertServiceCategorySchema.parse({
        ...req.body,
        spaId: req.adminSpa.id,
      });
      const category = await storage.createServiceCategory(validatedData);
      res.json(category);
    } catch (error) {
      console.error("Error creating service category:", error);
      if (error instanceof Error) {
        console.error("Error details:", error.message);
      }
      handleRouteError(res, error, "Failed to create service category");
    }
  });

  app.put("/api/admin/service-categories/:id", isAdmin, injectAdminSpa, ensureSetupComplete, async (req: any, res) => {
    try {
      const id = parseNumericId(req.params.id);
      if (!id) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const validatedData = insertServiceCategorySchema.partial().parse(req.body);
      const category = await storage.updateServiceCategory(id, validatedData);
      if (!category) {
        return res.status(404).json({ message: "Service category not found" });
      }
      res.json(category);
    } catch (error) {
      handleRouteError(res, error, "Failed to update service category");
    }
  });

  app.delete("/api/admin/service-categories/:id", isAdmin, injectAdminSpa, ensureSetupComplete, async (req: any, res) => {
    try {
      const id = parseNumericId(req.params.id);
      if (!id) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const deleted = await storage.deleteServiceCategory(id);
      if (!deleted) {
        return res.status(404).json({ message: "Service category not found" });
      }
      res.json({ success: true });
    } catch (error) {
      handleRouteError(res, error, "Failed to delete service category");
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

  app.post("/api/admin/services", isAdmin, injectAdminSpa, ensureSetupComplete, async (req: any, res) => {
    try {
      // Inject spaId from admin's spa (from middleware)
      const validatedData = insertServiceSchema.parse({
        ...req.body,
        spaId: req.adminSpa.id,
      });
      const service = await storage.createService(validatedData);
      
      // Log service creation to audit trail
      await AuditLogger.logCreate(req, "service", service.id, validatedData, validatedData.spaId);
      
      res.json(service);
    } catch (error) {
      console.error("Error creating service:", error);
      if (error instanceof Error) {
        console.error("Error details:", error.message);
      }
      handleRouteError(res, error, "Failed to create service");
    }
  });

  app.put("/api/admin/services/:id", isAdmin, injectAdminSpa, ensureSetupComplete, async (req: any, res) => {
    try {
      const id = parseNumericId(req.params.id);
      if (!id) {
        return res.status(400).json({ message: "Invalid service ID" });
      }
      
      const before = await storage.getService(id);
      const validatedData = insertServiceSchema.partial().parse(req.body);
      const service = await storage.updateService(id, validatedData);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      // Log service update to audit trail
      if (before) {
        await AuditLogger.logUpdate(req, "service", id, before, validatedData, service.spaId);
      }
      
      res.json(service);
    } catch (error) {
      handleRouteError(res, error, "Failed to update service");
    }
  });

  app.delete("/api/admin/services/:id", isAdmin, injectAdminSpa, ensureSetupComplete, async (req: any, res) => {
    try {
      const id = parseNumericId(req.params.id);
      if (!id) {
        return res.status(400).json({ message: "Invalid service ID" });
      }
      
      const service = await storage.getService(id);
      const deleted = await storage.deleteService(id);
      if (!deleted) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      // Log service deletion to audit trail
      if (service) {
        await AuditLogger.logDelete(req, "service", id, service, service.spaId);
      }
      
      res.json({ success: true });
    } catch (error) {
      handleRouteError(res, error, "Failed to delete service");
    }
  });

  // Membership routes
  app.get("/api/admin/memberships", isAdmin, async (req, res) => {
    try {
      const memberships = await storage.getAllMemberships();
      res.json(memberships);
    } catch (error) {
      handleRouteError(res, error, "Failed to fetch memberships");
    }
  });

  app.get("/api/admin/memberships/:id", isAdmin, async (req, res) => {
    try {
      const id = parseNumericId(req.params.id);
      if (!id) {
        return res.status(400).json({ message: "Invalid membership ID" });
      }
      
      const membership = await storage.getMembershipById(id);
      if (!membership) {
        return res.status(404).json({ message: "Membership not found" });
      }
      
      // Get linked services for this membership
      const membershipServices = await storage.getMembershipServices(id);
      
      res.json({ ...membership, linkedServices: membershipServices });
    } catch (error) {
      handleRouteError(res, error, "Failed to fetch membership");
    }
  });

  app.post("/api/admin/memberships", isAdmin, injectAdminSpa, ensureSetupComplete, async (req: any, res) => {
    try {
      const { serviceIds, ...membershipData } = req.body;
      
      // Inject spaId from admin's spa
      const validatedData = insertMembershipSchema.parse({
        ...membershipData,
        spaId: req.adminSpa.id,
      });
      
      const membership = await storage.createMembership(validatedData);
      
      // Link services to membership
      if (serviceIds && Array.isArray(serviceIds) && serviceIds.length > 0) {
        for (const serviceId of serviceIds) {
          await storage.createMembershipService({
            membershipId: membership.id,
            serviceId: Number(serviceId),
          });
        }
      }
      
      // Log membership creation
      await AuditLogger.logCreate(req, "membership", membership.id, validatedData, validatedData.spaId);
      
      res.json(membership);
    } catch (error) {
      handleRouteError(res, error, "Failed to create membership");
    }
  });

  app.put("/api/admin/memberships/:id", isAdmin, injectAdminSpa, ensureSetupComplete, async (req: any, res) => {
    try {
      const id = parseNumericId(req.params.id);
      if (!id) {
        return res.status(400).json({ message: "Invalid membership ID" });
      }
      
      const { serviceIds, ...membershipData } = req.body;
      
      const before = await storage.getMembershipById(id);
      const validatedData = insertMembershipSchema.partial().parse(membershipData);
      const membership = await storage.updateMembership(id, validatedData);
      
      if (!membership) {
        return res.status(404).json({ message: "Membership not found" });
      }
      
      // Update linked services if provided
      if (serviceIds !== undefined && Array.isArray(serviceIds)) {
        // Remove all existing services
        await storage.deleteMembershipServicesByMembershipId(id);
        
        // Add new services
        for (const serviceId of serviceIds) {
          await storage.createMembershipService({
            membershipId: id,
            serviceId: Number(serviceId),
          });
        }
      }
      
      // Log membership update
      if (before) {
        await AuditLogger.logUpdate(req, "membership", id, before, validatedData, membership.spaId);
      }
      
      res.json(membership);
    } catch (error) {
      handleRouteError(res, error, "Failed to update membership");
    }
  });

  app.delete("/api/admin/memberships/:id", isAdmin, injectAdminSpa, ensureSetupComplete, async (req: any, res) => {
    try {
      const id = parseNumericId(req.params.id);
      if (!id) {
        return res.status(400).json({ message: "Invalid membership ID" });
      }
      
      const membership = await storage.getMembershipById(id);
      
      // Delete linked services first
      await storage.deleteMembershipServicesByMembershipId(id);
      
      const deleted = await storage.deleteMembership(id);
      if (!deleted) {
        return res.status(404).json({ message: "Membership not found" });
      }
      
      // Log membership deletion
      if (membership) {
        await AuditLogger.logDelete(req, "membership", id, membership, membership.spaId);
      }
      
      res.json({ success: true });
    } catch (error) {
      handleRouteError(res, error, "Failed to delete membership");
    }
  });

  // Customer Membership routes
  app.get("/api/admin/customer-memberships", isAdmin, async (req, res) => {
    try {
      const customerMemberships = await storage.getAllCustomerMemberships();
      res.json(customerMemberships);
    } catch (error) {
      handleRouteError(res, error, "Failed to fetch customer memberships");
    }
  });

  app.get("/api/admin/customer-memberships/customer/:customerId", isAdmin, async (req, res) => {
    try {
      const customerId = parseNumericId(req.params.customerId);
      if (!customerId) {
        return res.status(400).json({ message: "Invalid customer ID" });
      }
      
      const customerMemberships = await storage.getCustomerMembershipsByCustomerId(customerId);
      res.json(customerMemberships);
    } catch (error) {
      handleRouteError(res, error, "Failed to fetch customer memberships");
    }
  });

  app.post("/api/admin/customer-memberships", isAdmin, injectAdminSpa, ensureSetupComplete, async (req: any, res) => {
    try {
      const validatedData = insertCustomerMembershipSchema.parse(req.body);
      const customerMembership = await storage.createCustomerMembership(validatedData);
      
      // Log customer membership creation
      await AuditLogger.logCreate(req, "customer_membership", customerMembership.id, validatedData, req.adminSpa.id);
      
      res.json(customerMembership);
    } catch (error) {
      handleRouteError(res, error, "Failed to create customer membership");
    }
  });

  app.put("/api/admin/customer-memberships/:id", isAdmin, injectAdminSpa, ensureSetupComplete, async (req: any, res) => {
    try {
      const id = parseNumericId(req.params.id);
      if (!id) {
        return res.status(400).json({ message: "Invalid customer membership ID" });
      }
      
      const before = await storage.getCustomerMembershipById(id);
      const validatedData = insertCustomerMembershipSchema.partial().parse(req.body);
      const customerMembership = await storage.updateCustomerMembership(id, validatedData);
      
      if (!customerMembership) {
        return res.status(404).json({ message: "Customer membership not found" });
      }
      
      // Log update
      if (before) {
        await AuditLogger.logUpdate(req, "customer_membership", id, before, validatedData, req.adminSpa.id);
      }
      
      res.json(customerMembership);
    } catch (error) {
      handleRouteError(res, error, "Failed to update customer membership");
    }
  });

  // Membership usage tracking
  app.get("/api/admin/membership-usage/:customerMembershipId", isAdmin, async (req, res) => {
    try {
      const customerMembershipId = parseNumericId(req.params.customerMembershipId);
      if (!customerMembershipId) {
        return res.status(400).json({ message: "Invalid customer membership ID" });
      }
      
      const usage = await storage.getMembershipUsageByCustomerMembershipId(customerMembershipId);
      res.json(usage);
    } catch (error) {
      handleRouteError(res, error, "Failed to fetch membership usage");
    }
  });

  app.post("/api/admin/membership-usage", isAdmin, injectAdminSpa, ensureSetupComplete, async (req: any, res) => {
    try {
      const validatedData = insertMembershipUsageSchema.parse(req.body);
      const usage = await storage.createMembershipUsage(validatedData);
      
      // Update remaining sessions for limited memberships
      const customerMembership = await storage.getCustomerMembershipById(validatedData.customerMembershipId);
      if (customerMembership && customerMembership.sessionsRemaining !== null) {
        await storage.updateCustomerMembership(validatedData.customerMembershipId, {
          sessionsRemaining: Math.max(0, customerMembership.sessionsRemaining - 1),
        });
      }
      
      res.json(usage);
    } catch (error) {
      handleRouteError(res, error, "Failed to record membership usage");
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

  app.post("/api/admin/staff", isAdmin, injectAdminSpa, ensureSetupComplete, async (req: any, res) => {
    try {
      // Inject spaId from admin's spa (from middleware)
      const validatedData = insertStaffSchema.parse({
        ...req.body,
        spaId: req.adminSpa.id,
      });
      const staffMember = await storage.createStaff(validatedData);
      
      // Log staff creation to audit trail
      await AuditLogger.logCreate(req, "staff", staffMember.id, validatedData, validatedData.spaId);
      
      res.json(staffMember);
    } catch (error) {
      console.error("Error creating staff member:", error);
      if (error instanceof Error) {
        console.error("Error details:", error.message);
      }
      handleRouteError(res, error, "Failed to create staff member");
    }
  });

  app.put("/api/admin/staff/:id", isAdmin, injectAdminSpa, ensureSetupComplete, async (req: any, res) => {
    try {
      const id = parseNumericId(req.params.id);
      if (!id) {
        return res.status(400).json({ message: "Invalid staff ID" });
      }
      
      const before = await storage.getStaffById(id);
      const validatedData = insertStaffSchema.partial().parse(req.body);
      const staffMember = await storage.updateStaff(id, validatedData);
      if (!staffMember) {
        return res.status(404).json({ message: "Staff member not found" });
      }
      
      // Log staff update to audit trail
      if (before) {
        await AuditLogger.logUpdate(req, "staff", id, before, validatedData, staffMember.spaId);
      }
      
      res.json(staffMember);
    } catch (error) {
      handleRouteError(res, error, "Failed to update staff member");
    }
  });

  app.delete("/api/admin/staff/:id", isAdmin, injectAdminSpa, ensureSetupComplete, async (req: any, res) => {
    try {
      const id = parseNumericId(req.params.id);
      if (!id) {
        return res.status(400).json({ message: "Invalid staff ID" });
      }
      
      const staff = await storage.getStaffById(id);
      const deleted = await storage.deleteStaff(id);
      if (!deleted) {
        return res.status(404).json({ message: "Staff member not found" });
      }
      
      // Log staff deletion to audit trail
      if (staff) {
        await AuditLogger.logDelete(req, "staff", id, staff, staff.spaId);
      }
      
      res.json({ success: true });
    } catch (error) {
      handleRouteError(res, error, "Failed to delete staff member");
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

  app.post("/api/admin/staff/:staffId/schedules", isAdmin, injectAdminSpa, ensureSetupComplete, async (req: any, res) => {
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

  app.delete("/api/admin/staff/:staffId/schedules/:id", isAdmin, injectAdminSpa, ensureSetupComplete, async (req: any, res) => {
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

  // Promo Code routes
  app.get("/api/admin/promo-codes", isAdmin, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      const spaId = user?.adminSpaId ?? undefined;
      const promoCodes = await storage.getAllPromoCodes(spaId);
      res.json(promoCodes);
    } catch (error) {
      handleRouteError(res, error, "Failed to fetch promo codes");
    }
  });

  app.post("/api/admin/promo-codes", isAdmin, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      const validatedData = insertPromoCodeSchema.parse({
        ...req.body,
        spaId: user?.adminSpaId,
        createdBy: user?.id,
      });
      const promoCode = await storage.createPromoCode(validatedData);
      
      await AuditLogger.log({
        userId: user?.id!,
        action: "CREATE",
        entityType: "service",
        entityId: promoCode.id,
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
        spaId: user?.adminSpaId ?? undefined,
      });
      
      res.json(promoCode);
    } catch (error) {
      handleRouteError(res, error, "Failed to create promo code");
    }
  });

  app.put("/api/admin/promo-codes/:id", isAdmin, async (req: any, res) => {
    try {
      const id = parseNumericId(req.params.id);
      if (id === null) {
        return res.status(400).json({ message: "Invalid promo code ID" });
      }
      
      const user = await storage.getUser(req.user.claims.sub);
      const validatedData = insertPromoCodeSchema.partial().parse(req.body);
      const promoCode = await storage.updatePromoCode(id, validatedData);
      
      if (!promoCode) {
        return res.status(404).json({ message: "Promo code not found" });
      }
      
      await AuditLogger.log({
        userId: user?.id!,
        action: "UPDATE",
        entityType: "service",
        entityId: id,
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
        spaId: user?.adminSpaId ?? undefined,
      });
      
      res.json(promoCode);
    } catch (error) {
      handleRouteError(res, error, "Failed to update promo code");
    }
  });

  app.delete("/api/admin/promo-codes/:id", isAdmin, async (req: any, res) => {
    try {
      const id = parseNumericId(req.params.id);
      if (id === null) {
        return res.status(400).json({ message: "Invalid promo code ID" });
      }
      
      const user = await storage.getUser(req.user.claims.sub);
      const deleted = await storage.deletePromoCode(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Promo code not found" });
      }
      
      await AuditLogger.log({
        userId: user?.id!,
        action: "DELETE",
        entityType: "service",
        entityId: id,
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
        spaId: user?.adminSpaId ?? undefined,
      });
      
      res.json({ success: true });
    } catch (error) {
      handleRouteError(res, error, "Failed to delete promo code");
    }
  });

  // Customer-facing promo code validation
  app.post("/api/promo-codes/validate", async (req, res) => {
    try {
      const { code, spaId, serviceIds } = req.body;
      
      if (!code || !spaId || !serviceIds || !Array.isArray(serviceIds)) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      const validation = await storage.validatePromoCode(code, spaId, serviceIds);
      res.json(validation);
    } catch (error) {
      handleRouteError(res, error, "Failed to validate promo code");
    }
  });

  // Booking routes - with staff permission enforcement
  app.get("/api/admin/bookings", requireStaffRole(staffRoles.VIEW_OWN), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Admins see all bookings
      const isAdminUser = user?.role === "admin" || user?.role === "super_admin";
      
      let bookings = await storage.getAllBookings();
      
      // For staff, filter based on role
      if (!isAdminUser) {
        const staffMember = await getStaffByUserId(userId);
        if (!staffMember) {
          return res.status(403).json({ error: "Access denied" });
        }

        const role = staffMember.role || staffRoles.BASIC;
        
        // If VIEW_OWN, only show own bookings
        if (!canViewStaffCalendar(role, staffMember.id, -1)) {
          bookings = bookings.filter(b => b.staffId === staffMember.id);
        }
        // If VIEW_ALL or higher, show all bookings (no filter needed)
      }
      
      // Enrich bookings with related data
      const enrichedBookings = await Promise.all(
        bookings.map(async (booking) => {
          const customer = await storage.getCustomerById(booking.customerId);
          const staff = booking.staffId ? await storage.getStaffById(booking.staffId) : null;
          const bookingItems = await storage.getBookingItemsByBookingId(booking.id);
          
          const allServices = await storage.getAllServices();
          const services = bookingItems.map((item) => {
            return allServices.find((s: any) => s.id === item.serviceId);
          }).filter(Boolean);

          return {
            ...booking,
            customer,
            staff,
            services,
            bookingItems,
          };
        })
      );

      res.json(enrichedBookings);
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
      const createdItems = [];
      if (req.body.items && Array.isArray(req.body.items)) {
        for (const item of req.body.items) {
          const validatedItem = insertBookingItemSchema.parse({
            ...item,
            bookingId: booking.id,
          });
          const createdItem = await storage.createBookingItem(validatedItem);
          createdItems.push(createdItem);
        }
      }
      
      // Sync to Google Calendar (non-blocking)
      if (booking.spaId) {
        syncBookingToCalendar(booking.spaId, booking.id, booking, createdItems).catch(err => {
          console.error('Calendar sync error:', err);
        });
      }
      
      res.json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.put("/api/admin/bookings/:id", requireStaffRole(staffRoles.MANAGE_BOOKINGS), async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Extract services BEFORE Zod parsing (which strips unknown fields)
      const services = req.body.services;
      
      const validatedData = insertBookingSchema.partial().parse(req.body);
      const booking = await storage.updateBooking(id, validatedData);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      const updatedItems = [];
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
          const item = await storage.createBookingItem(validatedItem);
          updatedItems.push(item);
        }
      }

      // Sync to Google Calendar (update existing event)
      if (booking.spaId && booking.metadata?.googleCalendarEventId) {
        syncBookingToCalendar(booking.spaId, booking.id, booking, updatedItems).catch(err => {
          console.error('Calendar sync error:', err);
        });
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

  app.delete("/api/admin/bookings/:id", requireStaffRole(staffRoles.MANAGE_BOOKINGS), async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Get booking before deletion to check for calendar event
      const booking = await storage.getBookingById(id);
      
      const deleted = await storage.deleteBooking(id);
      if (!deleted) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Delete from Google Calendar if synced
      if (booking && booking.spaId && booking.metadata?.googleCalendarEventId) {
        try {
          const integrations = await storage.getSpaIntegrations(booking.spaId);
          const calendarIntegration = integrations.find(
            i => i.integrationType === 'google_calendar' && i.status === 'active'
          );

          if (calendarIntegration) {
            const accessToken = await getValidAccessToken(
              calendarIntegration.provider as 'google',
              calendarIntegration.integrationType,
              calendarIntegration.encryptedTokens
            );

            await googleCalendarService.deleteEvent(
              accessToken,
              'primary',
              booking.metadata.googleCalendarEventId
            );
            console.log(`Deleted calendar event ${booking.metadata.googleCalendarEventId} for booking ${id}`);
          }
        } catch (error) {
          console.error('Failed to delete calendar event:', error);
          // Don't fail the booking deletion if calendar deletion fails
        }
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

  // Transaction routes (for manual sales)
  app.get("/api/admin/transactions", isAdmin, async (req, res) => {
    try {
      const transactions = await storage.getAllTransactions();
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post("/api/admin/sales", isAdmin, async (req, res) => {
    try {
      const validatedData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(validatedData);
      res.json(transaction);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
      }
      console.error("Error creating sale:", error);
      res.status(500).json({ message: "Failed to create sale" });
    }
  });

  // Loyalty Card routes
  app.get("/api/admin/loyalty-cards", isAdmin, async (req, res) => {
    try {
      const cards = await storage.getAllLoyaltyCards();
      res.json(cards);
    } catch (error) {
      console.error("Error fetching loyalty cards:", error);
      res.status(500).json({ message: "Failed to fetch loyalty cards" });
    }
  });

  app.get("/api/admin/loyalty-cards/:id", isAdmin, async (req, res) => {
    try {
      const id = parseNumericId(req.params.id);
      if (id === null) {
        return res.status(400).json({ message: "Invalid loyalty card ID" });
      }
      const card = await storage.getLoyaltyCardById(id);
      if (!card) {
        return res.status(404).json({ message: "Loyalty card not found" });
      }
      res.json(card);
    } catch (error) {
      console.error("Error fetching loyalty card:", error);
      res.status(500).json({ message: "Failed to fetch loyalty card" });
    }
  });

  app.get("/api/admin/customers/:customerId/loyalty-cards", isAdmin, async (req, res) => {
    try {
      const customerId = parseNumericId(req.params.customerId);
      if (customerId === null) {
        return res.status(400).json({ message: "Invalid customer ID" });
      }
      const cards = await storage.getLoyaltyCardsByCustomerId(customerId);
      res.json(cards);
    } catch (error) {
      console.error("Error fetching customer loyalty cards:", error);
      res.status(500).json({ message: "Failed to fetch customer loyalty cards" });
    }
  });

  app.post("/api/admin/loyalty-cards", isAdmin, async (req, res) => {
    try {
      const validatedData = insertLoyaltyCardSchema.parse(req.body);
      const card = await storage.createLoyaltyCard(validatedData);
      res.json(card);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid loyalty card data", errors: error.errors });
      }
      console.error("Error creating loyalty card:", error);
      res.status(500).json({ message: "Failed to create loyalty card" });
    }
  });

  app.put("/api/admin/loyalty-cards/:id", isAdmin, async (req, res) => {
    try {
      const id = parseNumericId(req.params.id);
      if (id === null) {
        return res.status(400).json({ message: "Invalid loyalty card ID" });
      }
      const validatedData = insertLoyaltyCardSchema.partial().parse(req.body);
      const card = await storage.updateLoyaltyCard(id, validatedData);
      if (!card) {
        return res.status(404).json({ message: "Loyalty card not found" });
      }
      res.json(card);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid loyalty card data", errors: error.errors });
      }
      console.error("Error updating loyalty card:", error);
      res.status(500).json({ message: "Failed to update loyalty card" });
    }
  });

  app.delete("/api/admin/loyalty-cards/:id", isAdmin, async (req, res) => {
    try {
      const id = parseNumericId(req.params.id);
      if (id === null) {
        return res.status(400).json({ message: "Invalid loyalty card ID" });
      }
      const deleted = await storage.deleteLoyaltyCard(id);
      if (!deleted) {
        return res.status(404).json({ message: "Loyalty card not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting loyalty card:", error);
      res.status(500).json({ message: "Failed to delete loyalty card" });
    }
  });

  // Loyalty Card Usage routes
  app.get("/api/admin/loyalty-cards/:cardId/usage", isAdmin, async (req, res) => {
    try {
      const cardId = parseNumericId(req.params.cardId);
      if (cardId === null) {
        return res.status(400).json({ message: "Invalid loyalty card ID" });
      }
      const usage = await storage.getLoyaltyCardUsageByCardId(cardId);
      res.json(usage);
    } catch (error) {
      console.error("Error fetching loyalty card usage:", error);
      res.status(500).json({ message: "Failed to fetch loyalty card usage" });
    }
  });

  app.post("/api/admin/loyalty-cards/:cardId/use", isAdmin, async (req, res) => {
    try {
      const cardId = parseNumericId(req.params.cardId);
      if (cardId === null) {
        return res.status(400).json({ message: "Invalid loyalty card ID" });
      }

      const validatedData = insertLoyaltyCardUsageSchema.parse({
        ...req.body,
        loyaltyCardId: cardId,
      });
      
      // Get the card to update used sessions
      const card = await storage.getLoyaltyCardById(cardId);
      if (!card) {
        return res.status(404).json({ message: "Loyalty card not found" });
      }

      // Check if card has sessions remaining
      if (card.usedSessions >= card.totalSessions) {
        return res.status(400).json({ message: "No sessions remaining on this card" });
      }

      // Create usage record
      const usage = await storage.createLoyaltyCardUsage(validatedData);

      // Update card's used sessions
      await storage.updateLoyaltyCard(cardId, {
        usedSessions: card.usedSessions + 1,
        status: card.usedSessions + 1 >= card.totalSessions ? "fully_used" : "active",
      });

      res.json(usage);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid usage data", errors: error.errors });
      }
      console.error("Error recording loyalty card usage:", error);
      res.status(500).json({ message: "Failed to record loyalty card usage" });
    }
  });

  // Product Sales routes
  app.get("/api/admin/product-sales", isAdmin, async (req, res) => {
    try {
      const sales = await storage.getAllProductSales();
      res.json(sales);
    } catch (error) {
      console.error("Error fetching product sales:", error);
      res.status(500).json({ message: "Failed to fetch product sales" });
    }
  });

  app.get("/api/admin/product-sales/:id", isAdmin, async (req, res) => {
    try {
      const id = parseNumericId(req.params.id);
      if (id === null) {
        return res.status(400).json({ message: "Invalid product sale ID" });
      }
      const sale = await storage.getProductSaleById(id);
      if (!sale) {
        return res.status(404).json({ message: "Product sale not found" });
      }
      res.json(sale);
    } catch (error) {
      console.error("Error fetching product sale:", error);
      res.status(500).json({ message: "Failed to fetch product sale" });
    }
  });

  app.get("/api/admin/customers/:customerId/product-sales", isAdmin, async (req, res) => {
    try {
      const customerId = parseNumericId(req.params.customerId);
      if (customerId === null) {
        return res.status(400).json({ message: "Invalid customer ID" });
      }
      const sales = await storage.getProductSalesByCustomerId(customerId);
      res.json(sales);
    } catch (error) {
      console.error("Error fetching customer product sales:", error);
      res.status(500).json({ message: "Failed to fetch customer product sales" });
    }
  });

  app.post("/api/admin/product-sales", isAdmin, async (req, res) => {
    try {
      const validatedData = insertProductSaleSchema.parse(req.body);
      const sale = await storage.createProductSale(validatedData);
      res.json(sale);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid product sale data", errors: error.errors });
      }
      console.error("Error creating product sale:", error);
      res.status(500).json({ message: "Failed to create product sale" });
    }
  });

  app.put("/api/admin/product-sales/:id", isAdmin, async (req, res) => {
    try {
      const id = parseNumericId(req.params.id);
      if (id === null) {
        return res.status(400).json({ message: "Invalid product sale ID" });
      }
      const validatedData = insertProductSaleSchema.partial().parse(req.body);
      const sale = await storage.updateProductSale(id, validatedData);
      if (!sale) {
        return res.status(404).json({ message: "Product sale not found" });
      }
      res.json(sale);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid product sale data", errors: error.errors });
      }
      console.error("Error updating product sale:", error);
      res.status(500).json({ message: "Failed to update product sale" });
    }
  });

  app.delete("/api/admin/product-sales/:id", isAdmin, async (req, res) => {
    try {
      const id = parseNumericId(req.params.id);
      if (id === null) {
        return res.status(400).json({ message: "Invalid product sale ID" });
      }
      const deleted = await storage.deleteProductSale(id);
      if (!deleted) {
        return res.status(404).json({ message: "Product sale not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting product sale:", error);
      res.status(500).json({ message: "Failed to delete product sale" });
    }
  });

  // Finance: Vendors routes
  app.get("/api/admin/vendors", isAdmin, async (req, res) => {
    try {
      const vendors = await storage.getAllVendors();
      res.json(vendors);
    } catch (error) {
      handleRouteError(res, error, "Failed to fetch vendors");
    }
  });

  app.get("/api/admin/vendors/:id", isAdmin, async (req, res) => {
    try {
      const id = parseNumericId(req.params.id);
      if (id === null) {
        return res.status(400).json({ message: "Invalid vendor ID" });
      }
      const vendor = await storage.getVendorById(id);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      res.json(vendor);
    } catch (error) {
      handleRouteError(res, error, "Failed to fetch vendor");
    }
  });

  app.post("/api/admin/vendors", isAdmin, async (req, res) => {
    try {
      const validatedData = insertVendorSchema.parse(req.body);
      const vendor = await storage.createVendor(validatedData);
      res.json(vendor);
    } catch (error) {
      handleRouteError(res, error, "Failed to create vendor");
    }
  });

  app.put("/api/admin/vendors/:id", isAdmin, async (req, res) => {
    try {
      const id = parseNumericId(req.params.id);
      if (id === null) {
        return res.status(400).json({ message: "Invalid vendor ID" });
      }
      const validatedData = insertVendorSchema.partial().parse(req.body);
      const vendor = await storage.updateVendor(id, validatedData);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      res.json(vendor);
    } catch (error) {
      handleRouteError(res, error, "Failed to update vendor");
    }
  });

  app.delete("/api/admin/vendors/:id", isAdmin, async (req, res) => {
    try {
      const id = parseNumericId(req.params.id);
      if (id === null) {
        return res.status(400).json({ message: "Invalid vendor ID" });
      }
      const deleted = await storage.deleteVendor(id);
      if (!deleted) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      res.json({ success: true });
    } catch (error) {
      handleRouteError(res, error, "Failed to delete vendor");
    }
  });

  // Finance: Expenses routes
  app.get("/api/admin/expenses", isAdmin, async (req, res) => {
    try {
      const expenses = await storage.getAllExpenses();
      res.json(expenses);
    } catch (error) {
      handleRouteError(res, error, "Failed to fetch expenses");
    }
  });

  app.get("/api/admin/expenses/:id", isAdmin, async (req, res) => {
    try {
      const id = parseNumericId(req.params.id);
      if (id === null) {
        return res.status(400).json({ message: "Invalid expense ID" });
      }
      const expense = await storage.getExpenseById(id);
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }
      res.json(expense);
    } catch (error) {
      handleRouteError(res, error, "Failed to fetch expense");
    }
  });

  app.post("/api/admin/expenses", isAdmin, async (req, res) => {
    try {
      const validatedData = insertExpenseSchema.parse(req.body);
      const expense = await storage.createExpense(validatedData);
      res.json(expense);
    } catch (error) {
      handleRouteError(res, error, "Failed to create expense");
    }
  });

  app.put("/api/admin/expenses/:id", isAdmin, async (req, res) => {
    try {
      const id = parseNumericId(req.params.id);
      if (id === null) {
        return res.status(400).json({ message: "Invalid expense ID" });
      }
      const validatedData = insertExpenseSchema.partial().parse(req.body);
      const expense = await storage.updateExpense(id, validatedData);
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }
      res.json(expense);
    } catch (error) {
      handleRouteError(res, error, "Failed to update expense");
    }
  });

  app.delete("/api/admin/expenses/:id", isAdmin, async (req, res) => {
    try {
      const id = parseNumericId(req.params.id);
      if (id === null) {
        return res.status(400).json({ message: "Invalid expense ID" });
      }
      const deleted = await storage.deleteExpense(id);
      if (!deleted) {
        return res.status(404).json({ message: "Expense not found" });
      }
      res.json({ success: true });
    } catch (error) {
      handleRouteError(res, error, "Failed to delete expense");
    }
  });

  // Finance: Bills routes
  app.get("/api/admin/bills", isAdmin, async (req, res) => {
    try {
      const bills = await storage.getAllBills();
      res.json(bills);
    } catch (error) {
      handleRouteError(res, error, "Failed to fetch bills");
    }
  });

  app.get("/api/admin/bills/:id", isAdmin, async (req, res) => {
    try {
      const id = parseNumericId(req.params.id);
      if (id === null) {
        return res.status(400).json({ message: "Invalid bill ID" });
      }
      const bill = await storage.getBillById(id);
      if (!bill) {
        return res.status(404).json({ message: "Bill not found" });
      }
      res.json(bill);
    } catch (error) {
      handleRouteError(res, error, "Failed to fetch bill");
    }
  });

  app.post("/api/admin/bills", isAdmin, async (req, res) => {
    try {
      const validatedData = insertBillSchema.parse(req.body);
      const bill = await storage.createBill(validatedData);
      res.json(bill);
    } catch (error) {
      handleRouteError(res, error, "Failed to create bill");
    }
  });

  app.put("/api/admin/bills/:id", isAdmin, async (req, res) => {
    try {
      const id = parseNumericId(req.params.id);
      if (id === null) {
        return res.status(400).json({ message: "Invalid bill ID" });
      }
      const validatedData = insertBillSchema.partial().parse(req.body);
      const bill = await storage.updateBill(id, validatedData);
      if (!bill) {
        return res.status(404).json({ message: "Bill not found" });
      }
      res.json(bill);
    } catch (error) {
      handleRouteError(res, error, "Failed to update bill");
    }
  });

  app.delete("/api/admin/bills/:id", isAdmin, async (req, res) => {
    try {
      const id = parseNumericId(req.params.id);
      if (id === null) {
        return res.status(400).json({ message: "Invalid bill ID" });
      }
      const deleted = await storage.deleteBill(id);
      if (!deleted) {
        return res.status(404).json({ message: "Bill not found" });
      }
      res.json({ success: true });
    } catch (error) {
      handleRouteError(res, error, "Failed to delete bill");
    }
  });

  // Revenue and VAT routes (admin only)
  app.get("/api/admin/revenue-summary", isAdmin, async (req, res) => {
    try {
      const { startDate, endDate, spaId } = req.query;
      
      const filters: any = {};
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      if (spaId) filters.spaId = parseInt(spaId as string);
      
      const summary = await storage.getRevenueSummary(filters);
      res.json(summary);
    } catch (error) {
      handleRouteError(res, error, "Failed to fetch revenue summary");
    }
  });

  app.get("/api/admin/vat-payable", isAdmin, async (req, res) => {
    try {
      const { startDate, endDate, spaId } = req.query;
      
      const filters: any = {};
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      if (spaId) filters.spaId = parseInt(spaId as string);
      
      const summary = await storage.getVATPayableSummary(filters);
      res.json(summary);
    } catch (error) {
      handleRouteError(res, error, "Failed to fetch VAT payable summary");
    }
  });

  // FTA Audit File (FAF) Export for UAE Tax Compliance
  app.get("/api/admin/faf-export", isAdmin, async (req, res) => {
    try {
      const { startDate, endDate, spaId, format } = req.query;
      const { generateFAFExport, convertFAFToCSV } = await import('./fafExport');
      
      const filters: any = {};
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      if (spaId) filters.spaId = parseInt(spaId as string);
      
      const records = await generateFAFExport(filters);
      
      if (format === 'csv') {
        const csv = convertFAFToCSV(records);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="FTA_Audit_${new Date().toISOString().split('T')[0]}.csv"`);
        return res.send(csv);
      }
      
      res.json(records);
    } catch (error) {
      handleRouteError(res, error, "Failed to generate FTA audit file");
    }
  });

  // Audit Logs routes (admin only)
  app.get("/api/admin/audit-logs", isAdmin, async (req, res) => {
    try {
      const { userId, action, entityType, entityId, spaId, startDate, endDate, limit } = req.query;
      
      const filters: any = {};
      if (userId) filters.userId = userId as string;
      if (action) filters.action = action as string;
      if (entityType) filters.entityType = entityType as string;
      if (entityId) filters.entityId = parseInt(entityId as string);
      if (spaId) filters.spaId = parseInt(spaId as string);
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      if (limit) filters.limit = parseInt(limit as string);
      
      const logs = await storage.getAuditLogs(filters);
      res.json(logs);
    } catch (error) {
      handleRouteError(res, error, "Failed to fetch audit logs");
    }
  });

  // ==================== NOTIFICATION PROVIDER MANAGEMENT ====================
  
  // Validate provider credentials (admin only)
  app.post("/api/admin/notification-providers/validate", isAdmin, async (req, res) => {
    try {
      const { provider, channel, credentials } = req.body;
      
      let result;
      
      if (channel === 'email') {
        if (provider === 'sendgrid' || provider === 'resend') {
          result = await validateEmailCredentials(provider, credentials.apiKey);
        } else if (provider === 'msg91') {
          result = await validateMsg91Credentials(credentials.authKey);
        } else {
          return res.status(400).json({ message: "Unsupported email provider" });
        }
      } else if (channel === 'sms' || channel === 'whatsapp') {
        if (provider === 'twilio') {
          result = await validateTwilioCredentials(
            credentials.accountSid,
            credentials.authToken
          );
        } else if (provider === 'msg91') {
          result = await validateMsg91Credentials(credentials.authKey);
        } else {
          return res.status(400).json({ message: "Unsupported SMS/WhatsApp provider" });
        }
      } else {
        return res.status(400).json({ message: "Unsupported channel" });
      }
      
      if (result.valid) {
        res.json({ valid: true, details: result.details });
      } else {
        res.status(400).json({ valid: false, error: result.error });
      }
    } catch (error) {
      handleRouteError(res, error, "Failed to validate credentials");
    }
  });

  // Get all configured notification providers for a spa (admin only)
  app.get("/api/admin/notification-providers", isAdmin, async (req, res) => {
    try {
      const spaId = parseInt(req.query.spaId as string) || 1; // TODO: Get from auth context
      const providers = await storage.getNotificationProviders(spaId);
      
      // Don't expose encrypted credentials in response
      const sanitized = providers.map(p => ({
        id: p.id,
        spaId: p.spaId,
        provider: p.provider,
        channel: p.channel,
        isActive: p.isActive,
        fromEmail: p.fromEmail,
        fromPhone: p.fromPhone,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }));
      
      res.json(sanitized);
    } catch (error) {
      handleRouteError(res, error, "Failed to fetch notification providers");
    }
  });

  // Save or update notification provider credentials (admin only)
  app.post("/api/admin/notification-providers", isAdmin, async (req, res) => {
    try {
      const userId = (req as any).user.claims.sub;
      const { spaId, provider, channel, credentials, fromEmail, fromPhone } = req.body;
      
      // Validate credentials first
      let validationResult;
      if (channel === 'email') {
        if (provider === 'msg91') {
          validationResult = await validateMsg91Credentials(credentials.authKey);
        } else {
          validationResult = await validateEmailCredentials(provider, credentials.apiKey);
        }
      } else if (provider === 'twilio') {
        validationResult = await validateTwilioCredentials(
          credentials.accountSid,
          credentials.authToken
        );
      } else if (provider === 'msg91') {
        validationResult = await validateMsg91Credentials(credentials.authKey);
      } else {
        return res.status(400).json({ message: "Unsupported provider" });
      }
      
      if (!validationResult.valid) {
        return res.status(400).json({ 
          message: "Invalid credentials", 
          error: validationResult.error 
        });
      }
      
      // Encrypt credentials
      const encryptedCredentials = encryptJSON({ ...credentials, provider });
      
      // Check if provider already exists for this spa and channel
      const existing = await storage.getNotificationProviderByChannel(spaId, channel);
      
      let savedProvider;
      if (existing) {
        // Update existing
        savedProvider = await storage.updateNotificationProvider(existing.id, {
          provider,
          encryptedCredentials,
          fromEmail: fromEmail || null,
          fromPhone: fromPhone || null,
          isActive: true,
          updatedAt: new Date(),
        });
      } else {
        // Create new
        savedProvider = await storage.createNotificationProvider({
          spaId,
          provider,
          channel,
          encryptedCredentials,
          fromEmail: fromEmail || null,
          fromPhone: fromPhone || null,
          isActive: true,
        });
      }
      
      // Log audit trail
      await AuditLogger.log({
        userId,
        spaId,
        action: existing ? 'UPDATE' : 'CREATE',
        entityType: 'notification_provider',
        entityId: savedProvider.id,
        after: {
          provider,
          channel,
          isActive: true,
        },
      });
      
      // Return sanitized response
      res.json({
        id: savedProvider.id,
        spaId: savedProvider.spaId,
        provider: savedProvider.provider,
        channel: savedProvider.channel,
        isActive: savedProvider.isActive,
        fromEmail: savedProvider.fromEmail,
        fromPhone: savedProvider.fromPhone,
        validationDetails: validationResult.details,
      });
    } catch (error) {
      handleRouteError(res, error, "Failed to save notification provider");
    }
  });

  // Delete notification provider (admin only)
  app.delete("/api/admin/notification-providers/:id", isAdmin, async (req, res) => {
    try {
      const userId = (req as any).user.claims.sub;
      const id = parseNumericId(req.params.id);
      if (id === null) {
        return res.status(400).json({ message: "Invalid provider ID" });
      }
      
      const provider = await storage.getNotificationProviderById(id);
      if (!provider) {
        return res.status(404).json({ message: "Provider not found" });
      }
      
      await storage.deleteNotificationProvider(id);
      
      // Log audit trail
      await AuditLogger.log({
        userId,
        spaId: provider.spaId,
        action: 'DELETE',
        entityType: 'notification_provider',
        entityId: id,
      });
      
      res.json({ success: true });
    } catch (error) {
      handleRouteError(res, error, "Failed to delete notification provider");
    }
  });

  // ==================== UAE FTA COMPLIANCE ROUTES ====================
  
  // Get VAT Return Report (aggregates all revenue streams)
  app.get("/api/admin/vat-report", isAdmin, async (req, res) => {
    try {
      const userId = (req as any).user.claims.sub;
      const user = await storage.getUserById(userId);
      if (!user || !user.spaId) {
        return res.status(403).json({ message: "Access denied: No spa assignment" });
      }
      
      const { from, to, taxCode } = req.query;
      const filters: any = { spaId: user.spaId };
      
      if (from) filters.startDate = new Date(from as string);
      if (to) filters.endDate = new Date(to as string);
      if (taxCode) filters.taxCode = taxCode as string;
      
      const { getVATReturnReport } = await import("./vatReport");
      const report = await getVATReturnReport(filters);
      
      res.json(report);
    } catch (error) {
      handleRouteError(res, error, "Failed to generate VAT report");
    }
  });
  
  // Export FAF (FTA Audit File)
  app.post("/api/admin/export-faf", isAdmin, async (req, res) => {
    try {
      const userId = (req as any).user.claims.sub;
      const user = await storage.getUserById(userId);
      if (!user || !user.spaId) {
        return res.status(403).json({ message: "Access denied: No spa assignment" });
      }
      
      const { startDate, endDate } = req.body;
      const filters: any = { spaId: user.spaId };
      
      if (startDate) filters.startDate = new Date(startDate);
      if (endDate) filters.endDate = new Date(endDate);
      
      const { generateFAFExport } = await import("./fafExport");
      const csvContent = await generateFAFExport(filters);
      
      // Return CSV content directly
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="FAF_Export_${Date.now()}.csv"`);
      res.send(csvContent);
    } catch (error) {
      handleRouteError(res, error, "Failed to export FAF file");
    }
  });
  
  // Get Amendment Logs (audit trail)
  app.get("/api/admin/amendments", isAdmin, async (req, res) => {
    try {
      const { type, tableName, from, to, recordId } = req.query;
      const filters: any = {};
      
      if (type) filters.changeType = type as string;
      if (tableName) filters.tableName = tableName as string;
      if (from) filters.startDate = new Date(from as string);
      if (to) filters.endDate = new Date(to as string);
      if (recordId) filters.recordId = parseInt(recordId as string);
      
      const { getAmendmentLogs } = await import("./amendmentLogger");
      const logs = await getAmendmentLogs(filters);
      
      res.json(logs);
    } catch (error) {
      handleRouteError(res, error, "Failed to fetch amendment logs");
    }
  });
  
  // Get Audit Trail for specific record
  app.get("/api/admin/audit-trail/:tableName/:recordId", isAdmin, async (req, res) => {
    try {
      const { tableName, recordId } = req.params;
      const { getRecordAuditTrail } = await import("./amendmentLogger");
      const trail = await getRecordAuditTrail(tableName, parseInt(recordId));
      
      res.json(trail);
    } catch (error) {
      handleRouteError(res, error, "Failed to fetch audit trail");
    }
  });
  
  // Get Backup Logs
  app.get("/api/admin/backup-logs", isAdmin, async (req, res) => {
    try {
      const logs = await storage.getBackupLogs();
      res.json(logs);
    } catch (error) {
      handleRouteError(res, error, "Failed to fetch backup logs");
    }
  });
  
  // Create Backup Log (for automated backup systems)
  app.post("/api/admin/backup-logs", isAdmin, async (req, res) => {
    try {
      const userId = (req as any).user.claims.sub;
      const logData = {
        ...req.body,
        createdBy: parseInt(userId),
      };
      
      const log = await storage.createBackupLog(logData);
      res.json(log);
    } catch (error) {
      handleRouteError(res, error, "Failed to create backup log");
    }
  });
  
  // Import FTA Test Data (for certification testing)
  app.post("/api/admin/import-test-data", isAdmin, async (req, res) => {
    try {
      const { data } = req.body;
      
      if (!data || !Array.isArray(data)) {
        return res.status(400).json({ message: "Invalid test data format: expected array" });
      }
      
      const { importFTATestData } = await import("./testDataImport");
      const result = await importFTATestData(data);
      
      res.json(result);
    } catch (error) {
      handleRouteError(res, error, "Failed to import test data");
    }
  });
  
  // Generate Sample Test Data (for testing)
  app.get("/api/admin/sample-test-data", isAdmin, async (req, res) => {
    try {
      const { generateSampleTestData } = await import("./testDataImport");
      const sampleData = generateSampleTestData();
      
      res.json(sampleData);
    } catch (error) {
      handleRouteError(res, error, "Failed to generate sample test data");
    }
  });

  // ==================== NOTIFICATION WEBHOOKS ====================
  
  // Twilio delivery status webhook
  app.post("/api/webhooks/twilio", async (req, res) => {
    try {
      const { MessageSid, MessageStatus, To, From, ErrorCode, ErrorMessage } = req.body;
      
      // Update message status in database
      await storage.updateNotificationEventStatus(MessageSid, {
        status: MessageStatus,
        errorMessage: ErrorMessage || null,
        deliveredAt: MessageStatus === 'delivered' ? new Date() : null,
      });
      
      console.log(`📥 Twilio webhook: ${MessageSid} - ${MessageStatus}`);
      res.status(200).send('OK');
    } catch (error) {
      console.error('Twilio webhook error:', error);
      res.status(500).send('Error');
    }
  });
  
  // MSG91 delivery status webhook
  app.post("/api/webhooks/msg91", async (req, res) => {
    try {
      const { requestId, status, mobile, errorCode, errorMessage } = req.body;
      
      // Update message status in database
      await storage.updateNotificationEventStatus(requestId, {
        status: status,
        errorMessage: errorMessage || null,
        deliveredAt: status === 'DELIVRD' ? new Date() : null,
      });
      
      console.log(`📥 MSG91 webhook: ${requestId} - ${status}`);
      res.status(200).send('OK');
    } catch (error) {
      console.error('MSG91 webhook error:', error);
      res.status(500).send('Error');
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
