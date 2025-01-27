import React, { useState, useEffect, useRef } from 'react';
import {
    Button,
    Input,
    makeStyles,
    shorthands,
} from '@fluentui/react-components';
import {
    SendFilled,
    ArrowLeft24Regular,
} from '@fluentui/react-icons';
import SpeechRecognizer from './speechRecognizer';
import { HubConnection } from '@microsoft/signalr';
import { sendMessage } from '../services/ChatService';
import { ChatHistoryRequest, ChatMessage, AuthorRole } from '../models/ChatHistoryRequest';
import { TypingIndicator } from './TypingIndicator';

const useStyles = makeStyles({
    chatContainer: {
        display: 'flex',
        flexDirection: 'column',
        height: '800px',
        ...shorthands.padding('5px'),
        '@media (min-width: 768px)': {
            width: '60%',
            margin: '0 auto',
        },
    },
    messagesContainer: {
        flexGrow: 1,
        overflowY: 'auto',
        ...shorthands.margin('10px', '10px', '0px', '10px'), // Adjusted bottom margin
        height: '500px', // Fixed height
        border: '1px solid #ccc', // Border
        borderRadius: '5px',
        ...shorthands.padding('10px'),
        '@media (max-width: 767px)': {
            height: '300px', // Adjusted height for phone
        },
        backgroundColor: 'black',
    },
    inputContainer: {
        display: 'flex',
        alignItems: 'center',
        ...shorthands.margin('5px', '10px', '10px', '10px'), // Adjusted top margin
    },
    inputField: {
        flexGrow: 1,
        marginRight: '5px',
    },
    deleteMessage: {
        cursor: 'pointer',
        marginLeft: '10px',
        fontSize: '15px',
        color: 'red',
    },
    userMessage: {
        //backgroundColor: '#f0f0f0',
        padding: '10px',
        borderRadius: '5px',
        marginBottom: '10px',
        alignSelf: 'flex-end',
        maxWidth: '50%',
    },
    assistantMessage: {
        //backgroundColor: '#e0e0e0',
        padding: '10px',
        borderRadius: '5px',
        marginBottom: '10px',
        alignSelf: 'flex-start',
        maxWidth: '50%',
        color: 'pink',
    },
    messageContainer: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
    },
    spinnerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
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
});

interface Message {
    content: string;
    authorRole: AuthorRole;
}

interface ChatProps {
    onBack: () => void;
    connection: HubConnection | null;
    isOnline: boolean;
}

