export interface Address {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

export interface Purchase {
    purchaseId: string;
    productId: string;
    purchaseDate: Date;
    amount: number;
}

export interface CustomerServiceHistory {
    serviceId: string;
    serviceDate: Date;
    description: string;
}

export interface Customer {
    customerId: string;
    company: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: Address;
    purchaseHistory: Purchase[];
    customerServiceHistory: CustomerServiceHistory[];
    summary: string;
    documentation: string;
}
