import axios from 'axios';

class ImageService {
    public async getDescriptionFromImage(imageFile: File, endpoint: string, connectionId: string): Promise<string> {
        const formData = new FormData();
        formData.append('imageFile', imageFile);
       

        try {
            const response = await axios.post<string>('/api/image/GetDescriptionFromImage', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                params: {
                    endpoint,
                    connectionId
                }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

export default ImageService;
