import React from 'react';
import SampleCard from './SampleCard';

interface SamplesGridProps {
    onSynchronisationClick: () => void;
}

const SamplesGrid: React.FC<SamplesGridProps> = ({ onSynchronisationClick }) => {
    const samples = [
        { title: 'Synchronisation', description: 'Démarre ta journée en synchronisant tes données', buttonLabel: 'Synchronisation' },
        { title: 'Coach', description: 'Avant ton rendez-vous, recoit quelques informations sur ton clienbt', buttonLabel: 'Informations' },
        { title: 'Souffleur', description: 'Utilise ton souffleur pour t\'aider pendant ton rendez-vous', buttonLabel: 'Souffleur' },
        { title: 'Cloture', description: 'Termine tes dossiers de la journée en les re synchronisant', buttonLabel: 'Fin de journée' }
    ];

    const handleButtonClick = (buttonLabel: string) => {
        if (buttonLabel === 'Synchronisation') {
            onSynchronisationClick();
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
                    />
                ))}
            </div>
        </section>
    );
};

export default SamplesGrid;
