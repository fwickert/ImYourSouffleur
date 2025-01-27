import axios from 'axios';
import { ChatHistoryRequest } from '../models/ChatHistoryRequest';

const API_BASE_URL = '/api';

export const getMessages = async (sessionId: string) => {
    const response = await axios.get(`${API_BASE_URL}/chat/messages/${sessionId}`);
    return response.data;
};

export const sendMessage = async (chatHistory: ChatHistoryRequest, model:string,  connectionId: string | null | undefined) => {
    const response = await axios.post(`${API_BASE_URL}/chat/message`, chatHistory, {
        params: { connectionId, model}
    });
    return response.data;
    
};
