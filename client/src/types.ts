export type Customer = {
  id: string
  name: string
  phone: string
  city: string
  notes: string
  productInterest: string
  status: 'חדש' | 'במעקב' | 'נסגר'
  isReturning: boolean
  lastContactAt: string
  nextFollowUpAt: string
  tags: string[]
  updatedAt: string
}

export type CustomerDraft = Omit<Customer, 'id' | 'updatedAt'>