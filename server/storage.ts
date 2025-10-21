import {
  users,
  adminApplications,
  spas,
  spaSettings,
  serviceCategories,
  services,
  staff,
  staffSchedules,
  products,
  customers,
  bookings,
  bookingItems,
  invoices,
  invoiceItems,
  transactions,
  expenses,
  vendors,
  bills,
  billItems,
  inventoryTransactions,
  staffTimeEntries,
  loyaltyCards,
  loyaltyCardUsage,
  productSales,
  auditLogs,
  promoCodes,
  spaNotificationCredentials,
  spaNotificationSettings,
  notificationEvents,
  spaIntegrations,
  integrationSyncLogs,
  backupLogs,
  type User,
  type UpsertUser,
  type AdminApplication,
  type InsertAdminApplication,
  type Spa,
  type InsertSpa,
  type SpaSettings,
  type InsertSpaSettings,
  type ServiceCategory,
  type InsertServiceCategory,
  type Service,
  type InsertService,
  type Staff,
  type InsertStaff,
  type StaffSchedule,
  type InsertStaffSchedule,
  type Product,
  type InsertProduct,
  type Customer,
  type InsertCustomer,
  type PromoCode,
  type InsertPromoCode,
  type Booking,
  type InsertBooking,
  type BookingItem,
  type InsertBookingItem,
  type Vendor,
  type InsertVendor,
  type Expense,
  type InsertExpense,
  type Bill,
  type InsertBill,
  type BillItem,
  type InsertBillItem,
  type Transaction,
  type InsertTransaction,
  type LoyaltyCard,
  type InsertLoyaltyCard,
  type LoyaltyCardUsage,
  type InsertLoyaltyCardUsage,
  type ProductSale,
  type InsertProductSale,
  type AuditLog,
  type SpaIntegration,
  type InsertSpaIntegration,
  type IntegrationSyncLog,
  type InsertIntegrationSyncLog,
  type BackupLog,
  type InsertBackupLog,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Admin Application operations
  createAdminApplication(application: InsertAdminApplication): Promise<AdminApplication>;
  getAllAdminApplications(): Promise<AdminApplication[]>;
  getAdminApplicationById(id: number): Promise<AdminApplication | undefined>;
  getAdminApplicationByUserId(userId: string): Promise<AdminApplication | undefined>;
  getAdminApplicationsByStatus(status: string): Promise<AdminApplication[]>;
  updateAdminApplication(id: number, application: Partial<InsertAdminApplication>): Promise<AdminApplication | undefined>;
  
  // Email validation across all entities
  checkEmailExists(email: string, excludeId?: { type: 'user' | 'customer' | 'staff' | 'vendor'; id: string | number }): Promise<{ exists: boolean; entityType?: string; entityId?: string | number }>;

  // Spa operations
  getAllSpas(): Promise<Spa[]>;
  getSpaById(id: number): Promise<Spa | undefined>;
  getSpaByOwnerUserId(ownerUserId: string): Promise<Spa | undefined>;
  createSpa(spa: InsertSpa): Promise<Spa>;
  updateSpa(id: number, spa: Partial<InsertSpa>): Promise<Spa | undefined>;
  searchSpas(params: {
    search?: string;
    location?: string;
    date?: string;
    time?: string;
  }): Promise<Array<Spa & { services: Service[]; staff: Staff[] }>>;

  // Spa Settings operations
  getSpaSettings(): Promise<SpaSettings | undefined>;
  updateSpaSettings(settings: InsertSpaSettings): Promise<SpaSettings>;

  // Service Category operations
  getAllServiceCategories(): Promise<ServiceCategory[]>;
  createServiceCategory(category: InsertServiceCategory): Promise<ServiceCategory>;
  updateServiceCategory(id: number, category: Partial<InsertServiceCategory>): Promise<ServiceCategory | undefined>;
  deleteServiceCategory(id: number): Promise<boolean>;

  // Service operations
  getAllServices(): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  getServicesByCategory(categoryId: number): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: number): Promise<boolean>;

  // Staff operations
  getAllStaff(): Promise<Staff[]>;
  getStaffById(id: number): Promise<Staff | undefined>;
  getStaffByEmail(email: string): Promise<Staff | undefined>;
  createStaff(staff: InsertStaff): Promise<Staff>;
  updateStaff(id: number, staff: Partial<InsertStaff>): Promise<Staff | undefined>;
  deleteStaff(id: number): Promise<boolean>;

  // Staff Schedule operations
  getStaffSchedules(staffId: number): Promise<StaffSchedule[]>;
  createStaffSchedule(schedule: InsertStaffSchedule): Promise<StaffSchedule>;
  deleteStaffSchedule(id: number): Promise<boolean>;

  // Product operations
  getAllProducts(): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;

  // Customer operations
  getAllCustomers(): Promise<Customer[]>;
  getCustomerById(id: number): Promise<Customer | undefined>;
  getCustomerByEmail(email: string): Promise<Customer | undefined>;
  getCustomerByPhone(phone: string): Promise<Customer | undefined>;
  getCustomerByUserId(userId: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  deleteCustomer(id: number): Promise<boolean>;

  // Booking operations
  getAllBookings(): Promise<Booking[]>;
  getBookingById(id: number): Promise<Booking | undefined>;
  getBookingsByCustomerId(customerId: number): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: number, booking: Partial<InsertBooking>): Promise<Booking | undefined>;
  deleteBooking(id: number): Promise<boolean>;
  
  // Booking Item operations
  getAllBookingItems(): Promise<BookingItem[]>;
  getBookingItemsByBookingId(bookingId: number): Promise<BookingItem[]>;
  createBookingItem(item: InsertBookingItem): Promise<BookingItem>;
  deleteBookingItem(id: number): Promise<boolean>;

  // Vendor operations
  getAllVendors(): Promise<Vendor[]>;
  getVendorById(id: number): Promise<Vendor | undefined>;
  getVendorByEmail(email: string): Promise<Vendor | undefined>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  updateVendor(id: number, vendor: Partial<InsertVendor>): Promise<Vendor | undefined>;
  deleteVendor(id: number): Promise<boolean>;

  // Expense operations
  getAllExpenses(): Promise<Expense[]>;
  getExpenseById(id: number): Promise<Expense | undefined>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: number, expense: Partial<InsertExpense>): Promise<Expense | undefined>;
  deleteExpense(id: number): Promise<boolean>;

  // Bill operations
  getAllBills(): Promise<Bill[]>;
  getBillById(id: number): Promise<Bill | undefined>;
  createBill(bill: InsertBill): Promise<Bill>;
  updateBill(id: number, bill: Partial<InsertBill>): Promise<Bill | undefined>;
  deleteBill(id: number): Promise<boolean>;

  // Bill Item operations
  getBillItemsByBillId(billId: number): Promise<BillItem[]>;
  createBillItem(item: InsertBillItem): Promise<BillItem>;
  deleteBillItem(id: number): Promise<boolean>;

  // Transaction operations
  getAllTransactions(): Promise<Transaction[]>;
  getTransactionById(id: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;

  // Loyalty Card operations
  getAllLoyaltyCards(): Promise<LoyaltyCard[]>;
  getLoyaltyCardById(id: number): Promise<LoyaltyCard | undefined>;
  getLoyaltyCardsByCustomerId(customerId: number): Promise<LoyaltyCard[]>;
  createLoyaltyCard(card: InsertLoyaltyCard): Promise<LoyaltyCard>;
  updateLoyaltyCard(id: number, card: Partial<InsertLoyaltyCard>): Promise<LoyaltyCard | undefined>;
  deleteLoyaltyCard(id: number): Promise<boolean>;

  // Loyalty Card Usage operations
  getLoyaltyCardUsageByCardId(cardId: number): Promise<LoyaltyCardUsage[]>;
  createLoyaltyCardUsage(usage: InsertLoyaltyCardUsage): Promise<LoyaltyCardUsage>;

  // Product Sales operations
  getAllProductSales(): Promise<ProductSale[]>;
  getProductSaleById(id: number): Promise<ProductSale | undefined>;
  getProductSalesByCustomerId(customerId: number): Promise<ProductSale[]>;
  createProductSale(sale: InsertProductSale): Promise<ProductSale>;
  updateProductSale(id: number, sale: Partial<InsertProductSale>): Promise<ProductSale | undefined>;
  deleteProductSale(id: number): Promise<boolean>;

  // Audit Log operations
  getAuditLogs(filters?: {
    userId?: string;
    action?: string;
    entityType?: string;
    entityId?: number;
    spaId?: number;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<AuditLog[]>;

  // Revenue and VAT summary operations
  getRevenueSummary(filters?: {
    startDate?: Date;
    endDate?: Date;
    spaId?: number;
  }): Promise<{
    bookingsTotal: string;
    productSalesTotal: string;
    loyaltyCardsTotal: string;
    totalRevenue: string;
    vatCollected: string;
    totalDiscounts: string;
  }>;

  getVATPayableSummary(filters?: {
    startDate?: Date;
    endDate?: Date;
    spaId?: number;
  }): Promise<{
    vatCollected: string;
    vatPaid: string;
    vatPayable: string;
  }>;

  // Promo Code operations
  getAllPromoCodes(spaId?: number): Promise<PromoCode[]>;
  getPromoCodeById(id: number): Promise<PromoCode | undefined>;
  getPromoCodeByCode(code: string, spaId: number): Promise<PromoCode | undefined>;
  createPromoCode(promoCode: InsertPromoCode): Promise<PromoCode>;
  updatePromoCode(id: number, promoCode: Partial<InsertPromoCode>): Promise<PromoCode | undefined>;
  deletePromoCode(id: number): Promise<boolean>;
  validatePromoCode(code: string, spaId: number, serviceIds: number[]): Promise<{
    valid: boolean;
    promoCode?: PromoCode;
    error?: string;
  }>;
  incrementPromoCodeUsage(id: number): Promise<void>;

  // Notification Provider operations
  getNotificationProviders(spaId: number): Promise<any[]>;
  getNotificationProviderById(id: number): Promise<any | undefined>;
  getNotificationProviderByChannel(spaId: number, channel: string): Promise<any | undefined>;
  createNotificationProvider(data: any): Promise<any>;
  updateNotificationProvider(id: number, data: any): Promise<any | undefined>;
  deleteNotificationProvider(id: number): Promise<boolean>;
  updateNotificationEventStatus(externalId: string, updates: any): Promise<void>;

  // Notification Settings operations
  getNotificationSettings(spaId: number): Promise<any | undefined>;
  upsertNotificationSettings(spaId: number, settings: any): Promise<any>;

  // Third-party Integration operations
  getAllIntegrations(spaId: number): Promise<SpaIntegration[]>;
  getIntegrationById(id: number): Promise<SpaIntegration | undefined>;
  getIntegrationByType(spaId: number, type: string): Promise<SpaIntegration | undefined>;
  createIntegration(data: InsertSpaIntegration): Promise<SpaIntegration>;
  updateIntegration(id: number, data: Partial<InsertSpaIntegration>): Promise<SpaIntegration | undefined>;
  deleteIntegration(id: number): Promise<boolean>;
  
  // Integration Sync Log operations
  createSyncLog(log: InsertIntegrationSyncLog): Promise<IntegrationSyncLog>;
  getSyncLogs(integrationId: number, limit?: number): Promise<IntegrationSyncLog[]>;
  updateSyncLog(id: number, updates: Partial<InsertIntegrationSyncLog>): Promise<IntegrationSyncLog | undefined>;

  // Backup Log operations (FTA compliance)
  getBackupLogs(): Promise<BackupLog[]>;
  createBackupLog(log: InsertBackupLog): Promise<BackupLog>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const normalizedEmail = email.toLowerCase().trim();
    const [user] = await db.select().from(users)
      .where(sql`LOWER(${users.email}) = ${normalizedEmail}`);
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // Normalize email if provided
    if (userData.email) {
      userData.email = userData.email.toLowerCase().trim();
    }
    
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Admin Application operations
  async createAdminApplication(application: InsertAdminApplication): Promise<AdminApplication> {
    const [app] = await db
      .insert(adminApplications)
      .values(application)
      .returning();
    return app;
  }

  async getAllAdminApplications(): Promise<AdminApplication[]> {
    return await db.select().from(adminApplications).orderBy(desc(adminApplications.appliedAt));
  }

  async getAdminApplicationById(id: number): Promise<AdminApplication | undefined> {
    const [app] = await db
      .select()
      .from(adminApplications)
      .where(eq(adminApplications.id, id));
    return app;
  }

  async getAdminApplicationByUserId(userId: string): Promise<AdminApplication | undefined> {
    const [app] = await db
      .select()
      .from(adminApplications)
      .where(eq(adminApplications.userId, userId));
    return app;
  }

  async getAdminApplicationsByStatus(status: string): Promise<AdminApplication[]> {
    return await db
      .select()
      .from(adminApplications)
      .where(eq(adminApplications.status, status))
      .orderBy(desc(adminApplications.appliedAt));
  }

  async updateAdminApplication(id: number, application: Partial<InsertAdminApplication>): Promise<AdminApplication | undefined> {
    const [updated] = await db
      .update(adminApplications)
      .set(application)
      .where(eq(adminApplications.id, id))
      .returning();
    return updated;
  }

  // Email validation across all entities
  async checkEmailExists(
    email: string, 
    excludeId?: { type: 'user' | 'customer' | 'staff' | 'vendor'; id: string | number }
  ): Promise<{ exists: boolean; entityType?: string; entityId?: string | number }> {
    // Normalize email to lowercase for comparison
    const normalizedEmail = email.toLowerCase().trim();
    
    // Check users table (includes admin users since they're in the users table) - case insensitive
    const user = await db.select().from(users)
      .where(sql`LOWER(${users.email}) = ${normalizedEmail}`)
      .limit(1);
    if (user.length > 0 && !(excludeId?.type === 'user' && excludeId.id === user[0].id)) {
      return { exists: true, entityType: 'user', entityId: user[0].id };
    }
    
    // Check customers table - case insensitive
    const customer = await db.select().from(customers)
      .where(sql`LOWER(${customers.email}) = ${normalizedEmail}`)
      .limit(1);
    if (customer.length > 0 && !(excludeId?.type === 'customer' && excludeId.id === customer[0].id)) {
      return { exists: true, entityType: 'customer', entityId: customer[0].id };
    }
    
    // Check staff table - case insensitive
    const staffMember = await db.select().from(staff)
      .where(sql`LOWER(${staff.email}) = ${normalizedEmail}`)
      .limit(1);
    if (staffMember.length > 0 && !(excludeId?.type === 'staff' && excludeId.id === staffMember[0].id)) {
      return { exists: true, entityType: 'staff', entityId: staffMember[0].id };
    }
    
    // Check vendors table - case insensitive
    const vendor = await db.select().from(vendors)
      .where(sql`LOWER(${vendors.email}) = ${normalizedEmail}`)
      .limit(1);
    if (vendor.length > 0 && !(excludeId?.type === 'vendor' && excludeId.id === vendor[0].id)) {
      return { exists: true, entityType: 'vendor', entityId: vendor[0].id };
    }
    
    return { exists: false };
  }

  // Spa operations
  async getAllSpas(): Promise<Spa[]> {
    return db.select().from(spas)
      .where(and(eq(spas.active, true), eq(spas.setupComplete, true)))
      .orderBy(spas.featured, desc(spas.rating));
  }

  async getSpaById(id: number): Promise<Spa | undefined> {
    const [spa] = await db.select().from(spas).where(eq(spas.id, id));
    return spa;
  }

  async getSpaByOwnerUserId(ownerUserId: string): Promise<Spa | undefined> {
    const [spa] = await db.select().from(spas).where(eq(spas.ownerUserId, ownerUserId));
    return spa;
  }

  async createSpa(spaData: InsertSpa): Promise<Spa> {
    const [newSpa] = await db.insert(spas).values(spaData).returning();
    return newSpa;
  }

  async updateSpa(id: number, spaData: Partial<InsertSpa>): Promise<Spa | undefined> {
    const [updated] = await db
      .update(spas)
      .set({ ...spaData, updatedAt: new Date() })
      .where(eq(spas.id, id))
      .returning();
    return updated;
  }

  async searchSpas(params: {
    search?: string;
    location?: string;
    date?: string;
    time?: string;
  }): Promise<Array<Spa & { services: Service[]; staff: Staff[] }>> {
    // Get all active and setup-complete spas
    // In a production system, this would filter by search, location, and availability
    const allSpas = await db.select().from(spas)
      .where(and(eq(spas.active, true), eq(spas.setupComplete, true)));
    
    const results = await Promise.all(
      allSpas.map(async (spa) => {
        // Get services for this spa
        let spaServices = await db.select().from(services)
          .where(eq(services.spaId, spa.id));
        
        // Filter by search term if provided
        if (params.search) {
          const searchLower = params.search.toLowerCase();
          spaServices = spaServices.filter(s => 
            s.name.toLowerCase().includes(searchLower) ||
            (s.description && s.description.toLowerCase().includes(searchLower))
          );
        }
        
        // Get staff for this spa
        const spaStaff = await db.select().from(staff)
          .where(eq(staff.spaId, spa.id));
        
        return {
          ...spa,
          services: spaServices,
          staff: spaStaff,
        };
      })
    );
    
    // Filter out spas with no matching services if search is provided
    if (params.search) {
      return results.filter(r => r.services.length > 0);
    }
    
    return results;
  }

  // Spa Settings operations
  async getSpaSettings(): Promise<SpaSettings | undefined> {
    const [settings] = await db.select().from(spaSettings).limit(1);
    return settings;
  }

  async updateSpaSettings(settingsData: InsertSpaSettings): Promise<SpaSettings> {
    const existing = await this.getSpaSettings();
    if (existing) {
      const [settings] = await db
        .update(spaSettings)
        .set({ ...settingsData, updatedAt: new Date() })
        .where(eq(spaSettings.id, existing.id))
        .returning();
      return settings;
    } else {
      const [settings] = await db.insert(spaSettings).values(settingsData).returning();
      return settings;
    }
  }

  // Service Category operations
  async getAllServiceCategories(): Promise<ServiceCategory[]> {
    return db.select().from(serviceCategories).orderBy(serviceCategories.displayOrder);
  }

  async createServiceCategory(category: InsertServiceCategory): Promise<ServiceCategory> {
    // Validate required fields
    if (!category.name || typeof category.name !== "string") {
      throw new Error("Category name is required");
    }
    
    // Validate spaId exists if provided
    if (category.spaId) {
      const [spa] = await db.select().from(spas).where(eq(spas.id, category.spaId));
      if (!spa) {
        throw new Error("Spa does not exist");
      }
    }
    
    const [newCategory] = await db.insert(serviceCategories).values(category).returning();
    return newCategory;
  }

  async updateServiceCategory(id: number, category: Partial<InsertServiceCategory>): Promise<ServiceCategory | undefined> {
    const [updated] = await db
      .update(serviceCategories)
      .set(category)
      .where(eq(serviceCategories.id, id))
      .returning();
    return updated;
  }

  async deleteServiceCategory(id: number): Promise<boolean> {
    const result = await db.delete(serviceCategories).where(eq(serviceCategories.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Service operations
  async getAllServices(): Promise<Service[]> {
    return db.select().from(services).orderBy(services.categoryId, services.name);
  }

  async getService(id: number): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service;
  }

  async getServicesByCategory(categoryId: number): Promise<Service[]> {
    return db.select().from(services).where(eq(services.categoryId, categoryId));
  }

  async createService(service: InsertService): Promise<Service> {
    // Validate required fields
    if (!service.name || typeof service.name !== "string") {
      throw new Error("Service name is required");
    }
    if (!service.spaId) {
      throw new Error("Spa ID is required");
    }
    if (!service.duration || service.duration <= 0) {
      throw new Error("Valid duration is required");
    }
    if (!service.price) {
      throw new Error("Price is required");
    }
    
    // Validate spaId exists
    const [spa] = await db.select().from(spas).where(eq(spas.id, service.spaId));
    if (!spa) {
      throw new Error("Spa does not exist");
    }
    
    // Validate categoryId exists if provided
    if (service.categoryId) {
      const [category] = await db.select().from(serviceCategories).where(eq(serviceCategories.id, service.categoryId));
      if (!category) {
        throw new Error("Service category does not exist");
      }
    }
    
    const [newService] = await db.insert(services).values(service).returning();
    return newService;
  }

  async updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined> {
    const [updated] = await db
      .update(services)
      .set(service)
      .where(eq(services.id, id))
      .returning();
    return updated;
  }

  async deleteService(id: number): Promise<boolean> {
    const result = await db.delete(services).where(eq(services.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Staff operations
  async getAllStaff(): Promise<Staff[]> {
    return db.select().from(staff).orderBy(staff.name);
  }

  async getStaffById(id: number): Promise<Staff | undefined> {
    const [member] = await db.select().from(staff).where(eq(staff.id, id));
    return member;
  }

  async getStaffByEmail(email: string): Promise<Staff | undefined> {
    const normalizedEmail = email.toLowerCase().trim();
    const [member] = await db.select().from(staff)
      .where(sql`LOWER(${staff.email}) = ${normalizedEmail}`);
    return member;
  }

  async createStaff(staffData: InsertStaff): Promise<Staff> {
    // Validate required fields
    if (!staffData.name || typeof staffData.name !== "string") {
      throw new Error("Staff name is required");
    }
    if (!staffData.spaId) {
      throw new Error("Spa ID is required");
    }
    
    // Validate spaId exists
    const [spa] = await db.select().from(spas).where(eq(spas.id, staffData.spaId));
    if (!spa) {
      throw new Error("Spa does not exist");
    }
    
    // Normalize and check for duplicate email across all entities if provided
    if (staffData.email) {
      staffData.email = staffData.email.toLowerCase().trim();
      
      const emailCheck = await this.checkEmailExists(staffData.email);
      if (emailCheck.exists) {
        const entityTypeMap: Record<string, string> = {
          user: 'user account',
          customer: 'customer',
          staff: 'staff member',
          vendor: 'vendor'
        };
        const entityName = entityTypeMap[emailCheck.entityType || ''] || 'account';
        throw new Error(`This email is already registered as a ${entityName}. Please use a different email address.`);
      }
    }
    
    const [newStaff] = await db.insert(staff).values(staffData).returning();
    return newStaff;
  }

  async updateStaff(id: number, staffData: Partial<InsertStaff>): Promise<Staff | undefined> {
    // Normalize and check for duplicate email if provided
    if (staffData.email) {
      staffData.email = staffData.email.toLowerCase().trim();
      
      const emailCheck = await this.checkEmailExists(staffData.email, { type: 'staff', id });
      if (emailCheck.exists) {
        const entityTypeMap: Record<string, string> = {
          user: 'user account',
          customer: 'customer',
          staff: 'staff member',
          vendor: 'vendor'
        };
        const entityName = entityTypeMap[emailCheck.entityType || ''] || 'account';
        throw new Error(`This email is already registered as a ${entityName}. Please use a different email address.`);
      }
    }
    
    const [updated] = await db
      .update(staff)
      .set(staffData)
      .where(eq(staff.id, id))
      .returning();
    return updated;
  }

  async deleteStaff(id: number): Promise<boolean> {
    const result = await db.delete(staff).where(eq(staff.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Staff Schedule operations
  async getStaffSchedules(staffId: number): Promise<StaffSchedule[]> {
    return db.select().from(staffSchedules).where(eq(staffSchedules.staffId, staffId));
  }

  async createStaffSchedule(schedule: InsertStaffSchedule): Promise<StaffSchedule> {
    const [newSchedule] = await db.insert(staffSchedules).values(schedule).returning();
    return newSchedule;
  }

  async deleteStaffSchedule(id: number): Promise<boolean> {
    const result = await db.delete(staffSchedules).where(eq(staffSchedules.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Product operations
  async getAllProducts(): Promise<Product[]> {
    return db.select().from(products).orderBy(products.name);
  }

  async getProductById(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updated] = await db
      .update(products)
      .set(product)
      .where(eq(products.id, id))
      .returning();
    return updated;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Customer operations
  async getAllCustomers(): Promise<Customer[]> {
    return db.select().from(customers).orderBy(desc(customers.createdAt));
  }

  async getCustomerById(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }

  async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    const normalizedEmail = email.toLowerCase().trim();
    const [customer] = await db.select().from(customers)
      .where(sql`LOWER(${customers.email}) = ${normalizedEmail}`);
    return customer;
  }

  async getCustomerByPhone(phone: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.phone, phone));
    return customer;
  }

  async getCustomerByUserId(userId: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.userId, userId));
    return customer;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    // Normalize email if provided
    if (customer.email) {
      customer.email = customer.email.toLowerCase().trim();
      
      // Check for duplicate email
      const emailCheck = await this.checkEmailExists(customer.email);
      if (emailCheck.exists) {
        const entityTypeMap: Record<string, string> = {
          user: 'user account',
          customer: 'customer',
          staff: 'staff member',
          vendor: 'vendor'
        };
        const entityName = entityTypeMap[emailCheck.entityType || ''] || 'account';
        throw new Error(`This email is already registered as a ${entityName}. Please use a different email address.`);
      }
    }
    
    const [newCustomer] = await db.insert(customers).values(customer).returning();
    return newCustomer;
  }

  async updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined> {
    // Normalize and check for duplicate email if provided
    if (customer.email) {
      customer.email = customer.email.toLowerCase().trim();
      
      const emailCheck = await this.checkEmailExists(customer.email, { type: 'customer', id });
      if (emailCheck.exists) {
        const entityTypeMap: Record<string, string> = {
          user: 'user account',
          customer: 'customer',
          staff: 'staff member',
          vendor: 'vendor'
        };
        const entityName = entityTypeMap[emailCheck.entityType || ''] || 'account';
        throw new Error(`This email is already registered as a ${entityName}. Please use a different email address.`);
      }
    }
    
    const [updated] = await db
      .update(customers)
      .set(customer)
      .where(eq(customers.id, id))
      .returning();
    return updated;
  }

  async deleteCustomer(id: number): Promise<boolean> {
    const result = await db.delete(customers).where(eq(customers.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Booking operations
  async getAllBookings(): Promise<Booking[]> {
    return db.select().from(bookings).orderBy(desc(bookings.bookingDate));
  }

  async getBookingById(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }

  async getBookingsByCustomerId(customerId: number): Promise<Booking[]> {
    return db.select().from(bookings)
      .where(eq(bookings.customerId, customerId))
      .orderBy(desc(bookings.bookingDate));
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db.insert(bookings).values(booking).returning();
    return newBooking;
  }

  async updateBooking(id: number, booking: Partial<InsertBooking>): Promise<Booking | undefined> {
    const [updated] = await db
      .update(bookings)
      .set(booking)
      .where(eq(bookings.id, id))
      .returning();
    return updated;
  }

  async deleteBooking(id: number): Promise<boolean> {
    const result = await db.delete(bookings).where(eq(bookings.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Booking Item operations
  async getAllBookingItems(): Promise<BookingItem[]> {
    return db.select().from(bookingItems);
  }

  async getBookingItemsByBookingId(bookingId: number): Promise<BookingItem[]> {
    return db.select().from(bookingItems).where(eq(bookingItems.bookingId, bookingId));
  }

  async createBookingItem(item: InsertBookingItem): Promise<BookingItem> {
    const [newItem] = await db.insert(bookingItems).values(item).returning();
    return newItem;
  }

  async deleteBookingItem(id: number): Promise<boolean> {
    const result = await db.delete(bookingItems).where(eq(bookingItems.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Vendor operations
  async getAllVendors(): Promise<Vendor[]> {
    return db.select().from(vendors).orderBy(vendors.name);
  }

  async getVendorById(id: number): Promise<Vendor | undefined> {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.id, id));
    return vendor;
  }

  async getVendorByEmail(email: string): Promise<Vendor | undefined> {
    const normalizedEmail = email.toLowerCase().trim();
    const [vendor] = await db.select().from(vendors)
      .where(sql`LOWER(${vendors.email}) = ${normalizedEmail}`);
    return vendor;
  }

  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    // Normalize and check for duplicate email across all entities if provided
    if (vendor.email) {
      vendor.email = vendor.email.toLowerCase().trim();
      
      const emailCheck = await this.checkEmailExists(vendor.email);
      if (emailCheck.exists) {
        const entityTypeMap: Record<string, string> = {
          user: 'user account',
          customer: 'customer',
          staff: 'staff member',
          vendor: 'vendor'
        };
        const entityName = entityTypeMap[emailCheck.entityType || ''] || 'account';
        throw new Error(`This email is already registered as a ${entityName}. Please use a different email address.`);
      }
    }
    
    const [newVendor] = await db.insert(vendors).values(vendor).returning();
    return newVendor;
  }

  async updateVendor(id: number, vendor: Partial<InsertVendor>): Promise<Vendor | undefined> {
    // Normalize and check for duplicate email if provided
    if (vendor.email) {
      vendor.email = vendor.email.toLowerCase().trim();
      
      const emailCheck = await this.checkEmailExists(vendor.email, { type: 'vendor', id });
      if (emailCheck.exists) {
        const entityTypeMap: Record<string, string> = {
          user: 'user account',
          customer: 'customer',
          staff: 'staff member',
          vendor: 'vendor'
        };
        const entityName = entityTypeMap[emailCheck.entityType || ''] || 'account';
        throw new Error(`This email is already registered as a ${entityName}. Please use a different email address.`);
      }
    }
    
    const [updated] = await db
      .update(vendors)
      .set(vendor)
      .where(eq(vendors.id, id))
      .returning();
    return updated;
  }

  async deleteVendor(id: number): Promise<boolean> {
    const result = await db.delete(vendors).where(eq(vendors.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Expense operations
  async getAllExpenses(): Promise<Expense[]> {
    return db.select().from(expenses).orderBy(desc(expenses.expenseDate));
  }

  async getExpenseById(id: number): Promise<Expense | undefined> {
    const [expense] = await db.select().from(expenses).where(eq(expenses.id, id));
    return expense;
  }

  async createExpense(expense: InsertExpense): Promise<Expense> {
    const [newExpense] = await db.insert(expenses).values(expense).returning();
    return newExpense;
  }

  async updateExpense(id: number, expense: Partial<InsertExpense>): Promise<Expense | undefined> {
    const [updated] = await db
      .update(expenses)
      .set(expense)
      .where(eq(expenses.id, id))
      .returning();
    return updated;
  }

  async deleteExpense(id: number): Promise<boolean> {
    const result = await db.delete(expenses).where(eq(expenses.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Bill operations
  async getAllBills(): Promise<Bill[]> {
    return db.select().from(bills).orderBy(desc(bills.billDate));
  }

  async getBillById(id: number): Promise<Bill | undefined> {
    const [bill] = await db.select().from(bills).where(eq(bills.id, id));
    return bill;
  }

  async createBill(bill: InsertBill): Promise<Bill> {
    const [newBill] = await db.insert(bills).values(bill).returning();
    return newBill;
  }

  async updateBill(id: number, bill: Partial<InsertBill>): Promise<Bill | undefined> {
    const [updated] = await db
      .update(bills)
      .set(bill)
      .where(eq(bills.id, id))
      .returning();
    return updated;
  }

  async deleteBill(id: number): Promise<boolean> {
    const result = await db.delete(bills).where(eq(bills.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Bill Item operations
  async getBillItemsByBillId(billId: number): Promise<BillItem[]> {
    return db.select().from(billItems).where(eq(billItems.billId, billId));
  }

  async createBillItem(item: InsertBillItem): Promise<BillItem> {
    const [newItem] = await db.insert(billItems).values(item).returning();
    return newItem;
  }

  async deleteBillItem(id: number): Promise<boolean> {
    const result = await db.delete(billItems).where(eq(billItems.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Transaction operations
  async getAllTransactions(): Promise<Transaction[]> {
    return db.select().from(transactions).orderBy(desc(transactions.transactionDate));
  }

  async getTransactionById(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction;
  }

  async createTransaction(transactionData: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values(transactionData).returning();
    return newTransaction;
  }

  // Loyalty Card operations
  async getAllLoyaltyCards(): Promise<LoyaltyCard[]> {
    return db.select().from(loyaltyCards).orderBy(desc(loyaltyCards.purchaseDate));
  }

  async getLoyaltyCardById(id: number): Promise<LoyaltyCard | undefined> {
    const [card] = await db.select().from(loyaltyCards).where(eq(loyaltyCards.id, id));
    return card;
  }

  async getLoyaltyCardsByCustomerId(customerId: number): Promise<LoyaltyCard[]> {
    return db.select().from(loyaltyCards)
      .where(eq(loyaltyCards.customerId, customerId))
      .orderBy(desc(loyaltyCards.purchaseDate));
  }

  async createLoyaltyCard(cardData: InsertLoyaltyCard): Promise<LoyaltyCard> {
    const { calculateVAT } = await import('./vatUtils');
    
    // Calculate VAT (UAE 5% inclusive)
    const taxCode = (cardData.taxCode || 'SR') as any;
    const vatCalc = calculateVAT(parseFloat(cardData.purchasePrice || '0'), taxCode);
    
    // Create loyalty card with VAT breakdown
    const [newCard] = await db.insert(loyaltyCards).values({
      ...cardData,
      netAmount: vatCalc.netAmount.toString(),
      vatAmount: vatCalc.vatAmount.toString(),
      taxCode: taxCode,
    }).returning();
    return newCard;
  }

  async updateLoyaltyCard(id: number, cardData: Partial<InsertLoyaltyCard>): Promise<LoyaltyCard | undefined> {
    const [updated] = await db
      .update(loyaltyCards)
      .set(cardData)
      .where(eq(loyaltyCards.id, id))
      .returning();
    return updated;
  }

  async deleteLoyaltyCard(id: number): Promise<boolean> {
    const result = await db.delete(loyaltyCards).where(eq(loyaltyCards.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Loyalty Card Usage operations
  async getLoyaltyCardUsageByCardId(cardId: number): Promise<LoyaltyCardUsage[]> {
    return db.select().from(loyaltyCardUsage)
      .where(eq(loyaltyCardUsage.loyaltyCardId, cardId))
      .orderBy(desc(loyaltyCardUsage.usedAt));
  }

  async createLoyaltyCardUsage(usageData: InsertLoyaltyCardUsage): Promise<LoyaltyCardUsage> {
    const [newUsage] = await db.insert(loyaltyCardUsage).values(usageData).returning();
    return newUsage;
  }

  // Product Sales operations
  async getAllProductSales(): Promise<ProductSale[]> {
    return db.select().from(productSales).orderBy(desc(productSales.saleDate));
  }

  async getProductSaleById(id: number): Promise<ProductSale | undefined> {
    const [sale] = await db.select().from(productSales).where(eq(productSales.id, id));
    return sale;
  }

  async getProductSalesByCustomerId(customerId: number): Promise<ProductSale[]> {
    return db.select().from(productSales)
      .where(eq(productSales.customerId, customerId))
      .orderBy(desc(productSales.saleDate));
  }

  async createProductSale(saleData: InsertProductSale): Promise<ProductSale> {
    const { calculateVAT } = await import('./vatUtils');
    
    // Use a transaction to ensure inventory is updated atomically with the sale
    return await db.transaction(async (tx) => {
      // 1. Check if product exists and has sufficient stock
      const [product] = await tx.select().from(products).where(eq(products.id, saleData.productId));
      if (!product) {
        throw new Error(`Product with ID ${saleData.productId} not found`);
      }
      
      const currentStock = product.stockQuantity || 0;
      const quantityToSell = saleData.quantity || 1;
      
      if (currentStock < quantityToSell) {
        throw new Error(`Insufficient stock. Available: ${currentStock}, Requested: ${quantityToSell}`);
      }
      
      // 2. Calculate VAT (UAE 5% inclusive)
      const taxCode = (saleData.taxCode || 'SR') as any;
      const vatCalc = calculateVAT(parseFloat(saleData.totalPrice || '0'), taxCode);
      
      // 3. Create the product sale record with VAT breakdown
      const [newSale] = await tx.insert(productSales).values({
        ...saleData,
        netAmount: vatCalc.netAmount.toString(),
        vatAmount: vatCalc.vatAmount.toString(),
        taxCode: taxCode,
      }).returning();
      
      // 4. Update product stock quantity (reduce by quantity sold)
      await tx
        .update(products)
        .set({ stockQuantity: currentStock - quantityToSell })
        .where(eq(products.id, saleData.productId));
      
      // 5. Create inventory transaction record (negative quantity for sale)
      await tx.insert(inventoryTransactions).values({
        productId: saleData.productId,
        transactionType: "sale",
        quantity: -quantityToSell, // Negative because it's leaving inventory
        unitCost: saleData.unitPrice,
        productSaleId: newSale.id, // Link to the sale
        reference: `Sale #${newSale.id}`,
        notes: `Product sale to customer #${saleData.customerId}`,
        transactionDate: saleData.saleDate || new Date(),
      });
      
      return newSale;
    });
  }

  async updateProductSale(id: number, saleData: Partial<InsertProductSale>): Promise<ProductSale | undefined> {
    const [updated] = await db
      .update(productSales)
      .set(saleData)
      .where(eq(productSales.id, id))
      .returning();
    return updated;
  }

  async deleteProductSale(id: number): Promise<boolean> {
    const result = await db.delete(productSales).where(eq(productSales.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Audit Log operations
  async getAuditLogs(filters?: {
    userId?: string;
    action?: string;
    entityType?: string;
    entityId?: number;
    spaId?: number;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<AuditLog[]> {
    let query = db.select().from(auditLogs);
    
    const conditions = [];
    
    if (filters?.userId) {
      conditions.push(eq(auditLogs.userId, filters.userId));
    }
    
    if (filters?.action) {
      conditions.push(eq(auditLogs.action, filters.action));
    }
    
    if (filters?.entityType) {
      conditions.push(eq(auditLogs.entityType, filters.entityType));
    }
    
    if (filters?.entityId) {
      conditions.push(eq(auditLogs.entityId, filters.entityId));
    }
    
    if (filters?.spaId) {
      conditions.push(eq(auditLogs.spaId, filters.spaId));
    }
    
    if (filters?.startDate) {
      conditions.push(gte(auditLogs.createdAt, filters.startDate));
    }
    
    if (filters?.endDate) {
      conditions.push(lte(auditLogs.createdAt, filters.endDate));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    const logs = await query.orderBy(desc(auditLogs.createdAt)).limit(filters?.limit || 100);
    return logs;
  }

  // Revenue and VAT summary operations
  async getRevenueSummary(filters?: {
    startDate?: Date;
    endDate?: Date;
    spaId?: number;
  }): Promise<{
    bookingsTotal: string;
    productSalesTotal: string;
    loyaltyCardsTotal: string;
    totalRevenue: string;
    vatCollected: string;
    totalDiscounts: string;
  }> {
    const conditions = [];
    
    if (filters?.spaId) {
      conditions.push(eq(bookings.spaId, filters.spaId));
    }
    if (filters?.startDate) {
      conditions.push(gte(bookings.bookingDate, filters.startDate));
    }
    if (filters?.endDate) {
      conditions.push(lte(bookings.bookingDate, filters.endDate));
    }

    // Get bookings total (net amount after discounts)
    let bookingsQuery = db.select({ 
      total: bookings.totalAmount, 
      discount: bookings.discountAmount 
    }).from(bookings);
    if (conditions.length > 0) {
      bookingsQuery = bookingsQuery.where(and(...conditions)) as any;
    }
    const bookingsData = await bookingsQuery;
    const bookingsGross = bookingsData.reduce((sum, b) => sum + (parseFloat(b.total || '0')), 0);
    const bookingsDiscounts = bookingsData.reduce((sum, b) => sum + (parseFloat(b.discount || '0')), 0);
    const bookingsTotal = bookingsGross - bookingsDiscounts;

    // Get product sales total (net amount after discounts)
    const salesConditions = [];
    if (filters?.startDate) {
      salesConditions.push(gte(productSales.saleDate, filters.startDate));
    }
    if (filters?.endDate) {
      salesConditions.push(lte(productSales.saleDate, filters.endDate));
    }

    let salesQuery = db.select({ 
      total: productSales.totalPrice, 
      discount: productSales.discountAmount 
    }).from(productSales);
    if (salesConditions.length > 0) {
      salesQuery = salesQuery.where(and(...salesConditions)) as any;
    }
    const salesData = await salesQuery;
    const salesGross = salesData.reduce((sum, s) => sum + (parseFloat(s.total || '0')), 0);
    const salesDiscounts = salesData.reduce((sum, s) => sum + (parseFloat(s.discount || '0')), 0);
    const productSalesTotal = salesGross - salesDiscounts;

    // Get loyalty cards total (net amount after discounts) - these are service bundles
    const cardsConditions = [];
    if (filters?.startDate) {
      cardsConditions.push(gte(loyaltyCards.purchaseDate, filters.startDate));
    }
    if (filters?.endDate) {
      cardsConditions.push(lte(loyaltyCards.purchaseDate, filters.endDate));
    }

    let cardsQuery = db.select({ 
      price: loyaltyCards.purchasePrice, 
      discount: loyaltyCards.discountAmount 
    }).from(loyaltyCards);
    if (cardsConditions.length > 0) {
      cardsQuery = cardsQuery.where(and(...cardsConditions)) as any;
    }
    const cardsData = await cardsQuery;
    const cardsGross = cardsData.reduce((sum, c) => sum + (parseFloat(c.price || '0')), 0);
    const cardsDiscounts = cardsData.reduce((sum, c) => sum + (parseFloat(c.discount || '0')), 0);
    const loyaltyCardsTotal = cardsGross - cardsDiscounts;

    // Calculate totals
    const totalDiscounts = bookingsDiscounts + salesDiscounts + cardsDiscounts;
    const totalRevenue = bookingsTotal + productSalesTotal + loyaltyCardsTotal;
    const vatCollected = (totalRevenue * 5) / 105; // Tax-inclusive VAT calculation on net amount

    return {
      bookingsTotal: bookingsTotal.toFixed(2),
      productSalesTotal: productSalesTotal.toFixed(2),
      loyaltyCardsTotal: loyaltyCardsTotal.toFixed(2),
      totalRevenue: totalRevenue.toFixed(2),
      vatCollected: vatCollected.toFixed(2),
      totalDiscounts: totalDiscounts.toFixed(2),
    };
  }

  async getVATPayableSummary(filters?: {
    startDate?: Date;
    endDate?: Date;
    spaId?: number;
  }): Promise<{
    vatCollected: string;
    vatPaid: string;
    vatPayable: string;
  }> {
    // Get VAT collected from revenue
    const revenueSummary = await this.getRevenueSummary(filters);
    const vatCollected = parseFloat(revenueSummary.vatCollected);

    // Get VAT paid from bills
    const billConditions = [];
    if (filters?.startDate) {
      billConditions.push(gte(bills.billDate, filters.startDate));
    }
    if (filters?.endDate) {
      billConditions.push(lte(bills.billDate, filters.endDate));
    }

    let billsQuery = db.select({ taxAmount: bills.taxAmount }).from(bills);
    if (billConditions.length > 0) {
      billsQuery = billsQuery.where(and(...billConditions)) as any;
    }
    const billsData = await billsQuery;
    const vatPaid = billsData.reduce((sum, b) => sum + (parseFloat(b.taxAmount || '0')), 0);

    const vatPayable = vatCollected - vatPaid;

    return {
      vatCollected: vatCollected.toFixed(2),
      vatPaid: vatPaid.toFixed(2),
      vatPayable: vatPayable.toFixed(2),
    };
  }

  // Promo Code operations
  async getAllPromoCodes(spaId?: number): Promise<PromoCode[]> {
    if (spaId) {
      return await db.select().from(promoCodes).where(eq(promoCodes.spaId, spaId));
    }
    return await db.select().from(promoCodes);
  }

  async getPromoCodeById(id: number): Promise<PromoCode | undefined> {
    const [promoCode] = await db.select().from(promoCodes).where(eq(promoCodes.id, id));
    return promoCode;
  }

  async getPromoCodeByCode(code: string, spaId: number): Promise<PromoCode | undefined> {
    const [promoCode] = await db
      .select()
      .from(promoCodes)
      .where(and(eq(promoCodes.code, code), eq(promoCodes.spaId, spaId)));
    return promoCode;
  }

  async createPromoCode(promoCodeData: InsertPromoCode): Promise<PromoCode> {
    const [promoCode] = await db.insert(promoCodes).values(promoCodeData).returning();
    return promoCode;
  }

  async updatePromoCode(id: number, promoCodeData: Partial<InsertPromoCode>): Promise<PromoCode | undefined> {
    const [promoCode] = await db
      .update(promoCodes)
      .set(promoCodeData)
      .where(eq(promoCodes.id, id))
      .returning();
    return promoCode;
  }

  async deletePromoCode(id: number): Promise<boolean> {
    const result = await db.delete(promoCodes).where(eq(promoCodes.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async validatePromoCode(code: string, spaId: number, serviceIds: number[]): Promise<{
    valid: boolean;
    promoCode?: PromoCode;
    error?: string;
  }> {
    const promoCode = await this.getPromoCodeByCode(code, spaId);

    if (!promoCode) {
      return { valid: false, error: "Invalid promo code" };
    }

    if (!promoCode.isActive) {
      return { valid: false, error: "This promo code is no longer active" };
    }

    const now = new Date();
    if (now < new Date(promoCode.validFrom)) {
      return { valid: false, error: "This promo code is not yet valid" };
    }

    if (now > new Date(promoCode.validUntil)) {
      return { valid: false, error: "This promo code has expired" };
    }

    if (promoCode.usageLimit && promoCode.timesUsed >= promoCode.usageLimit) {
      return { valid: false, error: "This promo code has reached its usage limit" };
    }

    // Check if promo code is applicable to selected services
    if (promoCode.applicableServices) {
      const applicableServiceIds = promoCode.applicableServices as number[];
      const hasApplicableService = serviceIds.some(id => applicableServiceIds.includes(id));
      
      if (!hasApplicableService) {
        return { valid: false, error: "This promo code is not valid for the selected services" };
      }
    }

    return { valid: true, promoCode };
  }

  async incrementPromoCodeUsage(id: number): Promise<void> {
    await db
      .update(promoCodes)
      .set({ timesUsed: sql`times_used + 1` })
      .where(eq(promoCodes.id, id));
  }

  // Notification Provider operations
  async getNotificationProviders(spaId: number): Promise<any[]> {
    return await db
      .select()
      .from(spaNotificationCredentials)
      .where(eq(spaNotificationCredentials.spaId, spaId));
  }

  async getNotificationProviderById(id: number): Promise<any | undefined> {
    const [provider] = await db
      .select()
      .from(spaNotificationCredentials)
      .where(eq(spaNotificationCredentials.id, id));
    return provider;
  }

  async getNotificationProviderByChannel(spaId: number, channel: string): Promise<any | undefined> {
    const [provider] = await db
      .select()
      .from(spaNotificationCredentials)
      .where(
        and(
          eq(spaNotificationCredentials.spaId, spaId),
          eq(spaNotificationCredentials.channel, channel)
        )
      );
    return provider;
  }

  async createNotificationProvider(data: any): Promise<any> {
    const [provider] = await db
      .insert(spaNotificationCredentials)
      .values(data)
      .returning();
    return provider;
  }

  async updateNotificationProvider(id: number, data: any): Promise<any | undefined> {
    const [provider] = await db
      .update(spaNotificationCredentials)
      .set(data)
      .where(eq(spaNotificationCredentials.id, id))
      .returning();
    return provider;
  }

  async deleteNotificationProvider(id: number): Promise<boolean> {
    const result = await db
      .delete(spaNotificationCredentials)
      .where(eq(spaNotificationCredentials.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async updateNotificationEventStatus(externalId: string, updates: any): Promise<void> {
    await db
      .update(notificationEvents)
      .set(updates)
      .where(eq(notificationEvents.externalId, externalId));
  }

  // Notification Settings operations
  async getNotificationSettings(spaId: number): Promise<any | undefined> {
    const [settings] = await db
      .select()
      .from(spaNotificationSettings)
      .where(eq(spaNotificationSettings.spaId, spaId));
    return settings;
  }

  async upsertNotificationSettings(spaId: number, settings: any): Promise<any> {
    const existing = await this.getNotificationSettings(spaId);
    
    if (existing) {
      const [updated] = await db
        .update(spaNotificationSettings)
        .set({ ...settings, spaId })
        .where(eq(spaNotificationSettings.spaId, spaId))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(spaNotificationSettings)
        .values({ ...settings, spaId })
        .returning();
      return created;
    }
  }

  // Third-party Integration operations
  async getAllIntegrations(spaId: number): Promise<SpaIntegration[]> {
    return await db
      .select()
      .from(spaIntegrations)
      .where(eq(spaIntegrations.spaId, spaId))
      .orderBy(desc(spaIntegrations.createdAt));
  }

  async getIntegrationById(id: number): Promise<SpaIntegration | undefined> {
    const [integration] = await db
      .select()
      .from(spaIntegrations)
      .where(eq(spaIntegrations.id, id));
    return integration;
  }

  async getIntegrationByType(spaId: number, type: string): Promise<SpaIntegration | undefined> {
    const [integration] = await db
      .select()
      .from(spaIntegrations)
      .where(
        and(
          eq(spaIntegrations.spaId, spaId),
          eq(spaIntegrations.integrationType, type)
        )
      );
    return integration;
  }

  async createIntegration(data: InsertSpaIntegration): Promise<SpaIntegration> {
    const [integration] = await db
      .insert(spaIntegrations)
      .values(data)
      .returning();
    return integration;
  }

  async updateIntegration(id: number, data: Partial<InsertSpaIntegration>): Promise<SpaIntegration | undefined> {
    const [integration] = await db
      .update(spaIntegrations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(spaIntegrations.id, id))
      .returning();
    return integration;
  }

  async deleteIntegration(id: number): Promise<boolean> {
    const result = await db
      .delete(spaIntegrations)
      .where(eq(spaIntegrations.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Integration Sync Log operations
  async createSyncLog(log: InsertIntegrationSyncLog): Promise<IntegrationSyncLog> {
    const [syncLog] = await db
      .insert(integrationSyncLogs)
      .values(log)
      .returning();
    return syncLog;
  }

  async getSyncLogs(integrationId: number, limit: number = 50): Promise<IntegrationSyncLog[]> {
    return await db
      .select()
      .from(integrationSyncLogs)
      .where(eq(integrationSyncLogs.integrationId, integrationId))
      .orderBy(desc(integrationSyncLogs.startedAt))
      .limit(limit);
  }

  async updateSyncLog(id: number, updates: Partial<InsertIntegrationSyncLog>): Promise<IntegrationSyncLog | undefined> {
    const [syncLog] = await db
      .update(integrationSyncLogs)
      .set(updates)
      .where(eq(integrationSyncLogs.id, id))
      .returning();
    return syncLog;
  }

  // Backup Log operations (FTA compliance)
  async getBackupLogs(): Promise<BackupLog[]> {
    return await db
      .select()
      .from(backupLogs)
      .orderBy(desc(backupLogs.backupTime))
      .limit(100); // Return last 100 backups
  }

  async createBackupLog(log: InsertBackupLog): Promise<BackupLog> {
    const [backupLog] = await db
      .insert(backupLogs)
      .values(log)
      .returning();
    return backupLog;
  }
}

export const storage = new DatabaseStorage();
