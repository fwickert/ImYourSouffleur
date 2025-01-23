import React from 'react';
import { Persona } from '../models/Persona';
import { Button, makeStyles, Card, Image } from '@fluentui/react-components';
import { ArrowLeft24Regular } from '@fluentui/react-icons';

interface SynchronisationProps {
    persona: Persona;
    onBack: () => void;
}

const useStyles = makeStyles({
    container: {
        padding: '20px',
        position: 'relative',
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
    personaCard: {
        position: 'absolute',
        top: '20px',
        right: '20px',
        width: '150px', // Set a small width
        height: '100px', // Set a small height
        borderRadius: '10px',
        overflow: 'hidden',
    },
    personaImage: {
        width: '100%',
        height: '70px', // Adjust height for the image
        objectFit: 'cover',
    }    
});

const Synchronisation: React.FC<SynchronisationProps> = ({ persona, onBack }) => {
    const classes = useStyles();

    return (
        <div className={classes.container}>
            <Button
                icon={<ArrowLeft24Regular />}
                onClick={onBack}
                className={classes.backButton}
            />
            <Card className={classes.personaCard}>
                <Image src={persona.image} alt={persona.name} className={classes.personaImage} />                
            </Card>
            <h1>Synchronisation Screen</h1>
            <p>This is the new screen displayed when the user clicks on "Synchronisation".</p>
            <p>Selected Persona: {persona.name}</p>
            <p>Prompt: {persona.prompt}</p>
        </div>
    );
};

export default Synchronisation;
