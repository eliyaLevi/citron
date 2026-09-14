export declare enum CustomerStatus {
    NEW = "\u05D7\u05D3\u05E9",
    FOLLOW_UP = "\u05D1\u05DE\u05E2\u05E7\u05D1",
    CLOSED = "\u05E0\u05E1\u05D2\u05E8"
}
export declare class Customer {
    id: string;
    name: string;
    phone: string;
    city: string;
    notes: string;
    productInterest: string;
    status: CustomerStatus;
    isReturning: boolean;
    lastContactAt: string | null;
    nextFollowUpAt: string | null;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}
