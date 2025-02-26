// src/services/ReportService.ts
import axios from 'axios';

export async function fetchReport(): Promise<string> {
    try {
        const response = await axios.get('/api/report');
        return response.data;
    } catch (error) {
        console.error('Error fetching the report:', error);
        throw error;
    }
}

export async function postReport(transcript: { content: string, customerInfo: string }, connectionId: string): Promise<string> {
    try {
        const response = await axios.post('/api/report', transcript, {
            params: { connectionId }
        });
        return response.data;
    } catch (error) {
        console.error('Error posting the report:', error);
        throw error;
    }
}
