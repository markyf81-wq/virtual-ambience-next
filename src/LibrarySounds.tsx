import { useEffect, useRef, useState } from 'react';
import { Play, Plus, Square } from 'lucide-react';
import type { Sound } from './data';
import SoundIcon from './SoundIcon';

function releaseAudio(audio: HTMLAudioElement) {
  audio.onended = null;
  audio.onerror = null;
  audio.ontimeupdate = null;
  audio.pause();
  audio.removeAttribute('src');
  audio.load();
}

export default function LibrarySounds({
  sounds,
  emptyMessage = 'No sounds match your search.',
  master,
  onAdd,
  onError,
}: {
  sounds: Sound[];
  emptyMessage?: string;
  master: number;
  onAdd: (sound: Sound) => void;
  onError: (message: string) => void;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function stopPreview() {
    const audio = audioRef.current;
    audioRef.current = null;
    if (audio) releaseAudio(audio);
    setPreviewId(null);
    setLoading(false);
  }

  useEffect(
    () => () => {
      const audio = audioRef.current;
      audioRef.current = null;
      if (audio) releaseAudio(audio);
    },
    [],
  );

  useEffect(() => {
    if (previewId && !sounds.some((sound) => sound.id === previewId)) stopPreview();
  }, [sounds, previewId]);

  async function preview(sound: Sound) {
    if (previewId === sound.id) {
      stopPreview();
      return;
    }
    stopPreview();
    onError('');
    const audio = new Audio(sound.file);
    audio.volume = (master / 100) * 0.65;
    audioRef.current = audio;
    setPreviewId(sound.id);
    setLoading(true);
    const failed = () => {
      if (audioRef.current !== audio) return;
      stopPreview();
      onError(`Could not preview ${sound.name}. Please try again.`);
    };
    audio.onerror = failed;
    audio.onended = () => {
      if (audioRef.current === audio) stopPreview();
    };
    audio.ontimeupdate = () => {
      if (audioRef.current === audio && audio.currentTime >= 10) stopPreview();
    };
    try {
      await audio.play();
      if (audioRef.current === audio) setLoading(false);
    } catch {
      // Switching sounds or closing the modal may cancel a pending play request.
      failed();
    }
  }

  return (
    <div className="sound-library">
      {sounds.map((sound) => {
        const active = previewId === sound.id;
        return (
          <div key={sound.id} className={`library-sound ${active ? 'previewing' : ''}`}>
            <button
              className="library-add"
              onClick={() => onAdd(sound)}
              aria-label={`Add ${sound.name}`}
            >
              <span className="sound-icon">
                <SoundIcon name={sound.icon} />
              </span>
              <strong>{sound.name}</strong>
              <Plus size={14} />
            </button>
            <button
              className="library-preview"
              onClick={() => void preview(sound)}
              aria-label={`${active ? 'Stop preview of' : 'Preview'} ${sound.name}`}
              aria-pressed={active}
              title={active ? 'Stop preview' : 'Preview up to 10 seconds'}
            >
              {active ? <Square size={13} /> : <Play size={13} />}
              <span>{active ? (loading ? 'Loading…' : 'Stop') : 'Preview'}</span>
            </button>
          </div>
        );
      })}
      {!sounds.length && <p className="empty-state">{emptyMessage}</p>}
    </div>
  );
}
