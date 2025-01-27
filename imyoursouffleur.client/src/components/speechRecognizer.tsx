import { useState, useEffect } from 'react';
import { Button } from '@fluentui/react-button';
import { MicRegular } from "@fluentui/react-icons";
import { getMicroRecognitionAsync } from '../services/SpeechService';
import { getHubConnection } from '../services/SignalR';
import './speechRecognizer.css';

interface SpeechRecognizerProps {
    onNewMessage: (message: string) => void;
}

const SpeechRecognizer: React.FC<SpeechRecognizerProps> = ({ onNewMessage }) => {
    const [isMicOn, setIsMicOn] = useState(false);
    

    useEffect(() => {
        const setupSignalRConnection = async () => {
            const connection = await getHubConnection();
            connection.on('ReceiveMessageInProgress', (message: string) => {                
                onNewMessage(message);
            });
            connection.on('ReceiveMessageEnd', (message: string) => {                
                onNewMessage(message);
                setIsMicOn(false);
            });
        };

        setupSignalRConnection();
    }, [onNewMessage]);

    const startRecognition = async () => {
        try {
            setIsMicOn(true);
            // Create an empty user message
            onNewMessage('');
            const text = await getMicroRecognitionAsync("fr-FR");            
        } catch (error) {
            //console.error('Error starting speech recognition:');
            
        }
    };

    return (
        <div>
            <Button onClick={startRecognition}
                appearance="transparent"
                className={`mic-icon ${isMicOn ? 'mic-on' : ''}`}
                icon={<MicRegular className={`mic-icon ${isMicOn ? 'mic-on' : ''}`} />}
                disabled={isMicOn}
            />
        </div>
    );
};

export default SpeechRecognizer;
