export type ExtensionStatus = 'pending' | 'approved' | 'rejected'

export interface ExtensionRequest {
  id:              string
  brand:           string
  shopifyUrl:      string
  invoiceNumber:   string
  invoiceAmount:   number
  originalDueDate: string
  requestedDate:   string
  reason:          string
  status:          ExtensionStatus
  requestedAt:     string
  resolvedAt?:     string
  resolvedNote?:   string
}

export const extensionRequests: ExtensionRequest[] = [
  {
    id: 'ext-001', brand: 'NykaaFashion',     shopifyUrl: 'nykaafashion.myshopify.com',
    invoiceNumber: 'INV-2025-005', invoiceAmount: 97500,
    originalDueDate: '2025-02-06', requestedDate: '2025-02-20',
    reason: 'Our finance team is undergoing an internal audit this week. We will clear the payment by 20th Feb without fail.',
    status: 'pending', requestedAt: '2025-02-05',
  },
  {
    id: 'ext-002', brand: 'Blinkit Commerce', shopifyUrl: 'blinkit.myshopify.com',
    invoiceNumber: 'INV-2025-006', invoiceAmount: 145000,
    originalDueDate: '2025-02-16', requestedDate: '2025-02-28',
    reason: 'We are awaiting approval from our CFO for this payment. Expected sign-off by 25th Feb.',
    status: 'pending', requestedAt: '2025-02-14',
  },
  {
    id: 'ext-003', brand: 'The Good Glamm',   shopifyUrl: 'thegoodglamm.myshopify.com',
    invoiceNumber: 'INV-2025-014', invoiceAmount: 89000,
    originalDueDate: '2025-03-23', requestedDate: '2025-04-05',
    reason: 'Cash flow constraint due to delayed receivables from our distributor. We request a 13-day extension.',
    status: 'pending', requestedAt: '2025-03-20',
  },
  {
    id: 'ext-004', brand: 'Meesho India',      shopifyUrl: 'meesho.myshopify.com',
    invoiceNumber: 'INV-2025-010', invoiceAmount: 72000,
    originalDueDate: '2025-03-07', requestedDate: '2025-03-15',
    reason: 'Public holiday closure at our bank branch. Will process within 2 days of reopening.',
    status: 'approved', requestedAt: '2025-03-05', resolvedAt: '2025-03-06',
    resolvedNote: 'Approved given the bank holiday reason. Please ensure payment by 15th Mar.',
  },
  {
    id: 'ext-005', brand: 'Wow Momo Foods',    shopifyUrl: 'wowmomo.myshopify.com',
    invoiceNumber: 'INV-2025-008', invoiceAmount: 41000,
    originalDueDate: '2025-02-25', requestedDate: '2025-03-15',
    reason: 'Requesting extension due to fundraising round in progress.',
    status: 'rejected', requestedAt: '2025-02-22', resolvedAt: '2025-02-23',
    resolvedNote: 'Extension rejected. Fundraising is not a valid reason for delay. Account suspended pending payment.',
  },
]

export interface BankEntry {
  id:          string
  date:        string
  description: string
  reference:   string
  credit:      number   // money received
  debit:       number   // money sent (refunds etc)
  balance:     number
}

