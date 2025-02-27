import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button, Text, Select, makeStyles, Input } from '@fluentui/react-components';
import Webcam from 'react-webcam';
import html2canvas from 'html2canvas';

const useStyles = makeStyles({
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '10px',
        width: '100%',
        justifyItems: 'center',
    },
    webcam: {
        height: '500px',
        position: 'relative',
    },
    photo: {
        width: '600px',
        height: '500px',
    },
    buttonWebCam: {
        width: '15%',
        height: '20%',
        borderRadius: '50%',
        backgroundColor: '#ffffff',
        border: 'none',
        position: 'absolute',
        bottom: '0px',
        left: '10%',
        opacity: 0.5,
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        margin: 0,
    },
    select: {
        marginBottom: '10px',
    },
    description: {
        marginTop: '10px',
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
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '10px',
    },
    input: {
        marginBottom: '10px',
    },
    photoContainer: {
        position: 'relative',
        width: '600px',
        height: '500px',
    },
});

const PhotoUpload: React.FC = () => {
    const classes = useStyles();
    const [photo, setPhoto] = useState<string | null>(null);
    const [description, setDescription] = useState<string>('');
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
    const [penColor, setPenColor] = useState<string>('#000000');
    const [penSize, setPenSize] = useState<number>(2);
    const webcamRef = useRef<Webcam>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const photoContainerRef = useRef<HTMLDivElement>(null);
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

    const capturePhoto = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            setPhoto(imageSrc);
            const canvas = canvasRef.current;
            if (canvas) {
                const context = canvas.getContext('2d');
                if (context) {
                    context.clearRect(0, 0, canvas.width, canvas.height);
                }
            }
        }
    }, [webcamRef]);

    const handleGenerateDescription = () => {
        setDescription('Generated description for the photo.');
    };

    const handleDeviceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedDeviceId(event.target.value);
    };

    const handleSave = async () => {
        if (photoContainerRef.current) {
            const canvas = await html2canvas(photoContainerRef.current);
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = 'photo_with_drawing.png';
            link.click();
        }
    };

    const startDrawing = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        event.preventDefault();
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

    const endDrawing = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        event.preventDefault();
        isDrawing.current = false;
        const context = canvasRef.current?.getContext('2d');
        if (context) {
            context.closePath();
        }
    };

    const draw = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        event.preventDefault();
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
        const canvas = canvasRef.current;
        if (canvas) {
            const context = canvas.getContext('2d');
            if (context) {
                context.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
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
                <div className={classes.webcam}>
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        videoConstraints={{ deviceId: selectedDeviceId }}
                        className={classes.webcam}
                    />
                    <Button onClick={capturePhoto} className={classes.buttonWebCam}></Button>
                </div>
                {photo && (
                    <div className={classes.photoContainer} ref={photoContainerRef}>
                        <img src={photo} alt="Captured" className={classes.photo} />
                        <canvas
                            ref={canvasRef}
                            width="600"
                            height="500"
                            className={classes.canvas}
                            onMouseDown={startDrawing}
                            onMouseUp={endDrawing}
                            onMouseMove={draw}
                            onTouchStart={startDrawing}
                            onTouchEnd={endDrawing}
                            onTouchMove={draw}
                        />
                    </div>
                )}
            </div>
            <Button onClick={handleGenerateDescription}>Generate Description</Button>
            {description && <Text className={classes.description}>{description}</Text>}
            <div className={classes.controls}>
                <input
                    className={classes.input}
                    type="color"
                    value={penColor}
                    onChange={(e) => setPenColor(e.target.value)}
                />
                <Input
                    className={classes.input}
                    type="number"
                    value={String(penSize)}
                    onChange={(e) => setPenSize(Number(e.target.value))}
                    min={1}
                    max={50}
                />
            </div>
            <Button onClick={handleSave}>Save Photo with Drawing</Button>
            {photo && <Button onClick={handleDeletePhoto}>Delete Photo</Button>}
        </div>
    );
};

export default PhotoUpload;
