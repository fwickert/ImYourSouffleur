import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Customer } from '../models/Customer';

interface CustomerContextType {
    customers: Customer[];
    setCustomers: (customers: Customer[]) => void;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export const CustomerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [customers, setCustomers] = useState<Customer[]>([]);

    return (
        <CustomerContext.Provider value={{ customers, setCustomers }}>
            {children}
        </CustomerContext.Provider>
    );
};

export const useCustomers = (): CustomerContextType => {
    const context = useContext(CustomerContext);
    if (!context) {
        throw new Error('useCustomers must be used within a CustomerProvider');
    }
    return context;
};
