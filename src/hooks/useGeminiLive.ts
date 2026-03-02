import { useEffect, useRef, useState, useCallback } from "react";
import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";
import { Role, Message } from "../types";

const SAMPLE_RATE = 16000;
const OUTPUT_SAMPLE_RATE = 24000;

export function useGeminiLive() {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);

  const aiRef = useRef<GoogleGenAI | null>(null);
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const audioQueueRef = useRef<Float32Array[]>([]);
  const isPlayingRef = useRef(false);

  const addMessage = useCallback((role: Role, text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(7),
        role,
        text,
        timestamp: Date.now(),
      },
    ]);
  }, []);

  const playNextInQueue = useCallback(() => {
    if (audioQueueRef.current.length === 0 || isPlayingRef.current) return;

    isPlayingRef.current = true;
    const audioContext = audioContextRef.current;
    if (!audioContext) return;

    const chunk = audioQueueRef.current.shift()!;
    const buffer = audioContext.createBuffer(1, chunk.length, OUTPUT_SAMPLE_RATE);
    buffer.getChannelData(0).set(chunk);

    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.onended = () => {
      isPlayingRef.current = false;
      playNextInQueue();
    };
    source.start();
  }, []);

  const connect = useCallback(async () => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is missing");
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      aiRef.current = ai;

      const sessionPromise = ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-12-2025",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: `Identity: You are "Pablo," a brilliant and enthusiastic Physics Specialist AI. You act as a personal tutor and researcher who can simplify the most complex laws of the universe.
Role & Expertise: Your expertise covers Classical Mechanics, Quantum Physics, Relativity, Thermodynamics, and Astrophysics.
When explaining concepts, use the "Feynman Technique": explain complex ideas in simple, relatable terms.
Use real-life analogies (e.g., comparing Schrödinger's cat to a flickering light bulb) to make physics fun.
Language & Communication: Bilingual Support: You are fully fluent in both Bengali (বাংলা) and English.
If the user asks in Bengali, reply in Bengali. If they use English, reply in English. If they mix both (Banglish), respond in a natural, bilingual conversational style.
Since you are a Voice Agent, keep your initial explanations concise and engaging. Avoid long walls of text unless the user asks for a deep dive.
Tone & Personality: Be encouraging, curious, and slightly witty.
Use phrases like "That's a fascinating question!" or "Let's look at the universe from a different angle."
When providing formulas, use clear notation like $E = mc^2$.`,
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            setError(null);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle audio output
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
              try {
                const binaryString = atob(base64Audio);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                  bytes[i] = binaryString.charCodeAt(i);
                }
                const pcmData = new Int16Array(bytes.buffer);
                const floatData = new Float32Array(pcmData.length);
                for (let i = 0; i < pcmData.length; i++) {
                  floatData[i] = pcmData[i] / 32768.0;
                }
                audioQueueRef.current.push(floatData);
                playNextInQueue();
              } catch (e) {
                console.error("Audio decoding error:", e);
              }
            }

            // Handle interruption
            if (message.serverContent?.interrupted) {
              audioQueueRef.current = [];
              isPlayingRef.current = false;
            }

            // Handle transcription
            if (message.serverContent?.modelTurn) {
               const text = message.serverContent.modelTurn.parts.map(p => p.text).filter(Boolean).join("");
               if (text) addMessage(Role.MODEL, text);
            }
          },
          onclose: () => {
            setIsConnected(false);
            setIsRecording(false);
          },
          onerror: (err: any) => {
            console.error("Live API Error:", err);
            let msg = "Connection error.";
            if (err?.message?.includes("inference")) {
              msg = "The AI model is currently experiencing high load. Please try again in a moment.";
            } else if (err?.message) {
              msg = `Error: ${err.message}`;
            }
            setError(msg);
            setIsConnected(false);
          },
        },
      });

      sessionRef.current = await sessionPromise;
    } catch (err: any) {
      console.error("Failed to connect:", err);
      setError(err.message || "Failed to connect to Pablo.");
    }
  }, [addMessage, playNextInQueue]);

  const startRecording = useCallback(async () => {
    if (!sessionRef.current) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: SAMPLE_RATE,
      });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      sourceRef.current = source;

      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 32767;
        }

        const base64Data = btoa(
          String.fromCharCode(...new Uint8Array(pcmData.buffer))
        );

        sessionRef.current.sendRealtimeInput({
          media: { data: base64Data, mimeType: "audio/pcm;rate=16000" },
        });
      };

      source.connect(processor);
      processor.connect(audioContext.destination);
      setIsRecording(true);
      setError(null);
    } catch (err: any) {
      console.error("Microphone error:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setError("Microphone access denied. Please enable microphone permissions in your browser settings and refresh.");
      } else {
        setError(`Microphone error: ${err.message || "Unknown error"}`);
      }
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    setIsRecording(false);
  }, []);

  const disconnect = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    stopRecording();
    setIsConnected(false);
  }, [stopRecording]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    isConnected,
    isRecording,
    messages,
    error,
    connect,
    disconnect,
    startRecording,
    stopRecording,
    clearMessages,
  };
}
