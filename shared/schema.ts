import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, decimal, jsonb, serial, index, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table with Replit Auth integration + role-based access
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: text("role").notNull().default("customer"), // customer, staff, admin, super_admin
  status: text("status").notNull().default("approved"), // pending, approved, rejected (for admin registrations)
  adminSpaId: integer("admin_spa_id"), // Links admin users to their spa
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users);
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Admin Applications - tracks admin registration and approval process
export const adminApplications = pgTable("admin_applications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  businessName: text("business_name").notNull(),
  businessType: text("business_type"), // spa, salon, barbershop, etc.
  contactPhone: text("contact_phone"),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  appliedAt: timestamp("applied_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: varchar("reviewed_by").references(() => users.id), // Super admin who reviewed
  rejectionReason: text("rejection_reason"),
  notes: text("notes"),
});

export const insertAdminApplicationSchema = createInsertSchema(adminApplications).omit({ id: true, appliedAt: true });
export type InsertAdminApplication = z.infer<typeof insertAdminApplicationSchema>;
export type AdminApplication = typeof adminApplications.$inferSelect;

// Spas/Venues table (multiple spas using the system)
export const spas = pgTable("spas", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(), // URL-friendly identifier
  description: text("description"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  address: text("address"),
  city: text("city"),
  area: text("area"), // neighborhood/area for better search
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  businessHours: jsonb("business_hours"), // { monday: { open: "09:00", close: "20:00" }, ... }
  cancellationPolicy: jsonb("cancellation_policy"), // { hoursBeforeBooking: 24, description: "Free cancellation up to 24 hours before appointment" }
  currency: text("currency").notNull().default("AED"),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default("5.00"),
  logoUrl: text("logo_url"),
  coverImageUrl: text("cover_image_url"),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("5.00"),
  reviewCount: integer("review_count").default(0),
  active: boolean("active").default(true),
  featured: boolean("featured").default(false),
  setupComplete: boolean("setup_complete").default(false), // Tracks if admin completed spa setup wizard
  setupSteps: jsonb("setup_steps"), // { basicInfo: true, location: true, hours: true, services: false, staff: false, policies: false, inventory: false, activation: false }
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Spa settings (system-wide configuration - kept for backward compatibility)
export const spaSettings = pgTable("spa_settings", {
  id: serial("id").primaryKey(),
  spaName: text("spa_name").notNull().default("Serene Spa"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  address: text("address"),
  businessHours: jsonb("business_hours"), // { monday: { open: "09:00", close: "20:00" }, ... }
  currency: text("currency").notNull().default("AED"),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default("5.00"),
  logoUrl: text("logo_url"),
  brandColor: text("brand_color").default("#1a4d6d"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Service categories
export const serviceCategories = pgTable("service_categories", {
  id: serial("id").primaryKey(),
  spaId: integer("spa_id").references(() => spas.id),
  name: text("name").notNull(),
  displayOrder: integer("display_order").default(0),
  active: boolean("active").default(true),
});

// Services
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  spaId: integer("spa_id").references(() => spas.id).notNull(),
  categoryId: integer("category_id").references(() => serviceCategories.id),
  name: text("name").notNull(),
  description: text("description"),
  duration: integer("duration").notNull(), // in minutes
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  discountPercent: decimal("discount_percent", { precision: 5, scale: 2 }),
  featured: boolean("featured").default(false),
  active: boolean("active").default(true),
  packageOffer: jsonb("package_offer"), // { description: string, originalPrice: number }
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Staff roles and permissions
export const staffRoles = {
  BASIC: "basic", // Only receives notifications when selected by customer
  VIEW_OWN: "view_own_calendar", // Can view only their own calendar
  VIEW_ALL: "view_all_calendars", // Can view all team calendars
  MANAGE_BOOKINGS: "manage_bookings", // Can edit calendar and appointments
  ADMIN_ACCESS: "admin_access", // Can view dashboard and download reports
} as const;

export type StaffRole = typeof staffRoles[keyof typeof staffRoles];

// Staff role metadata for UI
export const staffRoleInfo = {
  basic: {
    label: "Basic Staff",
    description: "Only receives email notifications when selected by customer",
    permissions: ["Receive booking notifications"],
  },
  view_own_calendar: {
    label: "View Own Calendar",
    description: "Can view their own calendar and appointments",
    permissions: ["View own calendar", "Receive booking notifications"],
  },
  view_all_calendars: {
    label: "View All Calendars",
    description: "Can view all team members' calendars",
    permissions: ["View all calendars", "View own calendar", "Receive booking notifications"],
  },
  manage_bookings: {
    label: "Manage Bookings",
    description: "Can edit calendar and manage appointments",
    permissions: ["Edit appointments", "View all calendars", "View own calendar", "Receive booking notifications"],
  },
  admin_access: {
    label: "Admin Access",
    description: "Full access to dashboard, reports, and analytics",
    permissions: ["View dashboard", "Download reports", "Edit appointments", "View all calendars", "View own calendar", "Receive booking notifications"],
  },
} as const;

// Staff members
export const staff = pgTable("staff", {
  id: serial("id").primaryKey(),
  spaId: integer("spa_id").references(() => spas.id).notNull(),
  userId: varchar("user_id").references(() => users.id),
  name: text("name").notNull(),
  specialty: text("specialty"),
  email: text("email"),
  phone: text("phone"),
  role: text("role").notNull().default("basic"), // basic, view_own_calendar, view_all_calendars, manage_bookings, admin_access
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).default("0.00"), // percentage
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  active: boolean("active").default(true),
  avatarUrl: text("avatar_url"),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("5.00"),
  reviewCount: integer("review_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Staff schedules/availability
export const staffSchedules = pgTable("staff_schedules", {
  id: serial("id").primaryKey(),
  staffId: integer("staff_id").references(() => staff.id).notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 0=Sunday, 6=Saturday
  startTime: text("start_time").notNull(), // HH:MM format
  endTime: text("end_time").notNull(),
  active: boolean("active").default(true),
});

// Products for inventory
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  sku: text("sku").unique(),
  categoryId: integer("category_id"),
  costPrice: decimal("cost_price", { precision: 10, scale: 2 }),
  sellingPrice: decimal("selling_price", { precision: 10, scale: 2 }).notNull(),
  stockQuantity: integer("stock_quantity").default(0),
  reorderLevel: integer("reorder_level").default(10),
  supplier: text("supplier"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_products_category").on(table.categoryId),
  index("idx_products_sku").on(table.sku),
  index("idx_products_active").on(table.active),
]);

// Customers
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  loyaltyPoints: integer("loyalty_points").default(0),
  totalSpent: decimal("total_spent", { precision: 10, scale: 2 }).default("0.00"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Promo Codes
export const promoCodes = pgTable("promo_codes", {
  id: serial("id").primaryKey(),
  spaId: integer("spa_id").references(() => spas.id).notNull(),
  code: text("code").notNull(),
  description: text("description"),
  discountType: text("discount_type").notNull(), // flat, percentage
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull(),
  validFrom: timestamp("valid_from").notNull(),
  validUntil: timestamp("valid_until").notNull(),
  applicableServices: jsonb("applicable_services"), // array of service IDs, null means all services
  usageLimit: integer("usage_limit"), // null means unlimited
  timesUsed: integer("times_used").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: varchar("created_by").references(() => users.id),
}, (table) => [
  index("idx_promo_codes_spa").on(table.spaId),
  index("idx_promo_codes_code").on(table.code),
  index("idx_promo_codes_active").on(table.isActive),
]);

export const insertPromoCodeSchema = createInsertSchema(promoCodes).omit({ id: true, createdAt: true, timesUsed: true });
export type InsertPromoCode = z.infer<typeof insertPromoCodeSchema>;
export type PromoCode = typeof promoCodes.$inferSelect;

// Bookings
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  spaId: integer("spa_id").references(() => spas.id).notNull(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  staffId: integer("staff_id").references(() => staff.id),
  bookingDate: timestamp("booking_date").notNull(),
  status: text("status").notNull().default("confirmed"), // confirmed, completed, cancelled, no-show, modified
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }),
  promoCodeId: integer("promo_code_id").references(() => promoCodes.id), // track which promo code was used
  discountType: text("discount_type"), // flat, percentage
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).default("0.00"), // e.g., 50 for AED 50 or 20 for 20%
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0.00"), // calculated discount amount
  notes: text("notes"),
  notificationSent: boolean("notification_sent").default(false),
  cancelledAt: timestamp("cancelled_at"),
  cancellationReason: text("cancellation_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_bookings_customer").on(table.customerId),
  index("idx_bookings_staff").on(table.staffId),
  index("idx_bookings_date").on(table.bookingDate),
  index("idx_bookings_status").on(table.status),
  index("idx_bookings_spa").on(table.spaId),
  index("idx_bookings_promo_code").on(table.promoCodeId),
]);

// Booking items (services in a booking)
export const bookingItems = pgTable("booking_items", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id).notNull(),
  serviceId: integer("service_id").references(() => services.id).notNull(),
  staffId: integer("staff_id").references(() => staff.id),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  duration: integer("duration").notNull(),
});

// Invoices
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  bookingId: integer("booking_id").references(() => bookings.id),
  issueDate: timestamp("issue_date").defaultNow().notNull(),
  dueDate: timestamp("due_date"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0.00"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }).default("0.00"),
  status: text("status").notNull().default("pending"), // pending, paid, overdue, cancelled
  paymentMethod: text("payment_method"), // cash, card, online
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_invoices_customer").on(table.customerId),
  index("idx_invoices_status").on(table.status),
  index("idx_invoices_due_date").on(table.dueDate),
  index("idx_invoices_booking").on(table.bookingId),
]);

// Invoice line items
export const invoiceItems = pgTable("invoice_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").references(() => invoices.id).notNull(),
  itemType: text("item_type").notNull(), // service, product
  itemId: integer("item_id").notNull(),
  description: text("description").notNull(),
  quantity: integer("quantity").default(1),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
});