// Mock bank statement — some entries match existing invoices, some are unmatched gaps
export const mockBankStatement: BankEntry[] = [
  { id: 'b1',  date: '2025-01-18', description: 'NEFT CR - ACME CORP LTD',           reference: 'TXN-BS-10021', credit: 125000, debit: 0,      balance: 125000 },
  { id: 'b2',  date: '2025-01-20', description: 'UPI CR - UNKNOWN SENDER',            reference: 'UPI-XX-0012', credit:  18000, debit: 0,      balance: 143000 },
  { id: 'b3',  date: '2025-01-24', description: 'UPI CR - ZOKO TECHNOLOGIES',         reference: 'UPI-ZK-4451', credit:  84500, debit: 0,      balance: 227500 },
  { id: 'b4',  date: '2025-02-01', description: 'NEFT CR - MEESHO INDIA PVT LTD',    reference: 'TXN-ME-8823', credit: 230000, debit: 0,      balance: 457500 },
  { id: 'b5',  date: '2025-02-10', description: 'NEFT CR - VENDOR REFUND',            reference: 'REF-VN-0099', credit:  12000, debit: 0,      balance: 469500 },
  { id: 'b6',  date: '2025-02-19', description: 'CC CR - MAMAEARTH LTD',              reference: 'CC-MA-3390',  credit:  53000, debit: 0,      balance: 522500 },
  { id: 'b7',  date: '2025-02-25', description: 'NEFT DR - AWS SERVICES',             reference: 'AWS-FEB-25',  credit:  0,     debit: 45000,  balance: 477500 },
  { id: 'b8',  date: '2025-02-28', description: 'NEFT CR - LENSKART SOLUTIONS',       reference: 'TXN-LK-5567', credit: 186000, debit: 0,      balance: 663500 },
  { id: 'b9',  date: '2025-03-05', description: 'UPI CR - UNKNOWN - NO REMARKS',      reference: 'UPI-UK-7731', credit:  41000, debit: 0,      balance: 704500 },
  { id: 'b10', date: '2025-03-10', description: 'UPI CR - VEDIX WELLNESS',            reference: 'UPI-VX-9921', credit:  38500, debit: 0,      balance: 743000 },
  { id: 'b11', date: '2025-03-15', description: 'NEFT CR - PARTIAL PAYMENT DELHIVERY',reference: 'TXN-DL-3312', credit:  36000, debit: 0,      balance: 779000 },
  { id: 'b12', date: '2025-03-19', description: 'CHQ CR - ACME CORP',                 reference: 'CHQ-AC-0041', credit: 125000, debit: 0,      balance: 904000 },
]

export type InvoiceStatus  = 'paid' | 'pending' | 'overdue'
export type PaymentMethod  = 'bank_transfer' | 'credit_card' | 'upi' | 'cheque'
export type UserRole       = 'finance' | 'brand'
export type PaymentModel   = 'prepaid' | 'postpaid' | 'shopify'
export type AccountStatus  = 'active' | 'suspended' | 'at_risk'

export interface BrandPlan {
  brand:           string
  shopifyUrl:      string
  model:           PaymentModel
  walletBalance:   number
  creditCycleDays: number
  platformFee:     number
  billingStart:    string
  billingEnd:      string
  nextBillingDate: string
  accountStatus:   AccountStatus
  features:        string[]
}

export type AgingBucket = 'current' | '1-30' | '31-60' | '61-90' | '90+'

export interface AgingRow {
  invoiceNumber: string
  client:        string
  shopifyUrl:    string
  amount:        number
  dueDate:       string
  daysOverdue:   number
  bucket:        AgingBucket
  status:        InvoiceStatus
}

const TODAY = new Date('2026-03-29')

function daysBetween(dateStr: string): number {
  const due  = new Date(dateStr)
  const diff = Math.floor((TODAY.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))
  return diff
}

function getAgingBucket(days: number): AgingBucket {
  if (days <= 0)  return 'current'
  if (days <= 30) return '1-30'
  if (days <= 60) return '31-60'
  if (days <= 90) return '61-90'
  return '90+'
}

export function getAgingReport(brandFilter?: string, shopifyFilter?: string): AgingRow[] {
  const unpaid = invoices.filter(i => i.status !== 'paid')

  return unpaid
    .filter(i => {
      if (brandFilter && !i.client.toLowerCase().includes(brandFilter.toLowerCase())) return false
      if (shopifyFilter) {
        const plan = brandPlans.find(p => p.brand === i.client)
        if (!plan || !plan.shopifyUrl.toLowerCase().includes(shopifyFilter.toLowerCase())) return false
      }
      return true
    })
    .map(i => {
      const days   = daysBetween(i.dueDate)
      const plan   = brandPlans.find(p => p.brand === i.client)
      return {
        invoiceNumber: i.number,
        client:        i.client,
        shopifyUrl:    plan?.shopifyUrl ?? '—',
        amount:        i.amount,
        dueDate:       i.dueDate,
        daysOverdue:   Math.max(0, days),
        bucket:        getAgingBucket(days),
        status:        i.status,
      }
    })
    .sort((a, b) => b.daysOverdue - a.daysOverdue)
}

