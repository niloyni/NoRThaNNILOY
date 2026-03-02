export enum Role {
  USER = "user",
  MODEL = "model",
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp: number;
}

export interface LiveSessionState {
  isConnected: boolean;
  isRecording: boolean;
  isThinking: boolean;
  error: string | null;
}
