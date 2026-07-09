import { useState } from 'react';
import { Alert, Box, Dialog, DialogContent, DialogTitle, IconButton, Snackbar } from '@mui/material';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { parseVoiceWorkout, addActivity } from '../../services/api';
import { evaluateVoiceParse, buildPayloadFromResolved, toSessionContext } from '../../utils/workoutVoiceParser';
import VoiceTranscriptDisplay from './VoiceTranscriptDisplay';
import VoiceParsePreviewCard from './VoiceParsePreviewCard';

const pad = (n) => String(n).padStart(2, '0');
const currentTimeOfDay = () => {
    const now = new Date();
    return `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
};

const VoiceLogDialog = ({ open, onClose, defaultDate, onActivityAdded }) => {
    const speech = useSpeechRecognition();
    const [sessionContext, setSessionContext] = useState(null);
    const [parseResult, setParseResult] = useState(null);
    const [parsing, setParsing] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const saveActivity = async (payload) => {
        await addActivity({ ...payload, startTime: `${defaultDate}T${currentTimeOfDay()}` });
        onActivityAdded();
    };

    const handleStop = async () => {
        speech.stop();
        const transcript = speech.transcript;
        if (!transcript) return;

        setParsing(true);
        setApiError(null);
        setParseResult(null);
        try {
            const response = await parseVoiceWorkout(transcript, sessionContext);
            const evaluation = evaluateVoiceParse(response.data);

            if (evaluation.error) {
                setApiError('Could not understand that. Please try again.');
                return;
            }

            if (!evaluation.needsConfirmation) {
                await saveActivity(evaluation.payload);
                setSessionContext(toSessionContext(evaluation.resolved));
                setSuccessMessage(
                    `Logged: ${evaluation.resolved.exercise} - ${evaluation.resolved.sets} x ${evaluation.resolved.reps}${evaluation.resolved.weight ? ` @ ${evaluation.resolved.weight}${evaluation.resolved.unit}` : ''}`
                );
                speech.reset();
            } else {
                setParseResult(evaluation.resolved);
            }
        } catch (error) {
            console.error('Error parsing voice workout:', error);
            setApiError('Something went wrong while parsing your workout. Please try again.');
        } finally {
            setParsing(false);
        }
    };

    const handleConfirm = async (editedResolved) => {
        setConfirming(true);
        try {
            const payload = buildPayloadFromResolved(editedResolved);
            await saveActivity(payload);
            setSessionContext(toSessionContext(editedResolved));
            setSuccessMessage(
                `Logged: ${editedResolved.exercise} - ${editedResolved.sets} x ${editedResolved.reps}${editedResolved.weight ? ` @ ${editedResolved.weight}${editedResolved.unit}` : ''}`
            );
            setParseResult(null);
            speech.reset();
        } catch (error) {
            console.error('Error saving voice-logged activity:', error);
            setApiError('Failed to save the activity. Please try again.');
        } finally {
            setConfirming(false);
        }
    };

    const handleCancelPreview = () => {
        setParseResult(null);
        speech.reset();
    };

    const handleClose = () => {
        speech.stop();
        speech.reset();
        setSessionContext(null);
        setParseResult(null);
        setApiError(null);
        onClose();
    };

    return (
        <>
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
                <DialogTitle sx={{ fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Log Workout by Voice
                    <IconButton size="small" onClick={handleClose} aria-label="Close" sx={{ color: '#a0a0a0' }}>
                        &times;
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {(speech.error || apiError) && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {speech.error || apiError}
                        </Alert>
                    )}

                    {!speech.isSupported ? (
                        <Alert severity="warning">
                            Voice logging isn't supported in this browser. Try Chrome or Edge.
                        </Alert>
                    ) : (
                        <VoiceTranscriptDisplay
                            isListening={speech.isListening}
                            isSupported={speech.isSupported}
                            transcript={speech.transcript}
                            onStart={speech.start}
                            onStop={handleStop}
                        />
                    )}

                    {parsing && (
                        <Box sx={{ color: '#a0a0a0', textAlign: 'center', py: 1 }}>Parsing your workout...</Box>
                    )}

                    {parseResult && (
                        <VoiceParsePreviewCard
                            initialResolved={parseResult}
                            onConfirm={handleConfirm}
                            onCancel={handleCancelPreview}
                            confirming={confirming}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <Snackbar
                open={Boolean(successMessage)}
                autoHideDuration={4000}
                onClose={() => setSuccessMessage(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity="success" onClose={() => setSuccessMessage(null)} sx={{ width: '100%' }}>
                    {successMessage}
                </Alert>
            </Snackbar>
        </>
    );
};

export default VoiceLogDialog;
