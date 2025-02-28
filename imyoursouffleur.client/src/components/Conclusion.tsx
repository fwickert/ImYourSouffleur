import React, { useEffect, useState } from 'react';
import { Button, makeStyles, Card, Dialog, DialogTrigger, DialogSurface, DialogTitle, DialogBody, DialogActions, DialogContent } from '@fluentui/react-components';
import { ArrowLeft24Regular } from '@fluentui/react-icons';
import { fetchFilledReport, fetchImageDescription } from '../services/ReportService';
import { Customer } from '../models/Customer';
import { renderMarkdown } from '../utilities/MarkdownRenderer';

const useStyles = makeStyles({
    container: {
        display: 'flex',
        flexDirection: 'column',
        padding: '10px',
        position: 'relative',
    },
    backButton: {
        marginBottom: '20px',
        borderRadius: '50%',
        width: '30px',
        height: '30px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '10px',
        width: '100%',
    },
    customerInfo: {
        marginBottom: '20px',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        backgroundColor: '#fff',
        color: '#000',
    },
    reportContent: {
        width: '50%',
        whiteSpace: 'pre-wrap',
        backgroundColor: '#f9f9f9',
        color: '#000',
        padding: '10px',
        borderRadius: '5px',
        border: '1px solid #ccc',
        marginBottom: '20px',
    },
    cafePhoto: {
        width: '100%',
        height: 'auto',
        borderRadius: '5px',
    },
    card: {
        width: '100%',
        padding: '15px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '200px',
        borderRadius: '20px',
        marginTop: '10px',
        overflow: 'auto',
    },
    description: {
        color: 'white',
        marginBottom: '10px',
        flexGrow: 1,
    },
    saveButton: {
        marginTop: '20px',
        alignSelf: 'center',
    },
});

interface ConclusionProps {
    onBack: () => void;
    connection: any;
    isOnline: boolean;
    selectedCustomer: Customer | null;
}

const Conclusion: React.FC<ConclusionProps> = ({ onBack, connection, isOnline, selectedCustomer }) => {
    const styles = useStyles();
    const [report, setReport] = useState<string>('');
    const [imageDescription, setImageDescription] = useState<string>('');
    const [isDialogVisible, setIsDialogVisible] = useState<boolean>(false);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const reportContent = await fetchFilledReport();
                const imageDescriptionContent = await fetchImageDescription();
                const renderedContent = await renderMarkdown(reportContent);
                const renderedImageDescription = await renderMarkdown(imageDescriptionContent);
                setReport(renderedContent);
                setImageDescription(renderedImageDescription);
            } catch (error) {
                console.error('Error fetching the filled report:', error);
            }
        };

        fetchReport();
    }, []);

    const handleSave = () => {
        // Logic to save the case
        setIsDialogVisible(true);
    };

    const closeDialog = () => {
        setIsDialogVisible(false);
    };

    return (
        <div className={styles.container}>
            <Button icon={<ArrowLeft24Regular />} onClick={onBack} className={styles.backButton} />
            {selectedCustomer && (
                <div className={styles.customerInfo}>
                    <h2>Contexte client</h2>
                    <p>{selectedCustomer.summary}</p>
                </div>
            )}
            {report && (
                <div className={styles.reportContent}>
                    <div dangerouslySetInnerHTML={{ __html: report }} />
                </div>
            )}
            <div className={styles.grid}>
                <img src="/cafe.png" alt="Caf " className={styles.cafePhoto} />
                <Card className={styles.card}>
                    <div className={styles.description} dangerouslySetInnerHTML={{ __html: imageDescription }} />
                </Card>
            </div>
            <Button className={styles.saveButton} onClick={handleSave}>Enregistrer le dossier</Button>
            <Dialog open={isDialogVisible} >
                <DialogSurface>
                    <DialogBody>
                        <DialogTitle>Dossier Enregistr&eacute;</DialogTitle>
                        <DialogContent>
                            Dossier bien enregistr&eacute;.<br/>
                            Un e-mail sera envoy&eacute; au client.
                        </DialogContent>
                        <DialogActions>
                            <Button appearance="primary" onClick={closeDialog}>OK</Button>
                        </DialogActions>
                    </DialogBody>
                </DialogSurface>
            </Dialog>
        </div>
    );
};

export default Conclusion;
