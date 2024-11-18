import React, { useEffect, useRef, useState } from 'react'
import io from "socket.io-client";
import { Badge, IconButton, TextField } from '@mui/material';
import { Button } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import styles from "../styles/videoComponent.module.css";
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import ChatIcon from '@mui/icons-material/Chat';
import server from '../environment';

// ... (keep existing socket and peer connection setup)

export default function VideoMeetComponent() {
    // ... (keep existing state and refs)
    
    // Add new state for tracking fullscreen status
    const [isLocalFullscreen, setIsLocalFullscreen] = useState(false);
    const [fullscreenVideoId, setFullscreenVideoId] = useState(null);
    
    // Function to handle fullscreen for local video
    const toggleLocalFullscreen = () => {
        if (!document.fullscreenElement) {
            if (localVideoref.current.requestFullscreen) {
                localVideoref.current.requestFullscreen();
                setIsLocalFullscreen(true);
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsLocalFullscreen(false);
            }
        }
    };

    // Function to handle fullscreen for remote videos
    const toggleRemoteFullscreen = (videoId) => {
        const videoElement = document.querySelector([data-socket="${videoId}"]);
        if (!document.fullscreenElement) {
            if (videoElement && videoElement.requestFullscreen) {
                videoElement.requestFullscreen();
                setFullscreenVideoId(videoId);
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setFullscreenVideoId(null);
            }
        }
    };

    // Add fullscreen change event listener
    useEffect(() => {
        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                setIsLocalFullscreen(false);
                setFullscreenVideoId(null);
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    // ... (keep existing code until the return statement)

    return (
        <div>
            {askForUsername === true ? (
                <div>
                    <h2>Enter into Lobby </h2>
                    <TextField id="outlined-basic" label="Username" value={username} onChange={e => setUsername(e.target.value)} variant="outlined" />
                    <Button variant="contained" onClick={connect}>Connect</Button>
                    <div className={styles.localVideoContainer}>
                        <video ref={localVideoref} autoPlay muted></video>
                    </div>
                </div>
            ) : (
                <div className={styles.meetVideoContainer}>
                    {/* Chat modal section remains the same */}
                    {showModal ? (
                        // ... existing chat room code
                    ) : null}

                    <div className={styles.buttonContainers}>
                        <IconButton onClick={handleVideo} style={{ color: "white" }}>
                            {(video === true) ? <VideocamIcon /> : <VideocamOffIcon />}
                        </IconButton>
                        <IconButton onClick={handleEndCall} style={{ color: "red" }}>
                            <CallEndIcon />
                        </IconButton>
                        <IconButton onClick={handleAudio} style={{ color: "white" }}>
                            {audio === true ? <MicIcon /> : <MicOffIcon />}
                        </IconButton>
                        
                        {screenAvailable === true ? (
                            <IconButton onClick={handleScreen} style={{ color: "white" }}>
                                {screen === true ? <ScreenShareIcon /> : <StopScreenShareIcon />}
                            </IconButton>
                        ) : null}

                        <Badge badgeContent={newMessages} max={999} color='orange'>
                            <IconButton onClick={() => setModal(!showModal)} style={{ color: "white" }}>
                                <ChatIcon />
                            </IconButton>
                        </Badge>

                        <IconButton onClick={toggleLocalFullscreen} style={{ color: "white" }}>
                            {isLocalFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                        </IconButton>
                    </div>

                    <div className={styles.localVideoContainer}>
                        <video className={styles.meetUserVideo} ref={localVideoref} autoPlay muted></video>
                    </div>

                    <div className={${styles.conferenceView} ${videos.some(v => v.isScreenShare) ? styles.hasScreenShare : ''}}>
                        {videos.map((video) => (
                            <div key={video.socketId} className={styles.remoteVideoContainer}>
                                <video
                                    data-socket={video.socketId}
                                    data-screen-share={video.isScreenShare ? "true" : undefined}
                                    ref={ref => {
                                        if (ref && video.stream) {
                                            ref.srcObject = video.stream;
                                        }
                                    }}
                                    autoPlay
                                />
                                <IconButton 
                                    onClick={() => toggleRemoteFullscreen(video.socketId)}
                                    className={styles.fullscreenButton}
                                    style={{ color: "white" }}
                                >
                                    {fullscreenVideoId === video.socketId ? 
                                        <FullscreenExitIcon /> : 
                                        <FullscreenIcon />
                                    }
                                </IconButton>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
