import React, { useState } from 'react';
import { Card, CardFooter, Image, makeStyles, mergeClasses } from '@fluentui/react-components';
import { Persona } from '../models/Persona';

const useStyles = makeStyles({
    section: {
        marginBottom: '20px',
    },
    title: {
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '10px',
    },
    description: {
        color: 'white',
        marginBottom: '20px',
    },
    cardContainer: {
        display: 'flex',
        gap: '10px',
    },
    card: {
        width: '300px',
        overflow: 'hidden',
        borderRadius: '10px',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease, z-index 0.3s ease',
        zIndex: 1,
        cursor: 'pointer',
        '&:hover': {
            transform: 'scale(1.15)',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            zIndex: 10,
        },
    },
    selectedCard: {
        transform: 'scale(1.05)',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        zIndex: 10,
        border: '2px solid white',
    },
    image: {
        width: '100%',
        height: '150px',
        objectFit: 'cover',
        borderRadius: '10px 10px 0 0',
    },
    footer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '5px',
        fontSize: '14px',
    },
});

interface HeroSectionProps {
    onPersonaSelect: (index: number) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onPersonaSelect }) => {
    const classes = useStyles();
    const [selectedCard, setSelectedCard] = useState<number | null>(null);

    const cards: Persona[] = [
        { name: 'Vendeurs', prompt: 'Démarre ta journée en synchronisant tes données de vente.', image: '/sales.jpeg' },
        { name: 'Maintenance', prompt: 'Démarre ta journée en synchronisant tes données de maintenance.', image: '/fieldservice.jpeg' },
        { name: 'Beauty Advisor', prompt: 'Démarre ta journée en synchronisant tes données de beauté.', image: '/retail.jpeg' },
        { name: 'Finance', prompt: 'Démarre ta journée en synchronisant tes données financières.', image: '/finance.jpeg' },
    ];

    const handleCardClick = (index: number) => {
        setSelectedCard(index);
        onPersonaSelect(index);
    };

    return (
        <section className={classes.section}>
            <h1 className={classes.title}>Souffleur 2.0</h1>
            <p className={classes.description}>Je suis ici pour t'aider dans ta journée et t'apporter les bonnes informations au bon moment</p>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>1. Choisissez votre Persona</h2>
            <div className={classes.cardContainer}>
                {cards.map((card, index) => (
                    <Card
                        key={index}
                        className={mergeClasses(classes.card, selectedCard === index && classes.selectedCard)}
                        onClick={() => handleCardClick(index)}
                    >
                        <Image src={card.image} alt={card.name} className={classes.image} />
                        <CardFooter className={classes.footer}>
                            <h4>{card.name}</h4>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </section>
    );
};

export default HeroSection;
