import { createObjectCsvStringifier } from 'csv-writer';
import type { Customer } from '@shared/schema';

export interface CustomerCSVRow {
  name: string;
  email?: string;
  phone?: string;
  gender?: string;
  birthday?: string;
  address_street?: string;
  address_city?: string;
  address_area?: string;
  address_emirate?: string;
  notes?: string;
}

// Simple CSV parser (handles basic CSV format)
export function parseCustomersCSV(csvContent: string): CustomerCSVRow[] {
  const lines = csvContent.trim().split('\n');
  if (lines.length === 0) {
    return [];
  }

  // Parse header
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  
  // Parse rows
  const rows: CustomerCSVRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    const row: any = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    rows.push(row as CustomerCSVRow);
  }
  
  return rows;
}

export function customersToCSV(customers: Customer[]): string {
  const csvStringifier = createObjectCsvStringifier({
    header: [
      { id: 'name', title: 'name' },
      { id: 'email', title: 'email' },
      { id: 'phone', title: 'phone' },
      { id: 'gender', title: 'gender' },
      { id: 'birthday', title: 'birthday' },
      { id: 'address_street', title: 'address_street' },
      { id: 'address_city', title: 'address_city' },
      { id: 'address_area', title: 'address_area' },
      { id: 'address_emirate', title: 'address_emirate' },
      { id: 'loyalty_points', title: 'loyalty_points' },
      { id: 'wallet_balance', title: 'wallet_balance' },
      { id: 'total_spent', title: 'total_spent' },
      { id: 'blocked', title: 'blocked' },
      { id: 'blocked_reason', title: 'blocked_reason' },
      { id: 'notes', title: 'notes' },
      { id: 'created_at', title: 'created_at' },
    ],
  });

  const rows = customers.map(customer => ({
    name: customer.name,
    email: customer.email || '',
    phone: customer.phone || '',
    gender: customer.gender || '',
    birthday: customer.birthday ? new Date(customer.birthday).toISOString().split('T')[0] : '',
    address_street: (customer.address as any)?.street || '',
    address_city: (customer.address as any)?.city || '',
    address_area: (customer.address as any)?.area || '',
    address_emirate: (customer.address as any)?.emirate || '',
    loyalty_points: customer.loyaltyPoints || 0,
    wallet_balance: customer.walletBalance || '0.00',
    total_spent: customer.totalSpent || '0.00',
    blocked: customer.blocked ? 'Yes' : 'No',
    blocked_reason: customer.blockedReason || '',
    notes: customer.notes || '',
    created_at: new Date(customer.createdAt).toISOString(),
  }));

  return csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(rows);
}
