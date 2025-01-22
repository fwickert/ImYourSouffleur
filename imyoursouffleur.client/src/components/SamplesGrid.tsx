import React from 'react';
import SampleCard from './SampleCard';

const SamplesGrid: React.FC = () => {
    const samples = [
        { title: 'Content Moderation', description: 'Prompt a local language model with safety checks in place.' },
        { title: 'Chat', description: 'Chat with local language model.' },
        { title: 'Generate Text', description: 'Generate text with local language model.' },
        { title: 'Transcribe Audio or Video', description: 'Simple audio transcription with Whisper.' },
        { title: 'Translate Audio or Video', description: 'Simple audio translation to text with Whisper.' },
    ];

    return (
        <section>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>Get started with these samples</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                {samples.map((sample, index) => (
                    <SampleCard key={index} title={sample.title} description={sample.description} />
                ))}
            </div>
        </section>
    );
};

export default SamplesGrid;  