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
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte } from "drizzle-orm";

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

  // Spa operations
  getAllSpas(): Promise<Spa[]>;
  getSpaById(id: number): Promise<Spa | undefined>;
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
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<AuditLog[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
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

  async createStaff(staffData: InsertStaff): Promise<Staff> {
    const [newStaff] = await db.insert(staff).values(staffData).returning();
    return newStaff;
  }

  async updateStaff(id: number, staffData: Partial<InsertStaff>): Promise<Staff | undefined> {
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
    const [customer] = await db.select().from(customers).where(eq(customers.email, email));
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
    const [newCustomer] = await db.insert(customers).values(customer).returning();
    return newCustomer;
  }

  async updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined> {
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

  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    const [newVendor] = await db.insert(vendors).values(vendor).returning();
    return newVendor;
  }

  async updateVendor(id: number, vendor: Partial<InsertVendor>): Promise<Vendor | undefined> {
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
    const [newCard] = await db.insert(loyaltyCards).values(cardData).returning();
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
    const [newSale] = await db.insert(productSales).values(saleData).returning();
    return newSale;
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
}

export const storage = new DatabaseStorage();
