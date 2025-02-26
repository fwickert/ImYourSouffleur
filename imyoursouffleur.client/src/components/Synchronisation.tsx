import React, { useState } from 'react';
import { Persona } from '../models/Persona';
import { Button, makeStyles, Card, Image, Spinner } from '@fluentui/react-components';
import { ArrowLeft24Regular, ArrowSyncRegular } from '@fluentui/react-icons';
import Appointments from './Appointments';
import CustomerService from '../services/CustomerService';
import { Customer } from '../models/Customer';
import { Appointment } from '../models/Appointment';
import { useCustomers } from '../models/CustomerContext';

interface SynchronisationProps {
    persona: Persona;
    onBack: () => void;
    isOnline: boolean;
}

const useStyles = makeStyles({
    container: {
        padding: '20px',
        position: 'relative',
    },
    backButton: {
        marginBottom: '20px',
        borderRadius: '50%', // Make the button circular
        width: '30px', // Set a fixed width
        height: '30px', // Set a fixed height
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    personaCard: {
        position: 'absolute',
        top: '20px',
        right: '20px',
        width: '150px', // Set a small width
        height: '100px', // Set a small height
        borderRadius: '10px',
        overflow: 'hidden',
    },
    personaImage: {
        width: '100%',
        height: '70px', // Adjust height for the image
        objectFit: 'cover',
    },
    appointmentsContainer: {
        marginTop: '20px',
        display: 'flex',
        alignItems: 'center',
    },
    appointments: {
        // Add any specific styles for appointments if needed
    },
    synchroButton: {
        marginLeft: '50px',
        border: 'none',
        backgroundColor: 'transparent',
    },
    spinner: {
        marginLeft: '20px',
    },
    statusMessage: {
        marginLeft: '10px',
        alignSelf: 'center',
    },
    customersContainer: {
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        backgroundColor: 'var(--colorNeutralBackground1)',
        width: '400px',
        border: '1px solid lightgray',
        marginLeft: '20px',
    },
    customerItem: {
        padding: '10px',
        margin: '10px 0',
        borderRadius: '8px',
        backgroundColor: '#000',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #777',
    },
});

const Synchronisation: React.FC<SynchronisationProps> = ({ persona, onBack, isOnline }) => {
    const classes = useStyles();
    const { customers, setCustomers } = useCustomers(); // Use the customer context
    const [loading, setLoading] = useState(false);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loadingCustomers, setLoadingCustomers] = useState<boolean[]>([]);
    const [syncClicked, setSyncClicked] = useState(false);

    const handleAppointmentsLoaded = (loadedAppointments: Appointment[]) => {
        setAppointments(loadedAppointments);
    };

    const handleSyncClick = async () => {
        setLoading(true);
        setSyncClicked(true);
        const customerService = new CustomerService();
        const loadedCustomers: Customer[] = [];
        const loadingStates = new Array(appointments.length).fill(true);
        setLoadingCustomers(loadingStates);

        for (let i = 0; i < appointments.length; i++) {
            const appointment = appointments[i];
            if (!appointment.personal) {
                const loadedCustomer: Customer | null = await customerService.getCustomerById(appointment.customerId, isOnline);
                if (loadedCustomer !== null) {
                    loadedCustomers.push(loadedCustomer);
                }
                loadingStates[i] = false;
                setLoadingCustomers([...loadingStates]);
            }
        }

        setCustomers(loadedCustomers); // Set the customers in context
        setLoading(false);
    };

    return (
        <div className={classes.container}>
            <Button
                icon={<ArrowLeft24Regular />}
                onClick={onBack}
                className={classes.backButton}
            />
            <Card className={classes.personaCard}>
                <Image src={persona.image} alt={persona.name} className={classes.personaImage} />
            </Card>
            <h1>Synchronisation</h1>
            <p>Récupère les informations pour ta journée</p>
            <p>{persona.prompt}</p>            
            <div className={classes.appointmentsContainer}>
                <div className={classes.appointments}>
                    <Appointments persona={persona.type} onAppointmentsLoaded={handleAppointmentsLoaded} />
                </div>
                <Button
                    icon={<ArrowSyncRegular />}
                    className={classes.synchroButton}
                    onClick={handleSyncClick}
                    disabled={loading}
                />
                <div className={classes.customersContainer}>
                    {syncClicked && appointments.filter(appointment => !appointment.personal).map((_, index) => (
                        <div key={index} className={classes.customerItem}>
                            {loadingCustomers[index] ? (
                                <Spinner className={classes.spinner} />
                            ) : (
                                <div className={classes.statusMessage}>
                                    Customer {customers[index]?.firstName} {customers[index]?.lastName} is loaded
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Synchronisation;