import axios from 'axios';
import { Appointment } from '../models/Appointment';

export const getAppointments = async (persona?: string): Promise<Appointment[]> => {
    const response = await axios.get<Appointment[]>('/api/appointments', {
        params: { persona }
    });
    return response.data;
};
