import React, { useState } from 'react';
import { Button, makeStyles } from '@fluentui/react-components';
import { ArrowLeft24Regular } from '@fluentui/react-icons';
import SpeechRecognizer from './speechRecognizer';
import { renderMarkdown } from '../utilities/MarkdownRenderer';
import { postReport } from '../services/ReportService';
import { Customer } from '../models/Customer';

const useStyles = makeStyles({
    container: {
        display: 'flex',
        flexDirection: 'column',
        padding: '10px',
        position: 'relative',
    },
    backButton: {
        marginBottom: '20px',
        borderRadius: '50%', // Make the button circular
        width: '30px', // Set a fixed width
        height: '30px', // Set a fixed height
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    status: {
        marginBottom: '10px',
    },
    micContainer: {
        marginBottom: '10px',
    },
    transcriptionArea: {
        height: '200px',
        overflowY: 'auto',
        border: '1px solid #ccc',
        borderRadius: '5px',
        padding: '10px',
        backgroundColor: '#222',
        color: '#fff',
        marginBottom: '10px',
    },
    actions: {
        display: 'flex',
        gap: '10px',
    },
    messageContainer: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
    },
    userMessage: {
        color: '#ffffff',
    },
    reportContainer: {
        marginTop: '20px',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        backgroundColor: '#fff',
        color: '#000',
    }
});

interface Message {
    content: string;
    ended: boolean;
}

interface MaintenanceReportProps {
    onBack: () => void;
    connection: any;
    isOnline: boolean;
    selectedCustomer: Customer | null;
}

const MaintenanceReport: React.FC<MaintenanceReportProps> = ({ onBack, connection, isOnline, selectedCustomer }) => {
    const styles = useStyles();
    const [Messages, setMessages] = useState<Message[]>([]);
    const [reportHtml, setReportHtml] = useState<string | null>(null);

    const handleNewMessage = async (message: string) => {
        setMessages(prevMessages => {
            const updatedMessages = [...prevMessages];
            const lastMessageIndex = updatedMessages.length - 1;
            if (lastMessageIndex >= 0 && updatedMessages[lastMessageIndex].ended == false) {
                updatedMessages[lastMessageIndex] = {
                    ...updatedMessages[lastMessageIndex],
                    content: message,
                    ended: false
                };
            }
            else {
                updatedMessages.push({
                    content: message,
                    ended: false
                });
            }


            return updatedMessages;
        });
    };

    const handleEndedSpeechMessage = async (finalMessage: string) => {
        setMessages(prevMessages => {
            const updatedMessages = [...prevMessages];
            const lastMessageIndex = updatedMessages.length - 1;
            if (lastMessageIndex >= 0 && updatedMessages[lastMessageIndex].ended == false) {

                updatedMessages[lastMessageIndex] = {
                    ...updatedMessages[lastMessageIndex],
                    content: finalMessage,
                    ended: true
                };
            }

            return updatedMessages;
        });

    };

    const handleGenerateReport = async () => {
        const transcript = {
            content: Messages.map(message => message.content).join(' '),
            customerInfo: selectedCustomer!.summary // Replace with actual customer info
        };
        const report = await postReport(transcript, connection.connectionId);    
        const html = await renderMarkdown(report);
        setReportHtml(html);
    };

    return (
        <div className={styles.container}>
            <Button icon={<ArrowLeft24Regular />} onClick={onBack} className={styles.backButton} />

            <div className={styles.micContainer}>
                <SpeechRecognizer
                    onNewMessage={handleNewMessage}
                    onEndedSpeechMessage={handleEndedSpeechMessage}
                    connection={connection}
                    selectedCustomer={null}
                />
            </div>
            <div className={styles.transcriptionArea}>
                <div className={styles.messageContainer}>
                    {Messages.map((message, index) => (
                        <div
                            key={index}
                            className={styles.userMessage}
                            dangerouslySetInnerHTML={{ __html: message.content }}
                        />
                    ))}
                </div>
            </div>
            <div className={styles.actions}>
                <Button onClick={handleGenerateReport}>Rapport</Button>
            </div>
            {reportHtml && (
                <div className={styles.reportContainer} dangerouslySetInnerHTML={{ __html: reportHtml }} />
            )}
        </div>
    );
};

export default MaintenanceReport;
