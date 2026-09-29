export type ViewKey = 'discover' | 'checkout' | 'dashboard' | 'products' | 'orders' | 'analytics' | 'admin'

export type ProductStatus = 'Live' | 'Draft' | 'Review' | 'Paused'

export type RiskLevel = 'Low' | 'Medium' | 'High'

export type Product = {
  id: string
  title: string
  creator: string
  handle: string
  category: string
  kind: 'Course' | 'Template' | 'Membership' | 'Book' | 'Asset Pack'
  price: number
  compareAt?: number
  sales: number
  rating: number
  refundRate: number
  conversion: number
  status: ProductStatus
  risk: RiskLevel
  tags: string[]
  accent: string
  description: string
  delivery: string
  license: string
  updated: string
  subscription?: string
}

export type Creator = {
  name: string
  handle: string
  followers: number
  mrr: number
  responseTime: string
  payoutStatus: 'Ready' | 'Pending KYC' | 'Hold'
  taxStatus: 'Compliant' | 'Needs W-9' | 'Review'
}

export type Order = {
  id: string
  customer: string
  productId: string
  amount: number
  status: 'Paid' | 'Refunded' | 'Disputed' | 'Fulfilled'
  risk: RiskLevel
  date: string
  country: string
  channel: string
  licenseKey: string
}

export type Metric = {
  label: string
  value: string
  delta: string
  tone: 'good' | 'warn' | 'bad' | 'neutral'
}

export type Activity = {
  id: string
  actor: string
  event: string
  time: string
  severity: 'Info' | 'Warning' | 'Critical'
}

export type Discount = {
  code: string
  value: number
  redemptions: number
  expires: string
}
