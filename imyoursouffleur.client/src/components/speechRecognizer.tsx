import { useState, useEffect } from 'react';
import { Button } from '@fluentui/react-button';
import { MicRegular } from "@fluentui/react-icons";
import { getMicroRecognitionAsync } from '../services/SpeechService';
import { HubConnection } from '@microsoft/signalr';
import './speechRecognizer.css';

interface SpeechRecognizerProps {
    onNewMessage: (message: string) => void;
    onEndedSpeechMessage: (message: string) => void;
    connection: HubConnection | null;
}

const SpeechRecognizer: React.FC<SpeechRecognizerProps> = ({ onNewMessage, onEndedSpeechMessage, connection }) => {
    const [isMicOn, setIsMicOn] = useState(false);

    useEffect(() => {
        if (connection) {
            connection.on('ReceiveMessageInProgress', (message: string) => {
                onNewMessage(message);
            });
            connection.on('ReceiveMessageEnd', (message: string) => {
                //onNewMessage(message);
                onEndedSpeechMessage(message); // Call onEndedSpeechMessage when speech ends
                setIsMicOn(false);
            });
        }
    }, [connection]);

    const startRecognition = async () => {
        try {
            setIsMicOn(true);
            // Create an empty user message
            //onNewMessage('');
            await getMicroRecognitionAsync("fr-FR");
        } catch (error) {
            //console.error('Error starting speech recognition:', error);
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
