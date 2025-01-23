import React from 'react';
import { Card, CardHeader, Button, makeStyles } from '@fluentui/react-components';

interface SampleCardProps {
    title: string;
    description: string;
    buttonLabel: string;
    onButtonClick: () => void;
}

const useStyles = makeStyles({
    card: {
        width: '250px',
        padding: '15px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '200px',
        borderRadius: '20px',
        transition: 'background-color 0.3s, box-shadow 0.3s',
        '&:hover': {
            backgroundColor: '#3A3F44',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        },
    },
    title: {
        margin: 0,
    },
    description: {
        color: 'white',
        marginBottom: '10px',
        flexGrow: 1,
    },
});

const SampleCard: React.FC<SampleCardProps> = ({ title, description, buttonLabel, onButtonClick }) => {
    const styles = useStyles();

    return (
        <Card className={styles.card}>
            <CardHeader header={<h3 className={styles.title}>{title}</h3>} />
            <p className={styles.description}>{description}</p>
            <Button appearance="primary" onClick={onButtonClick}>{buttonLabel}</Button>
        </Card>
    );
};

export default SampleCard;