export interface Invoice {
  id: string
  number: string
  client: string
  amount: number
  currency: string
  status: InvoiceStatus
  issuedDate: string
  dueDate: string
  description: string
}

export interface Payment {
  id: string
  invoiceNumber: string
  client: string
  amount: number
  currency: string
  method: PaymentMethod
  receivedDate: string
  reference: string
  notes: string
}

export interface BrandUser {
  email: string
  password: string
  name: string        // display name of the POC
  brand: string       // must match client name in invoices/payments exactly
}

// Finance team — sees everything
export const FINANCE_USER = {
  email:    'finance@bitespeed.co',
  password: 'Bitespeed@2025',
}

// Brand POCs — see only their brand's data
export const brandUsers: BrandUser[] = [
  { email: 'poc@mamaearth.in',       password: 'Mama@2025',    name: 'Ananya Sharma',   brand: 'Mamaearth Ltd' },
  { email: 'poc@acmecorp.com',        password: 'Acme@2025',    name: 'Rohan Mehta',     brand: 'Acme Corp' },
  { email: 'poc@meesho.com',          password: 'Meesho@2025',  name: 'Priya Nair',      brand: 'Meesho India' },
  { email: 'poc@lenskart.com',        password: 'Lens@2025',    name: 'Vikram Singh',    brand: 'Lenskart Solutions' },
  { email: 'poc@nykaa.com',           password: 'Nykaa@2025',   name: 'Shreya Gupta',    brand: 'NykaaFashion' },
  { email: 'poc@blinkit.com',         password: 'Blink@2025',   name: 'Arjun Kapoor',    brand: 'Blinkit Commerce' },
  { email: 'poc@globalbees.com',      password: 'Global@2025',  name: 'Kavya Reddy',     brand: 'GlobalBees Brands' },
  { email: 'poc@thegoodglamm.com',    password: 'Glamm@2025',   name: 'Neha Joshi',      brand: 'The Good Glamm' },
  { email: 'poc@purplle.com',         password: 'Purp@2025',    name: 'Siddharth Rao',   brand: 'Purplle India' },
  { email: 'poc@delhivery.com',       password: 'Delh@2025',    name: 'Rahul Verma',     brand: 'Delhivery Ltd' },
  { email: 'poc@vedix.com',           password: 'Vedix@2025',   name: 'Pooja Agarwal',   brand: 'Vedix Wellness' },
  { email: 'poc@wowmomo.com',         password: 'Wow@2025',     name: 'Amit Das',        brand: 'Wow Momo Foods' },
  { email: 'poc@zokotech.com',        password: 'Zoko@2025',    name: 'Farhan Sheikh',   brand: 'Zoko Technologies' },
  { email: 'poc@shopeasy.com',        password: 'Shop@2025',    name: 'Divya Krishnan',  brand: 'ShopEasy Pvt Ltd' },
]

