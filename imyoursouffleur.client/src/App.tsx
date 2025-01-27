import React, { useState } from 'react';
import { FluentProvider, webDarkTheme } from '@fluentui/react-components';
import Sidebar from './components/Sidebar';
import HeroSection from './components/HeroSection';
import SamplesGrid from './components/SamplesGrid';
import Synchronisation from './components/Synchronisation';
import Chat from './components/chat';
import { Persona } from './models/Persona';

const App: React.FC = () => {
    const [selectedPersona, setSelectedPersona] = useState<number | null>(null);
    const [showSynchronisationScreen, setShowSynchronisationScreen] = useState<boolean>(false);
    const [showChat, setShowChat] = useState<boolean>(false);

    const personas: Persona[] = [
        { name: 'Vendeurs', type:"Sales", prompt: 'Démarre ta journée en synchronisant tes données de vente.', image: '/sales.jpeg' },
        { name: 'Maintenance', type:"FieldService" , prompt: 'Démarre ta journée en synchronisant tes données de maintenance.', image: '/fieldservice.jpeg' },
        { name: 'Beauty Advisor', type: "FieldService", prompt: 'Démarre ta journée en synchronisant tes données de beauté.', image: '/retail.jpeg' },
        { name: 'Finance', type: "FieldService", prompt: 'Démarre ta journée en synchronisant tes données financières.', image: '/finance.jpeg' },
    ];

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
                        {showSynchronisationScreen && selectedPersona !== null ? (
                            <Synchronisation persona={personas[selectedPersona]} onBack={handleBackClick} />
                        ) : showChat ? (
                                <Chat onBack={handleBackClick} />
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
    );
};

export default App;
