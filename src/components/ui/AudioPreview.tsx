import React from 'react';
import { AudioConverter } from '../../utils/audioConverter';

interface AudioPreviewProps {
  file: {
    name: string;
    url: string;
    type: string;
    size: number;
    duration?: number;
    formattedSize?: string;
    formattedDuration?: string;
  };
  onRemove: () => void;
  showRemoveButton?: boolean;
}

export function AudioPreview({ file, onRemove, showRemoveButton = true }: AudioPreviewProps) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(file.duration || 0);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      backgroundColor: 'white',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      gap: '12px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
        {/* Ícone de áudio */}
        <span style={{ fontSize: '20px' }}>🎵</span>
        
        {/* Informações do arquivo */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            {file.name}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
            {file.type} • {file.formattedSize || AudioConverter.formatFileSize(file.size)}
            {file.formattedDuration && ` • ${file.formattedDuration}`}
          </div>
          
          {/* Player de áudio */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={togglePlayPause}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '16px',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                backgroundColor: '#f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px'
              }}
            >
              {isPlaying ? '⏸️' : '▶️'}
            </button>
            
            {/* Barra de progresso */}
            <div style={{ flex: 1, position: 'relative' }}>
              <div
                onClick={handleSeek}
                style={{
                  height: '4px',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                <div
                  style={{
                    height: '100%',
                    backgroundColor: '#3b82f6',
                    borderRadius: '2px',
                    width: `${progress}%`,
                    transition: 'width 0.1s ease'
                  }}
                />
              </div>
            </div>
            
            {/* Tempo */}
            <div style={{ fontSize: '12px', color: '#6b7280', minWidth: '80px' }}>
              {AudioConverter.formatDuration(currentTime)} / {AudioConverter.formatDuration(duration)}
            </div>
          </div>
        </div>
      </div>

      {/* Botão de remover */}
      {showRemoveButton && (
        <button
          type="button"
          onClick={onRemove}
          style={{
            background: 'none',
            border: 'none',
            color: '#ef4444',
            cursor: 'pointer',
            fontSize: '16px',
            padding: '4px',
            borderRadius: '4px'
          }}
          title="Remover áudio"
        >
          🗑️
        </button>
      )}

      {/* Elemento de áudio oculto */}
      <audio
        ref={audioRef}
        src={file.url}
        preload="metadata"
        style={{ display: 'none' }}
      />
    </div>
  );
}