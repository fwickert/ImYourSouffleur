import React from 'react';
import { FluentProvider, webDarkTheme } from '@fluentui/react-components';
import Sidebar from './components/Sidebar';
import HeroSection from './components/HeroSection';
import SamplesGrid from './components/SamplesGrid';

const App: React.FC = () => {
    return (
        <FluentProvider theme={webDarkTheme}>
            <div
                style={{
                    display: 'flex',
                    height: '100vh',
                    overflow: 'hidden',
                    position: 'relative', // Add relative positioning
                    backgroundImage: 'url(/bg.jpg)', // Add background image
                    backgroundSize: 'cover', // Ensure the image covers the entire background
                    backgroundPosition: 'center', // Center the background image
                }}
            >
                {/* Dark overlay */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: '100px',
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.7)', // Semi-transparent black
                        zIndex: 1, // Ensure the overlay is above the background image
                    }}
                ></div>
                <Sidebar />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', zIndex: 2 }}>
                    <main style={{ padding: '20px', overflowY: 'auto' }}>
                        <HeroSection />
                        <SamplesGrid />
                    </main>
                </div>
            </div>
        </FluentProvider>
    );
};

export default App;
