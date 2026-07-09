import { useRef, useState, useCallback, useEffect } from 'react';

const getSpeechRecognitionCtor = () =>
    window.SpeechRecognition || window.webkitSpeechRecognition || null;

// Wraps the browser Web Speech API (SpeechRecognition / webkitSpeechRecognition)
// with continuous, interim-results recognition and live transcript state.
export const useSpeechRecognition = () => {
    const [isSupported] = useState(() => getSpeechRecognitionCtor() !== null);
    const [isListening, setIsListening] = useState(false);
    const [interimTranscript, setInterimTranscript] = useState('');
    const [finalTranscript, setFinalTranscript] = useState('');
    const [error, setError] = useState(null);
    const recognitionRef = useRef(null);

    const start = useCallback(() => {
        const Ctor = getSpeechRecognitionCtor();
        if (!Ctor) {
            setError('Speech recognition is not supported in this browser.');
            return;
        }
        setError(null);
        setInterimTranscript('');
        setFinalTranscript('');

        const recognition = new Ctor();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            let interim = '';
            let final = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcriptPiece = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    final += transcriptPiece + ' ';
                } else {
                    interim += transcriptPiece;
                }
            }
            if (final) setFinalTranscript((prev) => prev + final);
            setInterimTranscript(interim);
        };

        recognition.onerror = (event) => {
            setError(event.error === 'not-allowed'
                ? 'Microphone permission denied.'
                : `Speech recognition error: ${event.error}`);
            setIsListening(false);
        };

        recognition.onend = () => setIsListening(false);

        recognitionRef.current = recognition;
        recognition.start();
        setIsListening(true);
    }, []);

    const stop = useCallback(() => {
        recognitionRef.current?.stop();
        setIsListening(false);
    }, []);

    const reset = useCallback(() => {
        setInterimTranscript('');
        setFinalTranscript('');
        setError(null);
    }, []);

    useEffect(() => () => { recognitionRef.current?.stop(); }, []);

    return {
        isSupported,
        isListening,
        interimTranscript,
        finalTranscript,
        transcript: (finalTranscript + interimTranscript).trim(),
        error,
        start,
        stop,
        reset,
    };
};
