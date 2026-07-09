import { Box, IconButton, Typography } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';

const VoiceTranscriptDisplay = ({ isListening, isSupported, transcript, onStart, onStop }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 2 }}>
        <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isListening && (
                <Box
                    sx={{
                        position: 'absolute',
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        backgroundColor: '#ff3b3b',
                        opacity: 0.4,
                        animation: 'voice-pulse 1.4s ease-out infinite',
                        '@keyframes voice-pulse': {
                            '0%': { transform: 'scale(0.8)', opacity: 0.5 },
                            '100%': { transform: 'scale(1.8)', opacity: 0 },
                        },
                    }}
                />
            )}
            <IconButton
                disabled={!isSupported}
                onClick={isListening ? onStop : onStart}
                sx={{
                    width: 64,
                    height: 64,
                    backgroundColor: isListening ? '#ff3b3b' : '#FF5B93',
                    color: '#171717',
                    '&:hover': { backgroundColor: isListening ? '#ff5c5c' : '#FF7BA8' },
                    '&.Mui-disabled': { backgroundColor: '#2a2a2a', color: '#a0a0a0' },
                }}
                aria-label={isListening ? 'Stop recording' : 'Start recording'}
            >
                {isListening ? <StopIcon /> : <MicIcon />}
            </IconButton>
        </Box>

        <Typography sx={{ color: '#a0a0a0' }}>
            {isListening ? 'Listening... press stop when done' : 'Press the mic and speak naturally'}
        </Typography>

        <Box
            sx={{
                width: '100%',
                minHeight: 60,
                p: 2,
                borderRadius: 2,
                border: '1px solid #2a2a2a',
                backgroundColor: '#171717',
            }}
        >
            <Typography sx={{ color: transcript ? '#ffffff' : '#a0a0a0' }}>
                {transcript || 'Your transcript will appear here...'}
            </Typography>
        </Box>
    </Box>
);

export default VoiceTranscriptDisplay;
