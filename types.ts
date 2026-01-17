
export type PaymentTerm = 'Immediate' | 'Net 15 Days' | 'Net 30 Days' | 'Custom';
export type ItemType = 'Consumable' | 'Asset';
export type PaymentMode = 'Cash' | 'UPI' | 'Bank' | 'Cheque';
export type PaymentStatus = 'Paid' | 'Partial' | 'Unpaid' | 'Credit';
export type IssuedToType = 'Student' | 'Teacher' | 'Other';

export interface Vendor {
  id: string;
  code: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  gstNo?: string;
  paymentTerms: PaymentTerm;
  bankName?: string;
  ifscCode?: string;
  accountNumber?: string;
  upiId?: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Unit {
  id: string;
  name: string;
}

export interface Item {
  id: string;
  code: string;
  name: string;
  categoryId: string;
  unitId: string;
  type: ItemType;
  defaultLocation: string;
  minStockLevel: number;
  currentStock: number;
  salePrice: number; // Added default sale price
}

export interface BillItem {
  itemId: string;
  quantity: number;
  rate: number;
  total: number;
}

export interface PurchaseBill {
  id: string;
  invoiceNo: string;
  date: string;
  vendorId: string;
  paymentTerm: PaymentTerm;
  paymentMode: PaymentMode;
  paymentStatus: PaymentStatus;
  items: BillItem[];
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  remarks: string;
  bankName?: string;
  ifscCode?: string;
  upiId?: string;
}

export interface SalesBill {
  id: string;
  invoiceNo: string;
  date: string;
  issuedTo: string;
  issuedToType: IssuedToType;
  otherRecipientName?: string; // For 'Other' category
  items: BillItem[];
  totalAmount: number;
  discount: number; // Added discount
  finalAmount: number; // After discount
  paidAmount: number; // Added payment tracking
  balanceAmount: number; // Added balance field
  paymentStatus: PaymentStatus;
  paymentMode: PaymentMode;
  bankName?: string;
  upiId?: string;
  remarks: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: 'CREATE' | 'EDIT' | 'DELETE';
  module: string;
  details: string;
}
