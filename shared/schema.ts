import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, decimal, jsonb, serial, index } from "drizzle-orm/pg-core";
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
  role: text("role").notNull().default("customer"), // customer, staff, admin
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users);
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

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

// Staff members
export const staff = pgTable("staff", {
  id: serial("id").primaryKey(),
  spaId: integer("spa_id").references(() => spas.id).notNull(),
  userId: varchar("user_id").references(() => users.id),
  name: text("name").notNull(),
  specialty: text("specialty"),
  email: text("email"),
  phone: text("phone"),
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
});

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

// Bookings
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  spaId: integer("spa_id").references(() => spas.id).notNull(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  staffId: integer("staff_id").references(() => staff.id),
  bookingDate: timestamp("booking_date").notNull(),
  status: text("status").notNull().default("confirmed"), // confirmed, completed, cancelled, no-show, modified
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }),
  notes: text("notes"),
  notificationSent: boolean("notification_sent").default(false),
  cancelledAt: timestamp("cancelled_at"),
  cancellationReason: text("cancellation_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

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
});

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

// Zod schemas for validation
export const insertSpaSchema = createInsertSchema(spas).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSpaSettingsSchema = createInsertSchema(spaSettings).omit({ id: true, updatedAt: true });
export const insertServiceCategorySchema = createInsertSchema(serviceCategories).omit({ id: true });
export const insertServiceSchema = createInsertSchema(services).omit({ id: true, createdAt: true });
export const insertStaffSchema = createInsertSchema(staff).omit({ id: true, createdAt: true });
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
  emailEnabled: boolean("email_enabled").default(false),
  smsEnabled: boolean("sms_enabled").default(false),
  whatsappEnabled: boolean("whatsapp_enabled").default(false),
  fallbackOrder: text("fallback_order").array().default(sql`ARRAY[]::text[]`), // e.g., ["email", "sms", "whatsapp"]
  sendConfirmation: boolean("send_confirmation").default(true),
  sendModification: boolean("send_modification").default(true),
  sendCancellation: boolean("send_cancellation").default(true),
  sendReminder: boolean("send_reminder").default(false),
  reminderHoursBefore: integer("reminder_hours_before").default(24),
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

// Insert schemas
export const insertSpaNotificationSettingsSchema = createInsertSchema(spaNotificationSettings);
export const insertSpaNotificationCredentialsSchema = createInsertSchema(spaNotificationCredentials);
export const insertNotificationEventSchema = createInsertSchema(notificationEvents);
export const insertNotificationUsageSchema = createInsertSchema(notificationUsage);

// Select types
export type SpaNotificationSettings = typeof spaNotificationSettings.$inferSelect;
export type SpaNotificationCredentials = typeof spaNotificationCredentials.$inferSelect;
export type NotificationEvent = typeof notificationEvents.$inferSelect;
export type NotificationUsage = typeof notificationUsage.$inferSelect;
