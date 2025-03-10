import React, { useState, useEffect, useRef } from 'react';
import {
    Button,
    Input,
    makeStyles,
    shorthands,    
    Tab,
    TabList
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
import { renderMarkdown } from '../utilities/MarkdownRenderer';
import { useCustomers } from '../models/CustomerContext';
import CustomerList from './CustomerList';
import { Customer } from '../models/Customer';

const useStyles = makeStyles({
    chatContainer: {
        display: 'grid',
        gridTemplateColumns: '0.5fr 3.5fr', // Adjusted columns: 0.5 part for customer list, 3.5 parts for chat
        height: '700px',
        ...shorthands.padding('5px'),
        '@media (min-width: 768px)': {
            //width: '60%',
            margin: '0 auto',
        },
    },
    messagesContainer: {
        flexGrow: 1,
        overflowY: 'auto',
        ...shorthands.margin('10px', '10px', '0px', '10px'), // Adjusted bottom margin
        height: '600px', // Fixed height
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
        //marginBottom: '10px',
        alignSelf: 'flex-end',
        maxWidth: '50%',
        color: '#ff69b4',
    },
    assistantMessage: {
        //backgroundColor: '#e0e0e0',
        padding: '10px',
        borderRadius: '5px',
        //marginBottom: '10px',
        alignSelf: 'flex-start',
        maxWidth: '50%',
        color: '#fff',
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
    customerListContainer: {
        flex: '0 0 10%', // Adjust the width as needed
        marginRight: '10px',
    },
    customerSummary: {
        margin: '10px',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        backgroundColor: '#000',
        color: '#fff',
    },
});

interface Message {
    content: string;
    authorRole: AuthorRole;
    renderedContent?: string;
}

interface ChatProps {
    onBack: () => void;
    connection: HubConnection | null;
    isOnline: boolean;
    selectedCustomer: Customer | null; // Add selectedCustomer prop
    setSelectedCustomer: (customer: Customer | null) => void; // Add setSelectedCustomer prop
}

const Chat: React.FC<ChatProps> = ({ onBack, connection, isOnline, selectedCustomer, setSelectedCustomer }) => {
    const styles = useStyles();
    const [inputText, setInputText] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const currentMessageRef = useRef<string | null>(null);
    const [isTyping, setIsTyping] = useState<boolean>(false);    
    const [selectedTab, setSelectedTab] = useState<string>('chat'); // Add selectedTab state
    const [renderedCustomerSummary, setRenderedCustomerSummary] = useState<string>(''); // Add state for rendered customer summary

    const customers = useCustomers().customers;

    useEffect(() => {
        if (connection) {
            setupConnectionHandlers(connection);
        }
    }, []);

    useEffect(() => {
        const renderCustomerSummary = async () => {
            if (selectedCustomer) {
                const renderedContent = await renderMarkdown(selectedCustomer.summary + selectedCustomer.documentation);
                setRenderedCustomerSummary(renderedContent);
            }
        };

        renderCustomerSummary();
    }, [selectedCustomer]);

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

        connection.on('InProgressMessageUpdate', async (message: string) => {
            setIsTyping(false);

            currentMessageRef.current = message;

            const renderedContent = await renderMarkdown(message);

            setMessages(prevMessages => {
                const updatedMessages = [...prevMessages];
                const lastMessage = updatedMessages[updatedMessages.length - 1];
                if (lastMessage && lastMessage.authorRole === AuthorRole.Assistant) {
                    // Update the last assistant message
                    updatedMessages[updatedMessages.length - 1] = { ...lastMessage, content: message, renderedContent };
                } else {
                    // Add a new assistant message if the last message is not from the assistant
                    updatedMessages.push({
                        content: message,
                        authorRole: AuthorRole.Assistant,
                        renderedContent
                    });
                }

                return updatedMessages;
            });
        });

        connection.on('EndMessageUpdate', (_: string) => {
            // Handle end message update
        });
    };

    const handleNewMessage = async (message: string) => {
        const renderedContent = await renderMarkdown(message);
        setMessages(prevMessages => {
            const updatedMessages = [...prevMessages];
            // Add a new non-mic user message
            updatedMessages.push({ content: message, authorRole: AuthorRole.User, renderedContent });

            return updatedMessages;
        });
    };

    const sendMessageToServer = async (message: string) => {
        const chatHistory = new ChatHistoryRequest(selectedCustomer ? selectedCustomer!.summary + selectedCustomer!.documentation : '', [
            ...messages.map(msg => new ChatMessage(msg.content, msg.authorRole)),
            new ChatMessage(message, AuthorRole.User)
        ],);

        console.log('Sending history to server:', chatHistory);

        await sendMessage(chatHistory, isOnline, connection?.connectionId);
    }

    const handleSendClick = () => {
        handleNewMessage(inputText);
        sendMessageToServer(inputText);
        setInputText('');
    };

    const handleNewMessageFromSpeech = async (message: string) => {
        const renderedContent = await renderMarkdown(message);
        setMessages(prevMessages => {
            const updatedMessages = [...prevMessages];
            const lastMessageIndex = updatedMessages.length - 1;
            if (lastMessageIndex >= 0 && updatedMessages[lastMessageIndex].authorRole === AuthorRole.User) {
                // Update the last user message
                updatedMessages[lastMessageIndex] = {
                    ...updatedMessages[lastMessageIndex],
                    content: message,
                    renderedContent
                };
            } else {
                // Add a new user message if the last message is not from the user
                updatedMessages.push({
                    content: message,
                    authorRole: AuthorRole.User,
                    renderedContent
                });
            }
            return updatedMessages;
        });
    };

    const onEndedSpeechMessage = async (finalMessage: string, selectedCustomer: Customer | null) => {
        if (!selectedCustomer) {
            return;
        }

        console.log('Customer :', selectedCustomer);

        const renderedContent = finalMessage;
        setMessages(prevMessages => {
            const updatedMessages = [...prevMessages];
            const lastMessageIndex = updatedMessages.length - 1;

            if (lastMessageIndex >= 0 && updatedMessages[lastMessageIndex].authorRole === AuthorRole.User) {
                updatedMessages[lastMessageIndex] = {
                    ...updatedMessages[lastMessageIndex],
                    content: finalMessage,
                    renderedContent
                };
            } else {
                updatedMessages.push({
                    content: finalMessage,
                    authorRole: AuthorRole.User,
                    renderedContent
                });
            }

            const chatHistory = new ChatHistoryRequest(
                selectedCustomer ? selectedCustomer.summary + selectedCustomer.documentation : "",
                updatedMessages.map(msg => new ChatMessage(msg.content, msg.authorRole))
            );



            sendMessage(chatHistory, isOnline, connection?.connectionId);

            return updatedMessages;
        });
    };


    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSendClick();
        }
    };

    const handleSelectCustomer = (customerId: string) => {
        // Find the customer in the context

        const customer = customers.find(c => c.customerId === customerId);
        if (customer) {
            setSelectedCustomer(customer);
            //console.log('Selected customer:', selectedCustomer);
        }
    };

    const onTabSelect = (_event: any, data: any) => {
        setSelectedTab(data.value);
    };

    return (
        <div className={styles.chatContainer}>
            <div className={styles.customerListContainer}>
                <Button
                    icon={<ArrowLeft24Regular />}
                    onClick={onBack}
                    className={styles.backButton}
                />
                <CustomerList onSelectCustomer={handleSelectCustomer} />
                {/*<Switch*/}
                {/*    checked={showCustomerSummary}*/}
                {/*    onChange={() => setShowCustomerSummary(!showCustomerSummary)}*/}
                {/*    label="Informations du client"*/}
                {/*/>*/}
            </div>
            <div>
                <TabList selectedValue={selectedTab} onTabSelect={onTabSelect}>
                    <Tab value="chat">Chat</Tab>
                    <Tab value="customerInfo">Contexte</Tab>
                </TabList>
                <div>
                    {selectedTab === "chat" && (
                        <div role="tabpanel">
                            <div className={styles.messagesContainer}>
                                {messages.map((msg, index) => (
                                    <div key={index} className={styles.messageContainer}>
                                        <div
                                            className={msg.authorRole === AuthorRole.User ? styles.userMessage : styles.assistantMessage}
                                            dangerouslySetInnerHTML={{ __html: msg.renderedContent || msg.content }}
                                        />
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
                                    <SpeechRecognizer
                                        onNewMessage={handleNewMessageFromSpeech}
                                        onEndedSpeechMessage={onEndedSpeechMessage}
                                        connection={connection}
                                        selectedCustomer={selectedCustomer} // Pass selectedCustomer
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    {selectedTab === "customerInfo" && (
                        <div role="tabpanel">
                            {selectedCustomer && (
                                <div className={styles.customerSummary}>
                                    <h3>Customer Summary</h3>
                                    <div dangerouslySetInnerHTML={{ __html: renderedCustomerSummary }} />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Chat;