export const brandPlans: BrandPlan[] = [
  { brand: 'Mamaearth Ltd',      shopifyUrl: 'mamaearth.myshopify.com',      model: 'postpaid',  walletBalance: 0,       creditCycleDays: 30, platformFee: 5000,  billingStart: '2025-03-01', billingEnd: '2025-03-31', nextBillingDate: '2025-04-01', accountStatus: 'active',    features: ['WhatsApp', 'Voice Bot', 'Email'] },
  { brand: 'Acme Corp',          shopifyUrl: 'acmecorp.myshopify.com',        model: 'prepaid',   walletBalance: 42500,   creditCycleDays: 0,  platformFee: 0,     billingStart: '2025-03-01', billingEnd: '2025-03-31', nextBillingDate: '2025-04-01', accountStatus: 'active',    features: ['CRM Platform', 'Email', 'SMS'] },
  { brand: 'Meesho India',       shopifyUrl: 'meesho.myshopify.com',          model: 'postpaid',  walletBalance: 0,       creditCycleDays: 15, platformFee: 8000,  billingStart: '2025-03-01', billingEnd: '2025-03-31', nextBillingDate: '2025-04-01', accountStatus: 'active',    features: ['CRM Platform', 'WhatsApp', 'Email', 'SMS'] },
  { brand: 'Lenskart Solutions', shopifyUrl: 'lenskart.myshopify.com',        model: 'postpaid',  walletBalance: 0,       creditCycleDays: 30, platformFee: 12000, billingStart: '2025-03-01', billingEnd: '2025-03-31', nextBillingDate: '2025-04-01', accountStatus: 'active',    features: ['Enterprise CRM', 'WhatsApp', 'Voice', 'Email', 'SMS'] },
  { brand: 'NykaaFashion',       shopifyUrl: 'nykaafashion.myshopify.com',    model: 'postpaid',  walletBalance: 0,       creditCycleDays: 15, platformFee: 6000,  billingStart: '2025-01-01', billingEnd: '2025-01-31', nextBillingDate: '2025-02-01', accountStatus: 'at_risk',   features: ['Marketing Automation', 'WhatsApp', 'Email'] },
  { brand: 'Blinkit Commerce',   shopifyUrl: 'blinkit.myshopify.com',         model: 'prepaid',   walletBalance: 8200,    creditCycleDays: 0,  platformFee: 0,     billingStart: '2025-03-01', billingEnd: '2025-03-31', nextBillingDate: '2025-04-01', accountStatus: 'active',    features: ['SMS Broadcast', 'WhatsApp', 'Support'] },
  { brand: 'GlobalBees Brands',  shopifyUrl: 'globalbees.myshopify.com',      model: 'shopify',   walletBalance: 0,       creditCycleDays: 30, platformFee: 15000, billingStart: '2025-03-01', billingEnd: '2025-03-31', nextBillingDate: '2025-04-01', accountStatus: 'active',    features: ['Multi-brand CRM', 'WhatsApp', 'Email', 'Instagram', 'SMS'] },
  { brand: 'The Good Glamm',     shopifyUrl: 'thegoodglamm.myshopify.com',    model: 'postpaid',  walletBalance: 0,       creditCycleDays: 15, platformFee: 5000,  billingStart: '2025-03-01', billingEnd: '2025-03-31', nextBillingDate: '2025-04-01', accountStatus: 'at_risk',   features: ['Instagram Bot', 'WhatsApp'] },
  { brand: 'Purplle India',      shopifyUrl: 'purplle.myshopify.com',         model: 'prepaid',   walletBalance: 3100,    creditCycleDays: 0,  platformFee: 0,     billingStart: '2025-03-01', billingEnd: '2025-03-31', nextBillingDate: '2025-04-01', accountStatus: 'active',    features: ['Retention Campaigns', 'Email', 'SMS'] },
  { brand: 'Delhivery Ltd',      shopifyUrl: 'delhivery.myshopify.com',       model: 'postpaid',  walletBalance: 0,       creditCycleDays: 30, platformFee: 4000,  billingStart: '2025-03-01', billingEnd: '2025-03-31', nextBillingDate: '2025-04-01', accountStatus: 'at_risk',   features: ['Analytics Dashboard', 'Email'] },
  { brand: 'Vedix Wellness',     shopifyUrl: 'vedix.myshopify.com',           model: 'prepaid',   walletBalance: 18700,   creditCycleDays: 0,  platformFee: 0,     billingStart: '2025-03-01', billingEnd: '2025-03-31', nextBillingDate: '2025-04-01', accountStatus: 'active',    features: ['Email Automation', 'SMS'] },
  { brand: 'Wow Momo Foods',     shopifyUrl: 'wowmomo.myshopify.com',         model: 'postpaid',  walletBalance: 0,       creditCycleDays: 15, platformFee: 3000,  billingStart: '2025-02-01', billingEnd: '2025-02-28', nextBillingDate: '2025-03-01', accountStatus: 'suspended', features: ['WhatsApp Chatbot'] },
  { brand: 'Zoko Technologies',  shopifyUrl: 'zokotech.myshopify.com',        model: 'shopify',   walletBalance: 0,       creditCycleDays: 30, platformFee: 6000,  billingStart: '2025-03-01', billingEnd: '2025-03-31', nextBillingDate: '2025-04-01', accountStatus: 'active',    features: ['WhatsApp Integration', 'CRM'] },
  { brand: 'ShopEasy Pvt Ltd',   shopifyUrl: 'shopeasy.myshopify.com',        model: 'prepaid',   walletBalance: 1200,    creditCycleDays: 0,  platformFee: 0,     billingStart: '2025-03-01', billingEnd: '2025-03-31', nextBillingDate: '2025-04-01', accountStatus: 'active',    features: ['Email Campaigns', 'SMS'] },
]

