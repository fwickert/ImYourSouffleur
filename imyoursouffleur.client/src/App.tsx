// src/App.tsx
import React, { useState, useEffect } from 'react';
import { FluentProvider, webDarkTheme } from '@fluentui/react-components';
import Sidebar from './components/Sidebar';
import HeroSection from './components/HeroSection';
import SamplesGrid from './components/SamplesGrid';
import Synchronisation from './components/Synchronisation';
import Chat from './components/chat';
import { Persona } from './models/Persona';
import { HubConnection } from '@microsoft/signalr';
import { getHubConnection } from './services/SignalR';
import { CustomerProvider } from './models/CustomerContext'; // Import CustomerProvider

const App: React.FC = () => {
    const [selectedPersona, setSelectedPersona] = useState<number | null>(null);
    const [showSynchronisationScreen, setShowSynchronisationScreen] = useState<boolean>(false);
    const [showChat, setShowChat] = useState<boolean>(false);
    const [connection, setConnection] = useState<HubConnection | null>(null);
    const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

    const personas: Persona[] = [
        { name: 'Vendeurs', type: "Sales", prompt: 'Démarre ta journée en synchronisant tes données de vente.', image: '/sales.jpeg' },
        { name: 'Maintenance', type: "FieldService", prompt: 'Démarre ta journée en synchronisant tes données de maintenance.', image: '/fieldservice.jpeg' },
        { name: 'Beauty Advisor', type: "FieldService", prompt: 'Démarre ta journée en synchronisant tes données de beauté.', image: '/retail.jpeg' },
        { name: 'Finance', type: "FieldService", prompt: 'Démarre ta journée en synchronisant tes données financières.', image: '/finance.jpeg' },
    ];

    useEffect(() => {
        const setupConnection = async () => {
            try {
                const newConnection = await getHubConnection();
                setConnection(newConnection);
            } catch (error) {
                console.error('Connection failed: ', error);
            }
        };

        setupConnection();

        const updateOnlineStatus = () => {
            setIsOnline(navigator.onLine);
        };

        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);

        return () => {
            window.removeEventListener('online', updateOnlineStatus);
            window.removeEventListener('offline', updateOnlineStatus);
        };
    }, []);

    const handlePersonaSelect = (index: number) => {
        setSelectedPersona(index);
    };

    const handleSynchronisationClick = () => {
        setShowSynchronisationScreen(true);
    };

    const handleBackClick = () => {
        setShowSynchronisationScreen(false);
        setShowChat(false);
    };

    const handleCoachClick = () => {
        setShowChat(true);
    };

    return (
        <CustomerProvider>
            <FluentProvider theme={webDarkTheme}>
                <div
                    style={{
                        display: 'flex',
                        height: '100vh',
                        overflow: 'hidden',
                        position: 'relative',
                        backgroundImage: 'url(/bg.jpg)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                >
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: '100px',
                            width: '100%',
                            height: '100%',
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            zIndex: 1,
                        }}
                    ></div>
                    <Sidebar />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', zIndex: 2 }}>
                        <main style={{ padding: '20px', overflowY: 'auto' }}>
                            <div style={{ color: isOnline ? 'green' : 'red' }}>
                                {isOnline ? 'Online' : 'Offline'}
                            </div>
                            {showSynchronisationScreen && selectedPersona !== null ? (
                                <Synchronisation persona={personas[selectedPersona]} onBack={handleBackClick} isOnline={isOnline} />
                            ) : showChat ? (
                                <Chat onBack={handleBackClick} connection={connection} isOnline={isOnline} />
                            ) : (
                                <>
                                    <HeroSection onPersonaSelect={handlePersonaSelect} />
                                    <SamplesGrid onSynchronisationClick={handleSynchronisationClick} onCoachClick={handleCoachClick} />
                                </>
                            )}
                        </main>
                    </div>
                </div>
            </FluentProvider>
        </CustomerProvider>
    );
};

export default App;
