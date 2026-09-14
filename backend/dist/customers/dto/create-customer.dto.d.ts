import { CustomerStatus } from '../customer.entity';
export declare class CreateCustomerDto {
    name: string;
    phone: string;
    city?: string;
    notes?: string;
    productInterest?: string;
    status?: CustomerStatus;
    isReturning?: boolean;
    lastContactAt?: string | null;
    nextFollowUpAt?: string | null;
    tags?: string[];
}
