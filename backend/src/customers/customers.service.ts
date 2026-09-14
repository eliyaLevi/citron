import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CreateCustomerDto } from './dto/create-customer.dto'
import { UpdateCustomerDto } from './dto/update-customer.dto'
import { Customer } from './customer.entity'

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customersRepository: Repository<Customer>,
  ) {}

  findAll() {
    return this.customersRepository.find({ order: { updatedAt: 'DESC' } })
  }

  async findOne(id: string) {
    const customer = await this.customersRepository.findOneBy({ id })

    if (!customer) {
      throw new NotFoundException(`Customer ${id} was not found`)
    }

    return customer
  }

  create(createCustomerDto: CreateCustomerDto) {
    const customer = this.customersRepository.create(createCustomerDto)
    return this.customersRepository.save(customer)
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto) {
    const customer = await this.findOne(id)
    Object.assign(customer, updateCustomerDto)
    return this.customersRepository.save(customer)
  }

  async remove(id: string) {
    const customer = await this.findOne(id)
    await this.customersRepository.remove(customer)
    return { id, deleted: true }
  }
}
