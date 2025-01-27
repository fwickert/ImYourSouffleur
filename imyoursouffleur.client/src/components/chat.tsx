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
import { getHubConnection } from '../services/SignalR';
import { ChatHistoryRequest, ChatMessage, AuthorRole } from '../models/ChatHistoryRequest';
import { textToSpeechAsync } from '../services/SpeechService';
import { TypingIndicator } from './TypingIndicator';
import { Spinner } from '@fluentui/react-components';

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
}

const Chat: React.FC<ChatProps> = ({ onBack }) => {
    const styles = useStyles();
    const [inputText, setInputText] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [connection, setConnection] = useState<HubConnection | null>(null);
    const currentMessageRef = useRef<string | null>(null);
    const [isTyping, setIsTyping] = useState<boolean>(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);

    useEffect(() => {
        const setupConnection = async () => {
            try {
                const newConnection = await getHubConnection();
                setConnection(newConnection);
                setupConnectionHandlers(newConnection);
            } catch (error) {
                console.error('Connection failed: ', error);
            }
        };

        setupConnection();
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

        connection.on('InProgressMessageUpdate', (message: Message) => {
            setIsTyping(false);
            currentMessageRef.current = message.content;

            setMessages(prevMessages => {
                const existingMessageIndex = prevMessages.findIndex(msg => msg.content === message.content);
                if (existingMessageIndex !== -1) {
                    const updatedMessages = [...prevMessages];
                    updatedMessages[existingMessageIndex] = { ...updatedMessages[existingMessageIndex], content: message.content };
                    return updatedMessages;
                } else {
                    return [...prevMessages, {
                        content: message.content,
                        authorRole: AuthorRole.Assistant
                    }];
                }
            });
        });

        connection.on('EndMessageUpdate', (message: any) => {
            setMessages(prevMessages => {
                const updatedMessages = [...prevMessages];
                // Find the last assistant message
                const lastMessage = updatedMessages.slice().reverse().find(msg => msg.authorRole === AuthorRole.Assistant);
                if (lastMessage) {
                    lastMessage.content = message.content;
                }
                return updatedMessages;
            });

            textToSpeechAsync(message.content);
        });
    };

    const handleNewMessage = async (message: string, mic: boolean) => {
        setMessages(prevMessages => {
            const updatedMessages = [...prevMessages];
            if (mic) {
                // Check if the last message is a mic user message
                const lastMessage = updatedMessages[updatedMessages.length - 1];
                if (lastMessage && lastMessage.authorRole === AuthorRole.User && lastMessage.isFromMic) {
                    // Update the existing mic message
                    updatedMessages[updatedMessages.length - 1] = { ...lastMessage, content: message };
                } else {
                    // Add a new mic message
                    updatedMessages.push({ content: message, authorRole: AuthorRole.User, isFromMic: true });
                }
            } else {
                // Add a new non-mic user message
                updatedMessages.push({ content: message, authorRole: AuthorRole.User });
            }
            return updatedMessages;
        });

        const chatHistory = new ChatHistoryRequest([
            ...messages.map(msg => new ChatMessage(msg.content, msg.authorRole)),
            new ChatMessage(message, AuthorRole.User)
        ]);

        // await sendMessage(chatHistory, connection?.connectionId);
    };

    const handleSendClick = () => {
        handleNewMessage(inputText, false);
        setInputText('');
    };

    const handleNewMessageFromSpeech = (message: string) => {
        handleNewMessage(message, true);
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
            {isLoadingMessages && <div className={styles.spinnerOverlay}><Spinner /></div>}
            <div className={styles.messagesContainer} style={{ pointerEvents: isLoadingMessages ? 'none' : 'auto' }}>
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
                    disabled={isLoadingMessages}
                />
                <Button icon={<SendFilled />} onClick={handleSendClick} disabled={isLoadingMessages} />
                <div className="micButtonContainer">
                    <SpeechRecognizer onNewMessage={handleNewMessageFromSpeech} />
                </div>
            </div>
        </div>
    );
};

export default Chat;
