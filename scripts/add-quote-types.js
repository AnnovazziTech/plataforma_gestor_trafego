const fs = require('fs');
let content = fs.readFileSync('src/types/index.ts', 'utf8');

const addition = `

// Orçamentos / Quotes
export type QuoteStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired'

export interface QuoteService {
  id: string
  name: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface QuoteClient {
  name: string
  email: string
  phone?: string
  company?: string
  document?: string // CPF/CNPJ
}

export interface Quote {
  id: string
  number: string // Ex: ORC-2024-001
  client: QuoteClient
  services: QuoteService[]
  subtotal: number
  discount: number
  discountType: 'percent' | 'fixed'
  total: number
  validUntil: string
  notes?: string
  paymentTerms?: string
  status: QuoteStatus
  createdAt: string
  updatedAt: string
  sentAt?: string
  viewedAt?: string
  respondedAt?: string
}

export interface ServiceTemplate {
  id: string
  name: string
  description: string
  defaultPrice: number
  category: string
}
`;

if (!content.includes('QuoteStatus')) {
  content = content.trim() + addition;
  fs.writeFileSync('src/types/index.ts', content);
  console.log('Types added successfully');
} else {
  console.log('Types already exist');
}
