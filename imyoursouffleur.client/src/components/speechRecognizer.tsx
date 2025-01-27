import { useState, useEffect } from 'react';
import { Button } from '@fluentui/react-button';
import { MicRegular } from "@fluentui/react-icons";
import { getMicroRecognitionAsync } from '../services/SpeechService';
import { HubConnection } from '@microsoft/signalr';
import './speechRecognizer.css';
import { Customer } from '../models/Customer';

interface SpeechRecognizerProps {
    onNewMessage: (message: string) => void;
    onEndedSpeechMessage: (message: string, selectedCustomer: Customer | null) => void;
    connection: HubConnection | null;
    selectedCustomer: Customer | null;
}

const SpeechRecognizer: React.FC<SpeechRecognizerProps> = ({ onNewMessage, onEndedSpeechMessage, connection, selectedCustomer }) => {
    const [isMicOn, setIsMicOn] = useState(false);

    useEffect(() => {
        if (connection) {
            connection.on('ReceiveMessageInProgress', (message: string) => {
                onNewMessage(message);
            });
            connection.on('ReceiveMessageEnd', (message: string) => {
                if (message) {
                    onEndedSpeechMessage(message, selectedCustomer);
                }
                setIsMicOn(false);
            });
        }
    }, [connection, selectedCustomer]);

    const startRecognition = async () => {
        try {
            setIsMicOn(true);
            await getMicroRecognitionAsync("fr-FR");
        } catch (error) {
            // Handle error
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
