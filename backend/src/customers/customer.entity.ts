import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

export enum CustomerStatus {
  NEW = 'חדש',
  FOLLOW_UP = 'במעקב',
  CLOSED = 'נסגר',
}

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ length: 120 })
  name: string

  @Column({ length: 30 })
  phone: string

  @Column({ length: 120, default: '' })
  city: string

  @Column({ type: 'text', default: '' })
  notes: string

  @Column({ type: 'text', default: '' })
  productInterest: string

  @Column({ type: 'enum', enum: CustomerStatus, default: CustomerStatus.NEW })
  status: CustomerStatus

  @Column({ default: false })
  isReturning: boolean

  @Column({ type: 'date', nullable: true })
  lastContactAt: string | null

  @Column({ type: 'date', nullable: true })
  nextFollowUpAt: string | null

  @Column('text', { array: true, default: '{}' })
  tags: string[]

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date
}