// Transactions/Payments
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").references(() => invoices.id),
  transactionType: text("transaction_type").notNull(), // payment, refund, expense
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method"), // cash, card, online
  transactionDate: timestamp("transaction_date").defaultNow().notNull(),
  reference: text("reference"),
  notes: text("notes"),
});

// Staff time tracking
export const staffTimeEntries = pgTable("staff_time_entries", {
  id: serial("id").primaryKey(),
  staffId: integer("staff_id").references(() => staff.id).notNull(),
  clockIn: timestamp("clock_in").notNull(),
  clockOut: timestamp("clock_out"),
  totalHours: decimal("total_hours", { precision: 5, scale: 2 }),
  notes: text("notes"),
});

// Vendors (for accounts payable)
export const vendors = pgTable("vendors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  category: text("category"), // supplier, utility_provider, landlord, service_provider, etc.
  paymentTerms: text("payment_terms"), // net_15, net_30, net_60, immediate
  taxId: text("tax_id"),
  notes: text("notes"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Bills (Purchase invoices - accounts payable)
export const bills = pgTable("bills", {
  id: serial("id").primaryKey(),
  billNumber: text("bill_number").notNull().unique(),
  vendorId: integer("vendor_id").references(() => vendors.id).notNull(),
  billDate: timestamp("bill_date").notNull(),
  dueDate: timestamp("due_date").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0.00"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }).default("0.00"),
  status: text("status").notNull().default("unpaid"), // unpaid, partial, paid, overdue
  category: text("category"), // rent, utilities, materials, services, etc.
  notes: text("notes"),
  attachmentUrl: text("attachment_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Bill line items
export const billItems = pgTable("bill_items", {
  id: serial("id").primaryKey(),
  billId: integer("bill_id").references(() => bills.id).notNull(),
  description: text("description").notNull(),
  quantity: integer("quantity").default(1),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  category: text("category"), // for expense categorization
});

// Expenses (updated to link with bills)
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(), // supplies, utilities, salary, marketing, etc.
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  expenseDate: timestamp("expense_date").defaultNow().notNull(),
  vendor: text("vendor"),
  vendorId: integer("vendor_id").references(() => vendors.id),
  billId: integer("bill_id").references(() => bills.id),
  receiptUrl: text("receipt_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Inventory transactions
export const inventoryTransactions = pgTable("inventory_transactions", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id).notNull(),
  transactionType: text("transaction_type").notNull(), // purchase, sale, adjustment, return
  quantity: integer("quantity").notNull(),
  unitCost: decimal("unit_cost", { precision: 10, scale: 2 }),
  reference: text("reference"),
  notes: text("notes"),
  transactionDate: timestamp("transaction_date").defaultNow().notNull(),
});

// Loyalty Cards (packages/prepaid services)
export const loyaltyCards = pgTable("loyalty_cards", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  cardType: text("card_type").notNull(), // e.g., "6-session haircut package"
  serviceId: integer("service_id").references(() => services.id), // linked service type
  purchaseDate: timestamp("purchase_date").defaultNow().notNull(),
  totalSessions: integer("total_sessions").notNull(), // total sessions in package
  usedSessions: integer("used_sessions").default(0).notNull(), // sessions already used
  expiryDate: timestamp("expiry_date"), // optional expiry
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }).notNull(),
  discountType: text("discount_type"), // flat, percentage
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).default("0.00"), // e.g., 50 for AED 50 or 20 for 20%
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0.00"),
  status: text("status").notNull().default("active"), // active, expired, fully_used, cancelled
  invoiceId: integer("invoice_id").references(() => invoices.id), // links to payment
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Loyalty Card Usage tracking
export const loyaltyCardUsage = pgTable("loyalty_card_usage", {
  id: serial("id").primaryKey(),
  loyaltyCardId: integer("loyalty_card_id").references(() => loyaltyCards.id).notNull(),
  bookingId: integer("booking_id").references(() => bookings.id).notNull(),
  bookingItemId: integer("booking_item_id").references(() => bookingItems.id), // specific service used
  usedAt: timestamp("used_at").defaultNow().notNull(),
  sessionValue: decimal("session_value", { precision: 10, scale: 2 }).notNull(), // value of this session
  notes: text("notes"),
});

// Product Sales (retail/POS transactions)
export const productSales = pgTable("product_sales", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0.00"),
  saleDate: timestamp("sale_date").defaultNow().notNull(),
  invoiceId: integer("invoice_id").references(() => invoices.id), // links to invoice
  transactionId: integer("transaction_id").references(() => transactions.id), // links to payment
  soldBy: integer("sold_by").references(() => staff.id), // staff member who made the sale
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Zod schemas for validation
export const insertSpaSchema = createInsertSchema(spas).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSpaSettingsSchema = createInsertSchema(spaSettings).omit({ id: true, updatedAt: true });
export const insertServiceCategorySchema = createInsertSchema(serviceCategories).omit({ id: true });
export const insertServiceSchema = createInsertSchema(services).omit({ id: true, createdAt: true });
export const insertStaffSchema = createInsertSchema(staff).omit({ id: true, createdAt: true }).extend({
  role: z.enum(["basic", "view_own_calendar", "view_all_calendars", "manage_bookings", "admin_access"]).default("basic"),
});
export const insertStaffScheduleSchema = createInsertSchema(staffSchedules).omit({ id: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true });
export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true, createdAt: true }).extend({
  email: z.string().email("Please enter a valid email address (e.g., sample@sample.com)").optional().or(z.literal('')),
  phone: z.string().regex(/^\d{10}$/, "Phone number must be exactly 10 digits").optional().or(z.literal('')),
});
export const insertBookingSchema = createInsertSchema(bookings).omit({ id: true, createdAt: true });
export const insertBookingItemSchema = createInsertSchema(bookingItems).omit({ id: true });
export const insertInvoiceSchema = createInsertSchema(invoices).omit({ id: true, createdAt: true });
export const insertInvoiceItemSchema = createInsertSchema(invoiceItems).omit({ id: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true });
export const insertStaffTimeEntrySchema = createInsertSchema(staffTimeEntries).omit({ id: true });
export const insertVendorSchema = createInsertSchema(vendors).omit({ id: true, createdAt: true });
export const insertBillSchema = createInsertSchema(bills).omit({ id: true, createdAt: true });
export const insertBillItemSchema = createInsertSchema(billItems).omit({ id: true });
export const insertExpenseSchema = createInsertSchema(expenses).omit({ id: true, createdAt: true });
export const insertInventoryTransactionSchema = createInsertSchema(inventoryTransactions).omit({ id: true });
export const insertLoyaltyCardSchema = createInsertSchema(loyaltyCards).omit({ id: true, createdAt: true });
export const insertLoyaltyCardUsageSchema = createInsertSchema(loyaltyCardUsage).omit({ id: true });
export const insertProductSaleSchema = createInsertSchema(productSales).omit({ id: true, createdAt: true });

// Insert Types (for creating new records)
export type InsertSpa = z.infer<typeof insertSpaSchema>;
export type InsertSpaSettings = z.infer<typeof insertSpaSettingsSchema>;
export type InsertServiceCategory = z.infer<typeof insertServiceCategorySchema>;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type InsertStaff = z.infer<typeof insertStaffSchema>;
export type InsertStaffSchedule = z.infer<typeof insertStaffScheduleSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type InsertBookingItem = z.infer<typeof insertBookingItemSchema>;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type InsertInvoiceItem = z.infer<typeof insertInvoiceItemSchema>;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type InsertStaffTimeEntry = z.infer<typeof insertStaffTimeEntrySchema>;
export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type InsertBill = z.infer<typeof insertBillSchema>;
export type InsertBillItem = z.infer<typeof insertBillItemSchema>;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type InsertInventoryTransaction = z.infer<typeof insertInventoryTransactionSchema>;
export type InsertLoyaltyCard = z.infer<typeof insertLoyaltyCardSchema>;
export type InsertLoyaltyCardUsage = z.infer<typeof insertLoyaltyCardUsageSchema>;
export type InsertProductSale = z.infer<typeof insertProductSaleSchema>;

// Select Types (for reading records)
export type Spa = typeof spas.$inferSelect;
export type SpaSettings = typeof spaSettings.$inferSelect;
export type ServiceCategory = typeof serviceCategories.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Staff = typeof staff.$inferSelect;
export type StaffSchedule = typeof staffSchedules.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type BookingItem = typeof bookingItems.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type StaffTimeEntry = typeof staffTimeEntries.$inferSelect;
export type Vendor = typeof vendors.$inferSelect;
export type Bill = typeof bills.$inferSelect;
export type BillItem = typeof billItems.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
export type InventoryTransaction = typeof inventoryTransactions.$inferSelect;
export type LoyaltyCard = typeof loyaltyCards.$inferSelect;
export type LoyaltyCardUsage = typeof loyaltyCardUsage.$inferSelect;
export type ProductSale = typeof productSales.$inferSelect;

// Enhanced validation schemas with specific enums and categories

// Expense categories
export const expenseCategories = [
  "rent",
  "utilities", 
  "raw_materials",
  "salaries",
  "marketing",
  "other"
] as const;

export const expenseFormSchema = insertExpenseSchema.extend({
  category: z.enum(expenseCategories),
  amount: z.string().min(1, "Amount is required").transform(val => parseFloat(val)),
  description: z.string().min(1, "Description is required"),
  expenseDate: z.string().transform(str => new Date(str)),
}).omit({ vendorId: true, billId: true, vendor: true, receiptUrl: true });

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

// Vendor categories
export const vendorCategories = [
  "supplies_equipment",
  "professional_services",
  "utilities",
  "rent_lease",
  "marketing_advertising",
  "other"
] as const;

// Payment terms
export const paymentTerms = [
  "net_7",
  "net_15",
  "net_30",
  "net_45",
  "net_60",
  "net_90",
  "due_on_receipt",
  "cod"
] as const;

export const vendorFormSchema = insertVendorSchema.extend({
  name: z.string().min(1, "Vendor name is required"),
  category: z.enum(vendorCategories),
  paymentTerms: z.enum(paymentTerms).optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export type VendorFormValues = z.infer<typeof vendorFormSchema>;

// Bill form schema
export const billFormSchema = insertBillSchema.extend({
  billNumber: z.string().min(1, "Bill number is required"),
  vendorId: z.number().min(1, "Vendor is required"),
  billDate: z.string().transform(str => new Date(str)),
  dueDate: z.string().transform(str => new Date(str)),
  subtotal: z.string().min(1, "Subtotal is required").transform(val => parseFloat(val)),
  taxAmount: z.string().optional().transform(val => val ? parseFloat(val) : 0),
  totalAmount: z.string().min(1, "Total amount is required").transform(val => parseFloat(val)),
  category: z.enum(expenseCategories).optional(),
  notes: z.string().optional(),
});

export type BillFormValues = z.infer<typeof billFormSchema>;

// Bill item form schema
export const billItemFormSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(1, "Quantity must be at least 1").default(1),
  unitPrice: z.number().min(0, "Unit price must be positive"),
  category: z.enum(expenseCategories).optional(),
});

// Notification channel types
export const notificationChannels = ["email", "sms", "whatsapp"] as const;
export const notificationProviders = ["sendgrid", "resend", "twilio", "whatsapp_business"] as const;

// Spa notification settings (per-spa notification configuration)
export const spaNotificationSettings = pgTable("spa_notification_settings", {
  id: serial("id").primaryKey(),
  spaId: integer("spa_id").references(() => spas.id).notNull().unique(),
  // Customer notification settings
  emailEnabled: boolean("email_enabled").default(false),
  smsEnabled: boolean("sms_enabled").default(false),
  whatsappEnabled: boolean("whatsapp_enabled").default(false),
  fallbackOrder: text("fallback_order").array().default(sql`ARRAY[]::text[]`), // e.g., ["email", "sms", "whatsapp"]
  sendConfirmation: boolean("send_confirmation").default(true),
  sendModification: boolean("send_modification").default(true),
  sendCancellation: boolean("send_cancellation").default(true),
  sendReminder: boolean("send_reminder").default(false),
  reminderHoursBefore: integer("reminder_hours_before").default(24),
  // Staff notification settings
  staffEmailEnabled: boolean("staff_email_enabled").default(false),
  staffSmsEnabled: boolean("staff_sms_enabled").default(false),
  staffWhatsappEnabled: boolean("staff_whatsapp_enabled").default(false),
  sendStaffConfirmation: boolean("send_staff_confirmation").default(true),
  sendStaffModification: boolean("send_staff_modification").default(true),
  sendStaffCancellation: boolean("send_staff_cancellation").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Spa notification credentials (encrypted storage for API keys)
export const spaNotificationCredentials = pgTable("spa_notification_credentials", {
  id: serial("id").primaryKey(),
  spaId: integer("spa_id").references(() => spas.id).notNull(),
  provider: text("provider").notNull(), // sendgrid, resend, twilio, whatsapp_business
  channel: text("channel").notNull(), // email, sms, whatsapp
  encryptedCredentials: text("encrypted_credentials").notNull(), // JSON encrypted with app key
  fromEmail: text("from_email"), // for email providers
  fromPhone: text("from_phone"), // for SMS/WhatsApp providers
  status: text("status").notNull().default("active"), // active, error, pending
  lastTestedAt: timestamp("last_tested_at"),
  lastError: text("last_error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Notification events log (track all notification sends)
export const notificationEvents = pgTable("notification_events", {
  id: serial("id").primaryKey(),
  spaId: integer("spa_id").references(() => spas.id).notNull(),
  bookingId: integer("booking_id").references(() => bookings.id),
  channel: text("channel").notNull(), // email, sms, whatsapp
  provider: text("provider").notNull(), // sendgrid, resend, twilio, etc.
  recipientEmail: text("recipient_email"),
  recipientPhone: text("recipient_phone"),
  notificationType: text("notification_type").notNull(), // confirmation, modification, cancellation, reminder
  status: text("status").notNull(), // sent, failed, queued
  errorMessage: text("error_message"),
  externalId: text("external_id"), // ID from email/SMS provider
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Notification usage tracking (for billing/analytics)
export const notificationUsage = pgTable("notification_usage", {
  id: serial("id").primaryKey(),
  spaId: integer("spa_id").references(() => spas.id).notNull(),
  channel: text("channel").notNull(), // email, sms, whatsapp
  date: text("date").notNull(), // YYYY-MM-DD
  successCount: integer("success_count").default(0),
  failureCount: integer("failure_count").default(0),
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 4 }).default("0.0000"), // in USD
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Audit logs - track all important changes for compliance and security
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  userRole: text("user_role"), // Store user role at time of action for compliance
  spaId: integer("spa_id").references(() => spas.id), // Dedicated spa context for filtering
  action: text("action").notNull(), // CREATE, UPDATE, DELETE, LOGIN, LOGOUT
  entityType: text("entity_type").notNull(), // bookings, invoices, services, staff, etc.
  entityId: integer("entity_id").notNull(),
  changes: jsonb("changes"), // Store old/new values
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_audit_user").on(table.userId),
  index("idx_audit_spa").on(table.spaId),
  index("idx_audit_entity").on(table.entityType, table.entityId),
  index("idx_audit_action").on(table.action),
  index("idx_audit_created").on(table.createdAt),
]);

// Third-party OAuth integrations (Google Calendar, HubSpot, Mailchimp, etc.)
export const integrationTypes = [
  "google_calendar",
  "google_my_business", 
  "google_analytics",
  "google_meet",
  "hubspot_crm",
  "mailchimp",
  "wave_accounting",
  "buffer_social"
] as const;

export const spaIntegrations = pgTable("spa_integrations", {
  id: serial("id").primaryKey(),
  spaId: integer("spa_id").references(() => spas.id).notNull(),
  integrationType: text("integration_type").notNull(), // google_calendar, hubspot_crm, mailchimp, etc.
  status: text("status").notNull().default("active"), // active, error, disconnected
  encryptedTokens: text("encrypted_tokens").notNull(), // OAuth tokens (access + refresh) encrypted with IV/tag/salt
  tokenMetadata: jsonb("token_metadata").default(sql`'{}'::jsonb`), // { algorithm: "AES-256-GCM", version: 1, expiresAt: ISO8601 }
  settings: jsonb("settings").default(sql`'{}'::jsonb`), // Integration-specific settings
  lastSyncAt: timestamp("last_sync_at"),
  lastError: text("last_error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_spa_integrations_spa").on(table.spaId),
  index("idx_spa_integrations_type").on(table.integrationType),
  uniqueIndex("idx_spa_integrations_unique").on(table.spaId, table.integrationType),
]);

// Integration sync logs (track sync activities and errors)
export const integrationSyncLogs = pgTable("integration_sync_logs", {
  id: serial("id").primaryKey(),
  integrationId: integer("integration_id").references(() => spaIntegrations.id).notNull(),
  spaId: integer("spa_id").references(() => spas.id).notNull(),
  syncType: text("sync_type").notNull(), // full, incremental, webhook
  direction: text("direction").notNull(), // inbound, outbound, bidirectional
  recordsProcessed: integer("records_processed").default(0),
  recordsSuccess: integer("records_success").default(0),
  recordsFailed: integer("records_failed").default(0),
  status: text("status").notNull(), // success, partial, failed
  errorMessage: text("error_message"),
  details: jsonb("details"), // Detailed sync information
  startedAt: timestamp("started_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
}, (table) => [
  index("idx_sync_logs_integration").on(table.integrationId),
  index("idx_sync_logs_spa").on(table.spaId),
  index("idx_sync_logs_started").on(table.startedAt),
]);

// Webhook subscriptions (for real-time updates from integrations)
export const webhookSubscriptions = pgTable("webhook_subscriptions", {
  id: serial("id").primaryKey(),
  integrationId: integer("integration_id").references(() => spaIntegrations.id).notNull(),
  spaId: integer("spa_id").references(() => spas.id).notNull(),
  provider: text("provider").notNull(), // hubspot, mailchimp, google, etc.
  resource: text("resource").notNull(), // contacts, campaigns, events, etc.
  webhookId: text("webhook_id"), // External webhook ID from provider
  callbackUrl: text("callback_url").notNull(),
  callbackSecret: text("callback_secret"), // For webhook signature verification
  status: text("status").notNull().default("active"), // active, paused, failed
  lastTriggeredAt: timestamp("last_triggered_at"),
  lastError: text("last_error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_webhook_subscriptions_integration").on(table.integrationId),
  index("idx_webhook_subscriptions_spa").on(table.spaId),
  index("idx_webhook_subscriptions_provider").on(table.provider, table.resource),
]);

// Insert schemas
export const insertSpaNotificationSettingsSchema = createInsertSchema(spaNotificationSettings);
export const insertSpaNotificationCredentialsSchema = createInsertSchema(spaNotificationCredentials);
export const insertNotificationEventSchema = createInsertSchema(notificationEvents);
export const insertNotificationUsageSchema = createInsertSchema(notificationUsage);
export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({ id: true, createdAt: true });
export const insertSpaIntegrationSchema = createInsertSchema(spaIntegrations).omit({ id: true, createdAt: true, updatedAt: true });
export const insertIntegrationSyncLogSchema = createInsertSchema(integrationSyncLogs).omit({ id: true });
export const insertWebhookSubscriptionSchema = createInsertSchema(webhookSubscriptions).omit({ id: true, createdAt: true, updatedAt: true });

// Select types
export type SpaNotificationSettings = typeof spaNotificationSettings.$inferSelect;
export type SpaNotificationCredentials = typeof spaNotificationCredentials.$inferSelect;
export type NotificationEvent = typeof notificationEvents.$inferSelect;
export type NotificationUsage = typeof notificationUsage.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type SpaIntegration = typeof spaIntegrations.$inferSelect;
export type InsertSpaIntegration = z.infer<typeof insertSpaIntegrationSchema>;
export type IntegrationSyncLog = typeof integrationSyncLogs.$inferSelect;
export type InsertIntegrationSyncLog = z.infer<typeof insertIntegrationSyncLogSchema>;
export type WebhookSubscription = typeof webhookSubscriptions.$inferSelect;
export type InsertWebhookSubscription = z.infer<typeof insertWebhookSubscriptionSchema>;
