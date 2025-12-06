import { GoogleGenAI, Modality } from "@google/genai";

// Helper to decode base64 to Uint8Array
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper to decode raw PCM data into an AudioBuffer
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export class AudioEngine {
  private ai: GoogleGenAI;
  private audioContext: AudioContext | null = null;
  private isInitialized = false;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
    }
    return this.audioContext;
  }

  public async init() {
    if (this.isInitialized) return;
    const ctx = this.getContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    this.isInitialized = true;
  }

  public async speak(text: string, type: 'KID' | 'AI') {
    try {
      const ctx = this.getContext();
      if (ctx.state === 'suspended') await ctx.resume();

      // Voice selection:
      // 'Puck' - Good for Miron (Male, energetic/neutral)
      // 'Kore' - Good for AI (Calm, slightly ominous if pitched down)
      const voiceName = type === 'KID' ? 'Puck' : 'Kore';

      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName }
            }
          }
        }
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) return;

      const audioBytes = decode(base64Audio);
      // Gemini TTS model output is raw PCM at 24kHz
      const audioBuffer = await decodeAudioData(audioBytes, ctx, 24000, 1);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      
      const gainNode = ctx.createGain();
      
      if (type === 'AI') {
          // Digital Contagion Effect: Lower pitch significantly, slower, louder
          source.playbackRate.value = 0.85; 
          gainNode.gain.value = 1.3;
          
          // Optional: Create a simple distortion or filter if AudioContext supports it easily (sticking to simple pitch for now)
      } else {
          // Miron: Slightly faster, nervous energy
          source.playbackRate.value = 1.05; 
          gainNode.gain.value = 1.0;
      }

      source.connect(gainNode);
      gainNode.connect(ctx.destination);
      source.start();

    } catch (error) {
      console.error("AI TTS Generation failed:", error);
    }
  }

  public cancel() {
    if (this.audioContext) {
        this.audioContext.close().then(() => {
            this.audioContext = null;
            this.isInitialized = false;
        });
    }
  }
}

export const audioEngine = new AudioEngine();