import React, { useEffect, useState } from 'react';
import { makeStyles, Spinner } from '@fluentui/react-components';
import { getAppointments } from '../services/AppointmentService';
import { Appointment } from '../models/Appointment';

const useStyles = makeStyles({
    container: {
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        backgroundColor: 'var(--colorNeutralBackground1)',
        width: '400px',
        border: '1px solid lightgray',
    },
    appointmentItem: {
        padding: '10px',
        margin: '10px 0',
        borderRadius: '8px',
        backgroundColor: '#000',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #777',
    },
    appointmentTitle: {
        fontSize: '16px',
        fontWeight: 'bold',
        marginBottom: '5px',
    },
    appointmentTime: {
        fontSize: '14px',
        color: '#555',
    },
    spinnerContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
    },
});

interface AppointmentsProps {
    persona: string;
    onAppointmentsLoaded: (appointments: Appointment[]) => void;
}

const Appointments: React.FC<AppointmentsProps> = ({ persona, onAppointmentsLoaded }) => {
    const classes = useStyles();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const data = await getAppointments(persona);
                setAppointments(data);
                onAppointmentsLoaded(data); // Pass the loaded appointments to the parent component
            } catch (error) {
                console.error('Error fetching appointments:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, [persona, onAppointmentsLoaded]);

    return (
        <div className={classes.container}>
            <h2>Rendez-Vous</h2>
            {loading ? (
                <div className={classes.spinnerContainer}>
                    <Spinner label="Chargements des Rendez-vous..." />
                </div>
            ) : (
                <ul>
                    {appointments.map((appointment, index) => (
                        <li key={index} className={classes.appointmentItem}>
                            <div className={classes.appointmentTitle}>{appointment.title}</div>
                            <div className={classes.appointmentTime}>
                                {new Date(appointment.start).toLocaleString()} - {new Date(appointment.end).toLocaleString()}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Appointments;
