import axios from 'axios';
import { Customer } from '../models/Customer';

class CustomerService {
    
    public async getCustomerById(customerId: string): Promise<Customer | null> {
        try {
            const response = await axios.get<Customer>(`/api/customer/${customerId}`);
            console.log(`Customer loaded : `, response.data);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                return null;
            }
            throw error;
        }
    }
}

export default CustomerService;
