import React, { useState } from 'react';
import { useCustomers } from '../models/CustomerContext';
import { makeStyles, shorthands } from '@fluentui/react-components';

const useStyles = makeStyles({
    customerListContainer: {
        
        //borderRight: '1px solid #ccc',
        ...shorthands.padding('10px'),
        overflowY: 'auto',
    },
    customerItem: {
        padding: '10px',
        cursor: 'pointer',
        '&:hover': {
            backgroundColor: '#fff',
            color: '#000',
        },
    },
    selectedCustomerItem: {
        backgroundColor: '#fff',
        color: '#000',
        '&:hover': {
            backgroundColor: '#fff',
            color: '#000',
        },
    },
});

interface CustomerListProps {
    onSelectCustomer: (customerId: string) => void;
}

const CustomerList: React.FC<CustomerListProps> = ({ onSelectCustomer }) => {
    const styles = useStyles();
    const { customers } = useCustomers();
    const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

    const handleCustomerClick = (customerId: string) => {
        setSelectedCustomerId(customerId);
        onSelectCustomer(customerId);
    };

    return (
        <div className={styles.customerListContainer}>
            {customers.map(customer => (
                <div
                    key={customer.customerId}
                    className={`${styles.customerItem} ${selectedCustomerId === customer.customerId ? styles.selectedCustomerItem : ''}`}
                    onClick={() => handleCustomerClick(customer.customerId)}
                >
                    {customer.lastName}
                </div>
            ))}
        </div>
    );
};

export default CustomerList;
