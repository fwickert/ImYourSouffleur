import React from 'react';
import { useCustomers } from '../models/CustomerContext';
import { makeStyles, shorthands } from '@fluentui/react-components';

const useStyles = makeStyles({
    customerListContainer: {
        width: '20%',
        borderRight: '1px solid #ccc',
        ...shorthands.padding('10px'),
        overflowY: 'auto',
    },
    customerItem: {
        padding: '10px',
        cursor: 'pointer',
        '&:hover': {
            backgroundColor: '#f0f0f0',
        },
    },
});

interface CustomerListProps {
    onSelectCustomer: (customerId: string) => void;
}

const CustomerList: React.FC<CustomerListProps> = ({ onSelectCustomer }) => {
    const styles = useStyles();
    const { customers } = useCustomers();

    return (
        <div className={styles.customerListContainer}>
            {customers.map(customer => (
                <div
                    key={customer.customerId}
                    className={styles.customerItem}
                    onClick={() => onSelectCustomer(customer.customerId)}
                >
                    {customer.lastName}
                </div>
            ))}
        </div>
    );
};

export default CustomerList;
