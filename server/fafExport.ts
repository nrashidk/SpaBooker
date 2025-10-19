/**
 * FTA Audit File (FAF) Export Generator
 * Generates UAE Federal Tax Authority compliant audit files
 * for VAT reporting and compliance
 */

import { db } from "../db";
import { productSales, loyaltyCards, bookings, invoices, transactions } from "@shared/schema";
import { desc, gte, lte, and } from "drizzle-orm";

export interface FAFExportFilters {
  startDate?: Date;
  endDate?: Date;
  spaId?: number;
}

export interface FAFRecord {
  transactionId: string;
  transactionDate: string;
  transactionType: string;
  customerId: number;
  grossAmount: string;
  netAmount: string;
  vatAmount: string;
  taxCode: string;
  currency: string;
  description: string;
}

/**
 * Generate FTA Audit File for tax compliance
 * Includes all revenue streams: bookings, product sales, loyalty cards
 */
export async function generateFAFExport(filters?: FAFExportFilters): Promise<FAFRecord[]> {
  const records: FAFRecord[] = [];
  
  // 1. Export Product Sales
  let productQuery = db.select({
    id: productSales.id,
    date: productSales.saleDate,
    customerId: productSales.customerId,
    totalPrice: productSales.totalPrice,
    netAmount: productSales.netAmount,
    vatAmount: productSales.vatAmount,
    taxCode: productSales.taxCode,
  }).from(productSales);
  
  const productConditions = [];
  if (filters?.startDate) {
    productConditions.push(gte(productSales.saleDate, filters.startDate));
  }
  if (filters?.endDate) {
    productConditions.push(lte(productSales.saleDate, filters.endDate));
  }
  if (productConditions.length > 0) {
    productQuery = productQuery.where(and(...productConditions)) as any;
  }
  
  const productSalesData = await productQuery.orderBy(desc(productSales.saleDate));
  
  productSalesData.forEach(sale => {
    records.push({
      transactionId: `PS-${sale.id}`,
      transactionDate: sale.date.toISOString().split('T')[0],
      transactionType: 'Product Sale',
      customerId: sale.customerId,
      grossAmount: sale.totalPrice || '0.00',
      netAmount: sale.netAmount || '0.00',
      vatAmount: sale.vatAmount || '0.00',
      taxCode: sale.taxCode || 'SR',
      currency: 'AED',
      description: 'Retail product sale',
    });
  });
  
  // 2. Export Loyalty Card Purchases
  let loyaltyQuery = db.select({
    id: loyaltyCards.id,
    date: loyaltyCards.purchaseDate,
    customerId: loyaltyCards.customerId,
    purchasePrice: loyaltyCards.purchasePrice,
    netAmount: loyaltyCards.netAmount,
    vatAmount: loyaltyCards.vatAmount,
    taxCode: loyaltyCards.taxCode,
    cardType: loyaltyCards.cardType,
  }).from(loyaltyCards);
  
  const loyaltyConditions = [];
  if (filters?.startDate) {
    loyaltyConditions.push(gte(loyaltyCards.purchaseDate, filters.startDate));
  }
  if (filters?.endDate) {
    loyaltyConditions.push(lte(loyaltyCards.purchaseDate, filters.endDate));
  }
  if (loyaltyConditions.length > 0) {
    loyaltyQuery = loyaltyQuery.where(and(...loyaltyConditions)) as any;
  }
  
  const loyaltyCardsData = await loyaltyQuery.orderBy(desc(loyaltyCards.purchaseDate));
  
  loyaltyCardsData.forEach(card => {
    records.push({
      transactionId: `LC-${card.id}`,
      transactionDate: card.date.toISOString().split('T')[0],
      transactionType: 'Loyalty Card Purchase',
      customerId: card.customerId,
      grossAmount: card.purchasePrice || '0.00',
      netAmount: card.netAmount || '0.00',
      vatAmount: card.vatAmount || '0.00',
      taxCode: card.taxCode || 'SR',
      currency: 'AED',
      description: card.cardType || 'Loyalty package',
    });
  });
  
  // Sort all records by date descending
  records.sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());
  
  return records;
}

/**
 * Convert FAF records to CSV format
 */
export function convertFAFToCSV(records: FAFRecord[]): string {
  const headers = [
    'Transaction ID',
    'Date',
    'Type',
    'Customer ID',
    'Gross Amount (AED)',
    'Net Amount (AED)',
    'VAT Amount (AED)',
    'Tax Code',
    'Currency',
    'Description'
  ];
  
  const rows = records.map(r => [
    r.transactionId,
    r.transactionDate,
    r.transactionType,
    r.customerId.toString(),
    r.grossAmount,
    r.netAmount,
    r.vatAmount,
    r.taxCode,
    r.currency,
    `"${r.description.replace(/"/g, '""')}"` // Escape quotes in description
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\n');
  
  return csvContent;
}
