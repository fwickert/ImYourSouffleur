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

export async function fetchFilledReport(): Promise<string> {
    try {
        const response = await axios.get('/api/report/filled');
        return response.data;
    } catch (error) {
        console.error('Error fetching the filled report:', error);
        throw error;
    }
}

export async function fetchImageDescription(): Promise<string> {
    try {
        const response = await axios.get('/api/report/imageDescription');
        return response.data;
    } catch (error) {
        console.error('Error fetching the image description:', error);
        throw error;
    }
}

export async function postConclusion(conclusion: { content: string }, isOnline: boolean, connectionId: string): Promise<void> {
    const endpoint = isOnline ? "Cloud4o" : "Localphi3";
    try {
        const response = await axios.post('/api/report/conclusion', conclusion,
            { params: { endpoint, connectionId } });
        return response.data;
    } catch (error) {
        console.error('Error posting the conclusion:', error);
        throw error;
    }
}