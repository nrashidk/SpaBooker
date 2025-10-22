import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import session from "express-session";
import { db } from "../db";
import { registerRoutes } from "../routes";
import { users, adminApplications, spas } from "../../../shared/schema";
import { eq } from "drizzle-orm";
import { cleanupTestData } from "./setup";

const app = express();
app.use(express.json());
app.use(
  session({
    secret: "test-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

describe("Admin Onboarding and Approval Workflow", () => {
  let superAdminSession: request.SuperAgentTest;
  let newAdminUserId: string;
  let applicationId: number;

  beforeAll(async () => {
    await registerRoutes(app);
    await cleanupTestData();
    
    // Create and authenticate super admin
    const superAdminId = `super-admin-${Date.now()}`;
    await db.insert(users).values({
      id: superAdminId,
      email: `superadmin-${Date.now()}@test.com`,
      role: "super_admin",
    });

    superAdminSession = request.agent(app);
    // Mock Replit auth by setting user in session
    (superAdminSession as any).user = {
      claims: { sub: superAdminId },
    };
  });

  afterAll(async () => {
    // Cleanup
    if (newAdminUserId) {
      await db.delete(users).where(eq(users.id, newAdminUserId));
    }
    if (applicationId) {
      await db.delete(adminApplications).where(eq(adminApplications.id, applicationId));
    }
  });

  describe("Step 1: Admin Registration", () => {
    it("should allow new admin to register with spa details", async () => {
      newAdminUserId = `new-admin-${Date.now()}`;
      const email = `newadmin-${Date.now()}@test.com`;

      // Create user (simulating Replit Auth)
      await db.insert(users).values({
        id: newAdminUserId,
        email,
        role: "admin",
        approved: false,
      });

      // Submit admin application
      const response = await request(app)
        .post("/api/admin/register")
        .send({
          userId: newAdminUserId,
          spaName: "Luxury Spa Test",
          businessLicense: "LICENSE123",
          licenseUrl: "https://example.com/license.pdf",
        });

      expect(response.status).toBe(201);
      expect(response.body.application).toBeDefined();
      expect(response.body.application.userId).toBe(newAdminUserId);
      expect(response.body.application.spaName).toBe("Luxury Spa Test");
      expect(response.body.application.status).toBe("pending");

      applicationId = response.body.application.id;
    });

    it("should prevent duplicate applications from same user", async () => {
      const response = await request(app)
        .post("/api/admin/register")
        .send({
          userId: newAdminUserId,
          spaName: "Another Spa",
          businessLicense: "LICENSE456",
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("already submitted");
    });
  });

  describe("Step 2: Super Admin Approval", () => {
    it("should show pending application to super admin", async () => {
      const response = await superAdminSession
        .get("/api/super-admin/applications")
        .query({ status: "pending" });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      const pendingApp = response.body.find((app: any) => app.id === applicationId);
      expect(pendingApp).toBeDefined();
      expect(pendingApp.status).toBe("pending");
    });

    it("should allow super admin to approve application", async () => {
      const response = await superAdminSession
        .post(`/api/super-admin/applications/${applicationId}/approve`)
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.application.status).toBe("approved");

      // Verify user is marked as approved
      const [user] = await db.select().from(users).where(eq(users.id, newAdminUserId));
      expect(user.approved).toBe(true);
    });

    it("should prevent duplicate approval", async () => {
      const response = await superAdminSession
        .post(`/api/super-admin/applications/${applicationId}/approve`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("already approved");
    });
  });

  describe("Step 3: Approved Admin Access", () => {
    let approvedAdminSession: request.SuperAgentTest;

    beforeEach(() => {
      approvedAdminSession = request.agent(app);
      (approvedAdminSession as any).user = {
        claims: { sub: newAdminUserId },
      };
    });

    it("should allow approved admin to access setup wizard", async () => {
      const response = await approvedAdminSession
        .get("/api/admin/setup/status");

      expect(response.status).toBe(200);
      expect(response.body.spaId).toBeNull(); // No spa created yet
      expect(response.body.setupComplete).toBe(false);
      expect(response.body.steps).toBeDefined();
    });

    it("should block approved admin from other admin routes until setup complete", async () => {
      const response = await approvedAdminSession
        .get("/api/admin/bookings");

      expect(response.status).toBe(403);
      expect(response.body.setupRequired).toBe(true);
      expect(response.body.message).toContain("complete the setup wizard");
    });

    it("should allow approved admin to start setup wizard", async () => {
      const response = await approvedAdminSession
        .post("/api/admin/setup/step/basicInfo")
        .send({
          name: "Luxury Spa",
          slug: "luxury-spa-test",
          description: "A premium spa experience",
          contactEmail: `newadmin-${Date.now()}@test.com`,
          contactPhone: "+971501234567",
          currency: "AED",
        });

      expect(response.status).toBe(200);
      expect(response.body.id).toBeDefined();
      expect(response.body.name).toBe("Luxury Spa");
      expect(response.body.active).toBe(false);
      expect(response.body.setupComplete).toBe(false);
    });
  });

  describe("Rejection Flow", () => {
    let rejectedAdminUserId: string;
    let rejectedApplicationId: number;

    beforeAll(async () => {
      // Create another admin for rejection test
      rejectedAdminUserId = `rejected-admin-${Date.now()}`;
      const email = `rejected-${Date.now()}@test.com`;

      await db.insert(users).values({
        id: rejectedAdminUserId,
        email,
        role: "admin",
        approved: false,
      });

      // Submit application
      const response = await request(app)
        .post("/api/admin/register")
        .send({
          userId: rejectedAdminUserId,
          spaName: "Spa to Reject",
          businessLicense: "REJECT123",
        });

      rejectedApplicationId = response.body.application.id;
    });

    afterAll(async () => {
      await db.delete(users).where(eq(users.id, rejectedAdminUserId));
      await db.delete(adminApplications).where(eq(adminApplications.id, rejectedApplicationId));
    });

    it("should allow super admin to reject application", async () => {
      const response = await superAdminSession
        .post(`/api/super-admin/applications/${rejectedApplicationId}/reject`)
        .send({
          reason: "Insufficient documentation",
        });

      expect(response.status).toBe(200);
      expect(response.body.application.status).toBe("rejected");
      expect(response.body.application.rejectionReason).toBe("Insufficient documentation");
    });

    it("should prevent rejected admin from accessing setup wizard", async () => {
      const rejectedAdminSession = request.agent(app);
      (rejectedAdminSession as any).user = {
        claims: { sub: rejectedAdminUserId },
      };

      const response = await rejectedAdminSession
        .get("/api/admin/setup/status");

      expect(response.status).toBe(403);
      expect(response.body.message).toContain("not approved");
    });
  });
});
