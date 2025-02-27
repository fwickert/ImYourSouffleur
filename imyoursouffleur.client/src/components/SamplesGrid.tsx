import React from 'react';
import SampleCard from './SampleCard';

interface SamplesGridProps {
    onSynchronisationClick: () => void;
    onCoachClick: () => void;
    onRapportClick: () => void;
    onPhotosClick: () => void;
    isOnline: boolean;
}

const SamplesGrid: React.FC<SamplesGridProps> = ({ onSynchronisationClick, onCoachClick, onRapportClick, onPhotosClick, isOnline }) => {
    const samples = [
        { title: 'Synchronisation', description: 'Démarre ta journée en synchronisant tes données', buttonLabel: 'Synchronisation', disabled: !isOnline },
        { title: 'Coach', description: "Demande à ton Agent IA de t'aider si tu as des questions", buttonLabel: 'Coach', disabled: false },
        { title: 'Rapport', description: "Dicte ton rapport de maintenance et l'Agent IA s'occupe de tout", buttonLabel: 'Rapport', disabled: false },
        { title: 'Photos', description: 'Ajouter les photos et commentaires si nécessaire', buttonLabel: 'Photos', disabled: !isOnline },
        /*{ title: 'Souffleur', description: 'Utilise ton souffleur pour t\'aider pendant ton rendez-vous', buttonLabel: 'Souffleur', disabled: false },*/
        { title: 'Cloture', description: 'Termine tes dossiers de la journée en les re synchronisant', buttonLabel: 'Fin de journée', disabled: false }
    ];

    const handleButtonClick = (buttonLabel: string) => {
        if (buttonLabel === 'Synchronisation' && isOnline) {
            onSynchronisationClick();
        } else if (buttonLabel === 'Coach') {
            onCoachClick();
        } else if (buttonLabel === 'Rapport') {
            onRapportClick();
        } else if (buttonLabel === 'Photos' && isOnline) {
            onPhotosClick();
        }
    };

    return (
        <section>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>2. Votre journée</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                {samples.map((sample, index) => (
                    <SampleCard
                        key={index}
                        title={sample.title}
                        description={sample.description}
                        buttonLabel={sample.buttonLabel}
                        onButtonClick={() => handleButtonClick(sample.buttonLabel)}
                        disabled={sample.disabled}
                    />
                ))}
            </div>
        </section>
    );
};

export default SamplesGrid;