export function getBrandPlan(brand: string): BrandPlan | null {
  return brandPlans.find(p => p.brand === brand) ?? null
}

export const invoices: Invoice[] = [
  { id: '1',  number: 'INV-2025-001', client: 'Acme Corp',           amount: 125000, currency: 'INR', status: 'paid',    issuedDate: '2025-01-05', dueDate: '2025-01-20', description: 'CRM Platform — Jan subscription' },
  { id: '2',  number: 'INV-2025-002', client: 'Zoko Technologies',   amount: 84500,  currency: 'INR', status: 'paid',    issuedDate: '2025-01-10', dueDate: '2025-01-25', description: 'WhatsApp Integration setup fee' },
  { id: '3',  number: 'INV-2025-003', client: 'ShopEasy Pvt Ltd',    amount: 62000,  currency: 'INR', status: 'pending', issuedDate: '2025-01-15', dueDate: '2025-01-30', description: 'Email campaign — Q1 2025' },
  { id: '4',  number: 'INV-2025-004', client: 'Meesho India',        amount: 230000, currency: 'INR', status: 'paid',    issuedDate: '2025-01-18', dueDate: '2025-02-02', description: 'Annual CRM license' },
  { id: '5',  number: 'INV-2025-005', client: 'NykaaFashion',        amount: 97500,  currency: 'INR', status: 'overdue', issuedDate: '2025-01-22', dueDate: '2025-02-06', description: 'Marketing automation — Jan' },
  { id: '6',  number: 'INV-2025-006', client: 'Blinkit Commerce',    amount: 145000, currency: 'INR', status: 'pending', issuedDate: '2025-02-01', dueDate: '2025-02-16', description: 'SMS broadcast + support' },
  { id: '7',  number: 'INV-2025-007', client: 'Mamaearth Ltd',       amount: 53000,  currency: 'INR', status: 'paid',    issuedDate: '2025-02-05', dueDate: '2025-02-20', description: 'Voice bot integration' },
  { id: '8',  number: 'INV-2025-008', client: 'Wow Momo Foods',      amount: 41000,  currency: 'INR', status: 'overdue', issuedDate: '2025-02-10', dueDate: '2025-02-25', description: 'WhatsApp chatbot — Feb' },
  { id: '9',  number: 'INV-2025-009', client: 'Lenskart Solutions',  amount: 186000, currency: 'INR', status: 'paid',    issuedDate: '2025-02-14', dueDate: '2025-03-01', description: 'Enterprise CRM — Q1 2025' },
  { id: '10', number: 'INV-2025-010', client: 'Delhivery Ltd',       amount: 72000,  currency: 'INR', status: 'overdue', issuedDate: '2025-02-20', dueDate: '2025-03-07', description: 'Analytics dashboard setup' },
  { id: '11', number: 'INV-2025-011', client: 'Vedix Wellness',      amount: 38500,  currency: 'INR', status: 'paid',    issuedDate: '2025-02-25', dueDate: '2025-03-12', description: 'Email + SMS automation' },
  { id: '12', number: 'INV-2025-012', client: 'GlobalBees Brands',   amount: 312000, currency: 'INR', status: 'pending', issuedDate: '2025-03-01', dueDate: '2025-03-16', description: 'Multi-brand CRM license' },
  { id: '13', number: 'INV-2025-013', client: 'Acme Corp',           amount: 125000, currency: 'INR', status: 'paid',    issuedDate: '2025-03-05', dueDate: '2025-03-20', description: 'CRM Platform — Mar subscription' },
  { id: '14', number: 'INV-2025-014', client: 'The Good Glamm',      amount: 89000,  currency: 'INR', status: 'overdue', issuedDate: '2025-03-08', dueDate: '2025-03-23', description: 'Instagram + WhatsApp bot' },
  { id: '15', number: 'INV-2025-015', client: 'Purplle India',       amount: 54000,  currency: 'INR', status: 'pending', issuedDate: '2025-03-12', dueDate: '2025-03-27', description: 'Retention campaign — Mar' },
]