const Chat: React.FC<ChatProps> = ({ onBack, connection, isOnline }) => {
    const styles = useStyles();
    const [inputText, setInputText] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const currentMessageRef = useRef<string | null>(null);
    const [isTyping, setIsTyping] = useState<boolean>(false);

    useEffect(() => {
        if (connection) {
            setupConnectionHandlers(connection);
        }
    }, []);

    const removeConnectionHandlers = (connection: HubConnection) => {
        connection.off('StartMessageUpdate');
        connection.off('InProgressMessageUpdate');
        connection.off('EndMessageUpdate');
    };

    const setupConnectionHandlers = (connection: HubConnection) => {
        removeConnectionHandlers(connection);

        connection.on('StartMessageUpdate', (_: Message) => {
            setIsTyping(true);
        });

        connection.on('InProgressMessageUpdate', (message: string) => {
            setIsTyping(false);

            currentMessageRef.current = message;

            setMessages(prevMessages => {
                const updatedMessages = [...prevMessages];
                const lastMessage = updatedMessages[updatedMessages.length - 1];
                if (lastMessage && lastMessage.authorRole === AuthorRole.Assistant) {
                    // Update the last assistant message
                    updatedMessages[updatedMessages.length - 1] = { ...lastMessage, content: message };
                } else {
                    // Add a new assistant message if the last message is not from the assistant
                    updatedMessages.push({
                        content: message,
                        authorRole: AuthorRole.Assistant

                    });
                }

                return updatedMessages;
            });
        });

        connection.on('EndMessageUpdate', (_: string) => {
            // Handle end message update
        });
    };

    const handleNewMessage = (message: string) => {
        setMessages(prevMessages => {
            const updatedMessages = [...prevMessages];
            // Add a new non-mic user message
            updatedMessages.push({ content: message, authorRole: AuthorRole.User });

            return updatedMessages;
        });
    };

    const sendMessageToServer = async (message: string) => {
        const chatHistory = new ChatHistoryRequest([
            ...messages.map(msg => new ChatMessage(msg.content, msg.authorRole)),
            new ChatMessage(message, AuthorRole.User)
        ]);

        console.log('Sending history to server:', chatHistory);

        const endpoint = isOnline ? "Cloud4omini" : "Localphi3";
        await sendMessage(chatHistory, endpoint, connection?.connectionId);
    }

    const handleSendClick = () => {
        handleNewMessage(inputText);
        sendMessageToServer(inputText);
        setInputText('');
    };

    const handleNewMessageFromSpeech = (message: string) => {
        setMessages(prevMessages => {
            const updatedMessages = [...prevMessages];
            const lastMessageIndex = updatedMessages.length - 1;
            if (lastMessageIndex >= 0 && updatedMessages[lastMessageIndex].authorRole === AuthorRole.User) {
                // Update the last user message
                updatedMessages[lastMessageIndex] = {
                    ...updatedMessages[lastMessageIndex],
                    content: message
                };
            } else {
                // Add a new user message if the last message is not from the user
                updatedMessages.push({
                    content: message,
                    authorRole: AuthorRole.User
                });
            }
            return updatedMessages;
        });
    };

    const onEndedSpeechMessage = async (finalMessage: string) => {
        // Update the messages state with the final speech message
        setMessages(prevMessages => {
            const updatedMessages = [...prevMessages];
            const lastMessageIndex = updatedMessages.length - 1;

            if (lastMessageIndex >= 0 && updatedMessages[lastMessageIndex].authorRole === AuthorRole.User) {
                // Update the last user message with the final speech input
                updatedMessages[lastMessageIndex] = {
                    ...updatedMessages[lastMessageIndex],
                    content: finalMessage
                };
            } else {
                // Add a new user message if the last message is not from the user
                updatedMessages.push({
                    content: finalMessage,
                    authorRole: AuthorRole.User
                });
            }

            // Send the updated messages to the server
            const chatHistory = new ChatHistoryRequest(
                updatedMessages.map(msg => new ChatMessage(msg.content, msg.authorRole))
            );
            const endpoint = isOnline ? "Cloud4omini" : "Localphi3";
            sendMessage(chatHistory, endpoint, connection?.connectionId);

            return updatedMessages;
        });
    };


    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSendClick();
        }
    };

    return (
        <div className={styles.chatContainer}>
            <Button
                icon={<ArrowLeft24Regular />}
                onClick={onBack}
                className={styles.backButton}
            />            
            <div className={styles.messagesContainer}>
                {messages.map((msg, index) => (
                    <div key={index} className={styles.messageContainer}>
                        <div className={msg.authorRole === AuthorRole.User ? styles.userMessage : styles.assistantMessage}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isTyping && <TypingIndicator />}
            </div>
            <div className={styles.inputContainer}>
                <Input
                    placeholder="Type your message"
                    value={inputText}
                    onChange={(_e, data) => setInputText(data.value)}
                    onKeyDown={handleKeyDown}
                    className={`${styles.inputField}`}
                    disabled={false}
                />
                <Button icon={<SendFilled />} onClick={handleSendClick} disabled={false} />
                <div className="micButtonContainer">
                    <SpeechRecognizer onNewMessage={handleNewMessageFromSpeech} onEndedSpeechMessage={onEndedSpeechMessage} connection={connection} />
                </div>
            </div>
        </div>
    );
};

export default Chat;
