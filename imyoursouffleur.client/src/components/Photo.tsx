import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useId, Button, Select, makeStyles, Slider, Label, Spinner, Card } from '@fluentui/react-components';
import Webcam from 'react-webcam';
import html2canvas from 'html2canvas';
import { HubConnection } from '@microsoft/signalr';
import { Customer } from '../models/Customer';
import {
    ArrowLeft24Regular,
    CameraFilled,
    ImageAddRegular
} from '@fluentui/react-icons';
import ImageService from '../services/ImageService'; // Import ImageService
import { renderMarkdown } from '../utilities/MarkdownRenderer';

const useStyles = makeStyles({
    backButton: {
        marginTop: '10px',
        borderRadius: '50%', // Make the button circular
        width: '30px', // Set a fixed width
        height: '30px', // Set a fixed height
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    container: {
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '10px',
        width: '100%',

    },
    webcam: {
        width: '900px',
        height: '600px',
        position: 'relative',
        objectFit: 'cover',
    },
    photo: {
        width: '900px',
        height: '600px',
        objectFit: 'cover',
    },
    buttonWebCam: {
        width: '40px',
        height: '90px',
        borderRadius: '50%',
        backgroundColor: '#ffffff',
        border: 'none',
        position: 'absolute',
        bottom: '8px',
        left: '9%',
        opacity: 0.5,
        transform: 'translateX(-50%)',
    },
    select: {
        marginBottom: '10px',
    },

    canvas: {
        border: 'none',
        position: 'absolute',
        top: 0,
        left: 0,
        backgroundColor: 'transparent',
    },
    controls: {
        display: 'flex',
        width: '100%',
        flexDirection: 'column',
        alignItems: 'left',
        marginBottom: '10px',
    },
    input: {
        display: 'none', // Hide the input file element
    },
    photoContainer: {
        position: 'relative',
        width: '900px',
        height: '600px',

    },
    card: {
        width: '100%',
        padding: '15px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '300px',
        borderRadius: '20px',
        marginTop: '10px',
        overflow: 'auto',
        minHeight: '500px',
    },
    description: {
        color: 'white',
        marginBottom: '10px',
        flexGrow: 1,
    },
    spinner: {
        marginTop: '10px',
    },
    cambutton: {
        marginTop: '10px',
    }
});

interface PhotoProps {
    onBack: () => void;
    connection: HubConnection | null;
    isOnline: boolean;
    selectedCustomer: Customer | null;
    setSelectedCustomer: (customer: Customer | null) => void;
}

const Photo: React.FC<PhotoProps> = ({ onBack, connection, isOnline }) => {
    const id = useId();
    const classes = useStyles();
    const [photo, setPhoto] = useState<string | null>(null);
    const [description, setDescription] = useState<string>('');
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
    const [penColor, setPenColor] = useState<string>('#000000');
    const [penSize, setPenSize] = useState(2);
    const [showWebcam, setShowWebcam] = useState(true);
    const [loading, setLoading] = useState(false); // Add loading state
    const webcamRef = useRef<Webcam>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const photoContainerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null); // Add ref for file input
    const isDrawing = useRef<boolean>(false);

    useEffect(() => {
        const getDevices = async () => {
            const deviceInfos = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = deviceInfos.filter(device => device.kind === 'videoinput');
            setDevices(videoDevices);
            if (videoDevices.length > 0) {
                setSelectedDeviceId(videoDevices[0].deviceId);
            }
        };
        getDevices();
    }, []);

    useEffect(() => {
        if (connection) {
            setupConnectionHandlers(connection);
        }
    }, [connection]);

    const setupConnectionHandlers = async (connection: HubConnection) => {
        connection.on('InProgressMessageUpdate', async (newDescription: string) => {
            setLoading(false);
            const renderedDescription = await renderMarkdown(newDescription);
            setDescription(renderedDescription);
        });
    };

    const capturePhoto = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            setPhoto(imageSrc);
            setShowWebcam(false);
            const canvas = canvasRef.current;
            if (canvas) {
                const context = canvas.getContext('2d');
                if (context) {
                    context.clearRect(0, 0, canvas.width, canvas.height);
                }
            }
        }
    }, [webcamRef]);

    const handleDeviceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedDeviceId(event.target.value);
    };

    const handleSave = async () => {
        if (photoContainerRef.current) {
            setLoading(true); // Set loading to true
            const canvas = await html2canvas(photoContainerRef.current);
            const dataUrl = canvas.toDataURL('image/png');
            const blob = await (await fetch(dataUrl)).blob();
            const file = new File([blob], 'photo_with_drawing.png', { type: 'image/png' });

            const imageService = new ImageService();
            const endpoint = isOnline ? "Cloud4o" : "Localphi3";
            const connectionId = connection?.connectionId || '';

            try {
                await imageService.getDescriptionFromImage(file, endpoint, connectionId);
                //setDescription(description);
            } catch (error) {
                console.error('Error uploading image:', error);
            } finally {

            }
        }
    };

    const startDrawing = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        isDrawing.current = true;
        const canvas = canvasRef.current;
        if (canvas) {
            const context = canvas.getContext('2d');
            if (context) {
                const rect = canvas.getBoundingClientRect();
                const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
                const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
                context.beginPath();
                context.moveTo(clientX - rect.left, clientY - rect.top);
            }
        }
    };

    const endDrawing = (_: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        isDrawing.current = false;
        const context = canvasRef.current?.getContext('2d');
        if (context) {
            context.closePath();
        }
    };

    const draw = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing.current) return;
        const canvas = canvasRef.current;
        if (canvas) {
            const context = canvas.getContext('2d');
            if (context) {
                context.lineWidth = penSize;
                context.lineCap = 'round';
                context.strokeStyle = penColor;

                const rect = canvas.getBoundingClientRect();
                const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
                const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

                context.lineTo(clientX - rect.left, clientY - rect.top);
                context.stroke();
                context.beginPath();
                context.moveTo(clientX - rect.left, clientY - rect.top);
            }
        }
    };

    const handleDeletePhoto = () => {
        setPhoto(null);
        setDescription('');
        setShowWebcam(true);
        const canvas = canvasRef.current;
        if (canvas) {
            const context = canvas.getContext('2d');
            if (context) {
                context.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    };

    const handleReshowWebcam = () => {
        setShowWebcam(true);
        handleDeletePhoto();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhoto(reader.result as string);
                setShowWebcam(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            const context = canvas.getContext('2d');
            if (context) {
                context.fillStyle = '#fff';
                context.fillRect(0, 0, canvas.width, canvas.height);
            }
        }

        const handleTouchMove = (event: TouchEvent) => {
            event.preventDefault();
        };

        document.body.addEventListener('touchmove', handleTouchMove, { passive: false });

        return () => {
            document.body.removeEventListener('touchmove', handleTouchMove);
        };
    }, []);

    return (
        <>
            <Button
                icon={<ArrowLeft24Regular />}
                onClick={onBack}
                className={classes.backButton}
            />

            <div className={classes.container}>
                <Select
                    className={classes.select}
                    onChange={handleDeviceChange}
                    value={selectedDeviceId}
                >
                    {devices.map(device => (
                        <option key={device.deviceId} value={device.deviceId}>
                            {device.label || `Camera ${device.deviceId}`}
                        </option>
                    ))}
                </Select>
                <div className={classes.grid}>
                    <div>
                        {showWebcam && (
                            <div className={classes.webcam}>
                                <Webcam
                                    audio={false}
                                    ref={webcamRef}
                                    screenshotFormat="image/jpeg"
                                    videoConstraints={{ deviceId: selectedDeviceId }}
                                    className={classes.webcam}
                                />
                                <Button onClick={capturePhoto} className={classes.buttonWebCam}></Button>
                                <Button icon={<ImageAddRegular />} onClick={triggerFileInput}></Button>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    ref={fileInputRef}
                                    className={classes.input}
                                />
                            </div>
                        )}
                        {photo && (
                            <>
                                <div className={classes.photoContainer} ref={photoContainerRef}>
                                    <img src={photo} alt="Captured" className={classes.photo} />
                                    <canvas
                                        ref={canvasRef}
                                        width="900"
                                        height="600"
                                        className={classes.canvas}
                                        onMouseDown={startDrawing}
                                        onMouseUp={endDrawing}
                                        onMouseMove={draw}
                                        onTouchStart={startDrawing}
                                        onTouchEnd={endDrawing}
                                        onTouchMove={draw}
                                    />
                                </div>                                
                            </>
                        )}
                        {!showWebcam && <Button className={classes.cambutton} icon={<CameraFilled />} onClick={handleReshowWebcam}></Button>}
                    </div>

                    <div>
                        {photo &&
                            <div className={classes.controls}>
                                <Label>
                                    Couleur
                                </Label>
                                <input
                                    
                                    type="color"
                                    value={penColor}
                                    onChange={(e) => setPenColor(e.target.value)}
                                ></input>
                                <Label htmlFor={id}>
                                    Taille: {penSize}
                                </Label>
                                <Slider
                                    id={id}
                                    
                                    value={penSize}
                                    onChange={(_, data) => setPenSize(data.value)}
                                    min={1}
                                    max={10}
                                    step={1}
                                />
                                <Button onClick={handleSave} disabled={!isOnline} >Interprete l'image </Button>
                                {loading && <Spinner className={classes.spinner} label="Interpretation en cours..." />}
                                {description &&
                                    <>
                                        <Card className={classes.card}>
                                            <p className={classes.description} dangerouslySetInnerHTML={{ __html: description }}></p>
                                        </Card>
                                    </>
                                }

                            </div>
                        }
                    </div>
                </div>

            </div>
        </>
    );
};

export default Photo;