export const payments: Payment[] = [
  { id: '1',  invoiceNumber: 'INV-2025-001', client: 'Acme Corp',          amount: 125000, currency: 'INR', method: 'bank_transfer', receivedDate: '2025-01-18', reference: 'TXN-BS-10021', notes: 'Cleared on time' },
  { id: '2',  invoiceNumber: 'INV-2025-002', client: 'Zoko Technologies',  amount: 84500,  currency: 'INR', method: 'upi',           receivedDate: '2025-01-24', reference: 'UPI-ZK-4451',  notes: '' },
  { id: '3',  invoiceNumber: 'INV-2025-004', client: 'Meesho India',       amount: 230000, currency: 'INR', method: 'bank_transfer', receivedDate: '2025-02-01', reference: 'TXN-ME-8823',  notes: 'Annual payment' },
  { id: '4',  invoiceNumber: 'INV-2025-007', client: 'Mamaearth Ltd',      amount: 53000,  currency: 'INR', method: 'credit_card',   receivedDate: '2025-02-19', reference: 'CC-MA-3390',   notes: '' },
  { id: '5',  invoiceNumber: 'INV-2025-009', client: 'Lenskart Solutions', amount: 186000, currency: 'INR', method: 'bank_transfer', receivedDate: '2025-02-28', reference: 'TXN-LK-5567',  notes: 'Enterprise deal' },
  { id: '6',  invoiceNumber: 'INV-2025-011', client: 'Vedix Wellness',     amount: 38500,  currency: 'INR', method: 'upi',           receivedDate: '2025-03-10', reference: 'UPI-VX-9921',  notes: '' },
  { id: '7',  invoiceNumber: 'INV-2025-013', client: 'Acme Corp',          amount: 125000, currency: 'INR', method: 'cheque',        receivedDate: '2025-03-19', reference: 'CHQ-AC-0041',  notes: 'Cheque cleared' },
]

export function getMetrics(brand?: string) {
  const inv = brand ? invoices.filter(i => i.client === brand) : invoices
  const pay = brand ? payments.filter(p => p.client === brand) : payments

  const received    = pay.reduce((sum, p) => sum + p.amount, 0)
  const outstanding = inv.filter(i => i.status !== 'paid').reduce((sum, i) => sum + i.amount, 0)
  const overdue     = inv.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0)
  const pending     = inv.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0)

  return { received, outstanding, overdue, pending }
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}
