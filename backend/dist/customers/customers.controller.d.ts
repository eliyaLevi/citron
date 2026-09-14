import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomersService } from './customers.service';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    findAll(): Promise<import("./customer.entity").Customer[]>;
    findOne(id: string): Promise<import("./customer.entity").Customer>;
    create(createCustomerDto: CreateCustomerDto): Promise<import("./customer.entity").Customer>;
    update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<import("./customer.entity").Customer>;
    remove(id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
}
