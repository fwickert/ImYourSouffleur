import React from 'react';
import { Card, CardHeader, Image, makeStyles } from '@fluentui/react-components';

const useStyles = makeStyles({
    section: {
        marginBottom: '30px',
    },
    title: {
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '10px',
    },
    description: {
        color: '#666',
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
    },
    image: {
        width: '100%',
        height: '100px',
        objectFit: 'cover',
        borderRadius: '10px 10px 0 0',
    },
});

const HeroSection: React.FC = () => {
    const classes = useStyles();

    const cards = [
        { title: 'Japanese to English', image: '/path-to-image1.jpg' },
        { title: 'Image Segmentation', image: '/path-to-image2.jpg' },
        { title: 'Video Analysis', image: '/path-to-image3.jpg' },
    ];

    return (
        <section className={classes.section}>
            <h1 className={classes.title}>Souffleur 2.0</h1>
            <p className={classes.description}>Je suis ici pour t'aider dans ta journée et t'apporter les bonnes informations au bon moment</p>
            <div className={classes.cardContainer}>
                {cards.map((card, index) => (
                    <Card key={index} className={classes.card}>
                        <CardHeader header={<h4>{card.title}</h4>} />
                        <Image src={card.image} alt={card.title} className={classes.image} />
                    </Card>
                ))}
            </div>
        </section>
    );
};

export default HeroSection;
