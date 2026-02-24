'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

type Track = {
  id: string;
  name: string;
  url: string;
};

export default function WinampPage() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const contextRef = useRef<AudioContext | null>(null);

  const [tracks, setTracks] = useState<Track[]>([]);
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [snapshot, setSnapshot] = useState<string | null>(null);

  const activeTrack = useMemo(
    () => tracks.find((track) => track.id === activeTrackId) ?? null,
    [activeTrackId, tracks],
  );

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      tracks.forEach((track) => URL.revokeObjectURL(track.url));

      if (contextRef.current) {
        contextRef.current.close();
      }
    };
  }, [tracks]);

  const setupVisualizer = () => {
    const audio = audioRef.current;
    const canvas = canvasRef.current;

    if (!audio || !canvas) {
      return;
    }

    if (!contextRef.current) {
      contextRef.current = new AudioContext();
    }

    if (!analyserRef.current) {
      analyserRef.current = contextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
    }

    if (!sourceRef.current) {
      sourceRef.current = contextRef.current.createMediaElementSource(audio);
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(contextRef.current.destination);
    }

    const analyser = analyserRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return;
    }

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = '#0f1022';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#00f6ff');
      gradient.addColorStop(0.5, '#ff00a8');
      gradient.addColorStop(1, '#ffe600');

      const barWidth = (canvas.width / bufferLength) * 1.8;
      let x = 0;

      for (let i = 0; i < bufferLength; i += 1) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    draw();

    setTimeout(() => {
      try {
        setSnapshot(canvas.toDataURL('image/png'));
      } catch {
        setSnapshot(null);
      }
    }, 700);
  };

  const onUploadFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []).filter((file) => file.type === 'audio/mpeg');

    if (!selectedFiles.length) {
      return;
    }

    const uploadedTracks = selectedFiles.map((file) => ({
      id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`,
      name: file.name,
      url: URL.createObjectURL(file),
    }));

    setTracks((previous) => [...previous, ...uploadedTracks]);

    if (!activeTrackId) {
      setActiveTrackId(uploadedTracks[0].id);
    }

    event.target.value = '';
  };

  const handlePlayPause = async () => {
    const audio = audioRef.current;

    if (!audio || !activeTrack) {
      return;
    }

    if (audio.paused) {
      await audio.play();
      setIsPlaying(true);
      setupVisualizer();
      return;
    }

    audio.pause();
    setIsPlaying(false);
  };

  const handleTrackSelect = (track: Track) => {
    setActiveTrackId(track.id);
    setSnapshot(null);
    setIsPlaying(false);
  };

  return (
    <main className="space-y-6 pb-10">
      <Link href="/" className="inline-block text-sm text-accent hover:underline">
        ← Back to MurMur
      </Link>

      <section className="card space-y-6">
        <header>
          <p className="text-xs uppercase tracking-[0.24em] text-accent">MP3 PLAYER</p>
          <h1 className="mt-2 text-3xl font-semibold">Mini Winamp-Style Visual MP3 Player</h1>
          <p className="mt-2 text-sm text-ink">Upload MP3 files, build a playlist, and watch a live generated visual while the song plays.</p>
        </header>

        <div className="rounded-xl border border-white/20 bg-night/40 p-4">
          <label htmlFor="file-upload" className="mb-2 block text-sm font-medium">
            Upload MP3 files
          </label>
          <input
            id="file-upload"
            type="file"
            accept="audio/mpeg,.mp3"
            multiple
            onChange={onUploadFiles}
            className="block w-full rounded-lg border border-white/20 bg-night/60 p-2 text-sm"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-xl border border-white/20 bg-night/40 p-4">
            <p className="mb-3 text-sm font-semibold">Playlist</p>
            {tracks.length === 0 ? (
              <p className="text-sm text-ink">No MP3 files yet. Upload one to begin.</p>
            ) : (
              <ul className="space-y-2">
                {tracks.map((track) => (
                  <li key={track.id}>
                    <button
                      type="button"
                      onClick={() => handleTrackSelect(track)}
                      className={`w-full rounded-lg border p-2 text-left text-sm transition ${
                        track.id === activeTrackId
                          ? 'border-accent bg-accent/10 text-white'
                          : 'border-white/10 bg-night/30 text-ink hover:border-white/30'
                      }`}
                    >
                      {track.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-4 rounded-xl border border-white/20 bg-night/40 p-4">
            <p className="text-sm text-ink">Current track</p>
            <p className="text-base font-semibold text-white">{activeTrack?.name ?? 'No track selected'}</p>

            <audio
              key={activeTrack?.id ?? 'no-track'}
              ref={audioRef}
              src={activeTrack?.url}
              onPlay={() => {
                setIsPlaying(true);
                setupVisualizer();
              }}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              controls
              className="w-full"
            />

            <button
              type="button"
              onClick={handlePlayPause}
              disabled={!activeTrack}
              className="w-full rounded-full bg-accent px-4 py-2 text-sm font-semibold text-night disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-white/20 bg-night/40 p-4">
          <p className="text-sm font-semibold">Live generated visual</p>
          <canvas ref={canvasRef} width={900} height={260} className="h-[220px] w-full rounded-lg border border-white/10 bg-[#0f1022]" />
          {snapshot ? (
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.2em] text-accent">Generated picture snapshot</p>
              <Image src={snapshot} alt="Live generated music visual snapshot" width={900} height={260} unoptimized className="rounded-lg border border-white/10" />
            </div>
          ) : (
            <p className="text-xs text-ink">Start a song to auto-generate a picture from the live visualizer.</p>
          )}
        </div>
      </section>
    </main>
  );
}
