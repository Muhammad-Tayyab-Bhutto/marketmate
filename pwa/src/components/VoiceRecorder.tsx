import { useState, useRef, useEffect } from "react";
import { blobToVoiceData } from "../lib/indexeddb";
import type { VoiceData } from "../lib/chromeBuiltInAi";

interface VoiceRecorderProps {
  voiceNote?: VoiceData;
  onVoiceNoteChange: (voiceNote?: VoiceData) => void;
  maxDuration?: number; // in seconds
}

export function VoiceRecorder({
  voiceNote,
  onVoiceNoteChange,
  maxDuration = 20,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isSupported, setIsSupported] = useState(true);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check if MediaRecorder is supported
    if (typeof MediaRecorder === "undefined") {
      setIsSupported(false);
    }
  }, []);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= maxDuration) {
            stopRecording();
            return maxDuration;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording, maxDuration]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/mp4",
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, {
          type: mediaRecorder.mimeType,
        });
        const voiceData = await blobToVoiceData(blob);
        onVoiceNoteChange(voiceData);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setRecordingTime(0);
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Failed to start recording. Please check microphone permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const audioFile = files[0];
    if (!audioFile.type.startsWith("audio/")) {
      alert("Please select an audio file");
      return;
    }

    try {
      const blob = new Blob([audioFile], { type: audioFile.type });
      const voiceData = await blobToVoiceData(blob);
      onVoiceNoteChange(voiceData);
    } catch (error) {
      console.error("Error processing audio file:", error);
      alert("Failed to process audio file");
    }
  };

  const deleteVoiceNote = () => {
    onVoiceNoteChange(undefined);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isSupported) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-500">
          Voice recording not supported in this browser. Please upload an audio
          file instead.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="mt-2"
        />
      </div>
    );
  }

  return (
    <div className="w-full">
      {!voiceNote ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <div className="flex flex-col items-center gap-4">
            {!isRecording ? (
              <>
                <button
                  type="button"
                  onClick={startRecording}
                  className="flex items-center justify-center w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  aria-label="Start recording"
                >
                  <svg
                    className="w-8 h-8"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                  </svg>
                </button>
                <p className="text-sm text-gray-600">
                  Click to record (max {maxDuration}s)
                </p>
                <div className="text-xs text-gray-500">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-primary-600 hover:text-primary-700 underline"
                  >
                    or upload audio file
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-lg font-mono">
                    {formatTime(recordingTime)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={stopRecording}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                >
                  Stop Recording
                </button>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
        </div>
      ) : (
        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg
                className="w-8 h-8 text-primary-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5V5c0-1.11.89-2 2-2h4zM19 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Voice note recorded
                </p>
                <p className="text-xs text-gray-500">
                  {voiceNote.mimeType} •{" "}
                  {voiceNote.transcript || "No transcript available"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={deleteVoiceNote}
              className="text-red-500 hover:text-red-700 p-2"
              aria-label="Delete voice note"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
          {voiceNote.data && (
            <audio controls className="mt-3 w-full" src={voiceNote.data}>
              Your browser does not support the audio element.
            </audio>
          )}
        </div>
      )}
    </div>
  );
}
