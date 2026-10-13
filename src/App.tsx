import { useEffect, useRef, useState } from 'react';
import {
  AudioLines,
  Bird,
  Waves,
  Leaf,
  Moon,
  Headphones,
  Play,
  Pause,
  Plus,
  X,
  ArrowUpRight,
  Check,
  Bookmark,
  Share2,
  Clock3,
  RotateCcw,
  Trash2,
  Search,
  Sparkles,
  Download,
  Upload,
  Shuffle,
} from 'lucide-react';
import {
  sounds,
  soundById,
  MAX_LAYERS,
  scenes,
  collections,
  sceneMix,
  makeLayer,
  parseMix,
  type Layer,
  type Mix,
  type Sound,
  type SoundCollection,
} from './data';
import { AmbienceEngine, type LiveValues } from './audio/engine';
import Scenery from './Scenery';
import Slider from './Slider';
import SoundColumns from './SoundColumns';
import LibrarySounds from './LibrarySounds';
import Modal from './Modal';
import CollectionPicker from './CollectionPicker';
import SoundIcon from './SoundIcon';
import { STORAGE, MAX_SAVED_MIXES, readInitial, readSaved, type Saved } from './storage';
export default function App() {
  const [mix, setMix] = useState<Mix>(readInitial);
  const [saved, setSaved] = useState<Saved[]>(readSaved);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<'library' | 'save' | 'saved' | 'timer' | 'about' | null>(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [sceneCollection, setSceneCollection] = useState<SoundCollection>(
    () => scenes.find((scene) => scene.id === mix.sceneId)?.collection ?? 'nature',
  );
  const [libraryCollection, setLibraryCollection] = useState<SoundCollection>(sceneCollection);
  const [layerTab, setLayerTab] = useState<'loop' | 'effect'>('loop');
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');
  const [saveName, setSaveName] = useState('');
  const [deadline, setDeadline] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [activeEvents, setActiveEvents] = useState<string[]>([]);
  const [liveValues, setLiveValues] = useState<LiveValues>({});
  const engineRef = useRef<AmbienceEngine | null>(null);
  if (!engineRef.current) engineRef.current = new AmbienceEngine();
  const engine = engineRef.current;
  const mixRef = useRef(mix);
  mixRef.current = mix;
  const playingRef = useRef(playing);
  playingRef.current = playing;
  const requestRef = useRef(0);
  const importRef = useRef<HTMLInputElement>(null);
  const scene = scenes.find((s) => s.id === mix.sceneId) ?? scenes[0];
  const visibleScenes = scenes.filter((s) => s.collection === sceneCollection);
  const activeCollectionScenes = scenes.filter((s) => s.collection === scene.collection);
  const activeCollection = collections.find((collection) => collection.id === scene.collection)!;
  useEffect(() => {
    const collection = scenes.find((s) => s.id === mix.sceneId)?.collection ?? 'nature';
    setSceneCollection(collection);
    setLibraryCollection(collection);
    setCategory('All');
  }, [mix.sceneId]);
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE, JSON.stringify({ current: mix, saved }));
      } catch {
        setError('Your browser could not save this mix. Export a backup to keep it.');
      }
    }, 400);
    return () => clearTimeout(id);
  }, [mix, saved]);
  useEffect(() => {
    void engine.sync(mix).catch((e) => {
      engine.pause();
      setPlaying(false);
      setError(e instanceof Error ? e.message : 'Audio could not be loaded.');
    });
  }, [mix, engine]);
  useEffect(() => {
    engine.onValues = setLiveValues;
    engine.onEvent = (id) => {
      setActiveEvents((prev) => [...prev.filter((i) => i !== id), id]);
      setTimeout(() => setActiveEvents((prev) => prev.filter((i) => i !== id)), 1800);
    };
    return () => {
      engine.onValues = undefined;
      engine.onEvent = undefined;
      engine.dispose();
    };
  }, [engine]);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(''), 3500);
    return () => clearTimeout(id);
  }, [toast]);
  useEffect(() => {
    if (!deadline) return;
    const tick = () => {
      const seconds = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemaining(seconds);
      if (seconds === 0) {
        ++requestRef.current;
        engine.pause();
        setPlaying(false);
        setLoading(false);
        setDeadline(null);
        setToast('Sleep timer finished. Rest easy.');
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadline, engine]);
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: mix.name,
      artist: 'Virtual Ambience',
    });
    navigator.mediaSession.playbackState = playing ? 'playing' : 'paused';
    navigator.mediaSession.setActionHandler('pause', () => {
      ++requestRef.current;
      engine.pause();
      setPlaying(false);
      setLoading(false);
    });
    navigator.mediaSession.setActionHandler('play', () => {
      if (!playingRef.current) void togglePlayback();
    });
  }, [mix.name, playing]);
  function patch(p: Partial<Mix>) {
    setMix((m) => ({ ...m, ...p }));
  }
  function patchLayer(id: string, p: Partial<Layer>) {
    setMix((m) => ({ ...m, layers: m.layers.map((l) => (l.id === id ? { ...l, ...p } : l)) }));
  }
  async function togglePlayback() {
    if (playingRef.current || loading) {
      ++requestRef.current;
      engine.pause();
      setPlaying(false);
      setLoading(false);
      return;
    }
    const request = ++requestRef.current;
    setLoading(true);
    setError('');
    try {
      await engine.start(mixRef.current);
      if (request === requestRef.current) {
        setPlaying(true);
      }
    } catch (e) {
      if (request === requestRef.current)
        setError(e instanceof Error ? e.message : 'Audio is unavailable in this browser.');
    } finally {
      if (request === requestRef.current) setLoading(false);
    }
  }
  function chooseScene(id: string) {
    const next = sceneMix(id);
    setMix({
      ...next,
      master: mix.master,
      evolution: mix.evolution,
      evolveEnabled: mix.evolveEnabled,
    });
    setError('');
    history.replaceState(null, '', location.pathname + location.search);
  }
  function addSound(sound: Sound) {
    if (mix.layers.length >= MAX_LAYERS) {
      setToast(`Your scene can hold up to ${MAX_LAYERS} layers.`);
      return;
    }
    const layer = makeLayer(sound.id, sound.kind === 'effect' ? 40 : 30);
    setMix((m) => ({ ...m, layers: [...m.layers, layer] }));
    setLayerTab(sound.kind);
    setModal(null);
    setToast(`${sound.name} added`);
  }
  async function share() {
    try {
      const data = new TextEncoder().encode(JSON.stringify(mix));
      const encoded = btoa(Array.from(data, (b) => String.fromCharCode(b)).join(''));
      const url = new URL(location.href);
      url.hash = `mix=${encodeURIComponent(encoded)}`;
      await navigator.clipboard.writeText(url.href);
      setToast('Scene link copied. Share a little elsewhere.');
    } catch {
      setError('Could not copy the link. Export your mix to share it instead.');
    }
  }
  function exportMix() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(mix, null, 2)], { type: 'application/json' }),
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = 'virtual-ambience-mix.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function importMix(file: File) {
    try {
      if (file.size > 100000) throw new Error();
      const next = parseMix(JSON.parse(await file.text()));
      if (!next) throw new Error();
      setMix(next);
      setModal(null);
      setToast('Your mix is ready.');
    } catch {
      setError('This file is not a valid Virtual Ambience mix.');
    } finally {
      if (importRef.current) importRef.current.value = '';
    }
  }
  async function preview(layer: Layer) {
    setError('');
    try {
      await engine.preview(layer, mix);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not preview this sound.');
    }
  }
  const collectionSounds = sounds.filter(
    (sound) => sound.collection === libraryCollection && sound.kind === layerTab,
  );
  const categories = ['All', ...new Set(collectionSounds.map((sound) => sound.category))];
  const visibleLayers = mix.layers.filter((l) => soundById.get(l.soundId)?.kind === layerTab);
  const loopCount = mix.layers.filter((l) => soundById.get(l.soundId)?.kind === 'loop').length;
  const effectCount = mix.layers.length - loopCount;
  const filtered = collectionSounds.filter(
    (s) =>
      (category === 'All' || s.category === category) &&
      s.name.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <div className="app-shell">
      <header className="site-header">
        <a
          className="brand"
          href="#"
          onClick={(e) => e.preventDefault()}
          aria-label="Virtual Ambience home"
        >
          <span className="brand-mark">
            <AudioLines size={23} />
          </span>
          <span>
            virtual ambience<span className="brand-note">A LITTLE ELSEWHERE</span>
          </span>
        </a>
        <nav>
          <button className="nav-item" onClick={() => setModal('saved')}>
            <Bookmark size={16} /> My soundscapes <span className="count">{saved.length}</span>
          </button>
          <button className="about-button" onClick={() => setModal('about')}>
            About <ArrowUpRight size={14} />
          </button>
        </nav>
      </header>
      <main>
        <div className="page-intro">
          <div>
            <span className="eyebrow">YOUR SPACE TO SLOW DOWN</span>
            <h1>Find yourself elsewhere.</h1>
          </div>
          <p>
            Build a world of sound.
            <br />
            Let the rest fall quiet.
          </p>
        </div>
        <div className="workspace">
          <section className="mixer" aria-label="Sound controls">
            <div className="mixer-title">
              <div>
                <span className="eyebrow">MAKE THIS PLACE YOURS</span>
                <h2>
                  Your soundscape <span>{mix.layers.length}</span>
                </h2>
              </div>
              <button
                className="icon-button"
                title="Reset to scene preset"
                aria-label="Reset scene"
                onClick={() => chooseScene(mix.sceneId)}
              >
                <RotateCcw size={16} />
              </button>
            </div>
            <div className="top-controls">
              <div className="transport">
                <button
                  className={`play-button ${playing ? 'is-playing' : ''}`}
                  onClick={() => void togglePlayback()}
                  aria-label={
                    loading ? 'Cancel loading' : playing ? 'Pause soundscape' : 'Play soundscape'
                  }
                >
                  {loading ? (
                    <span className="spinner" />
                  ) : playing ? (
                    <Pause size={21} fill="currentColor" />
                  ) : (
                    <Play size={21} fill="currentColor" />
                  )}
                </button>
                <div className="transport-label">
                  <strong>
                    {loading
                      ? 'Preparing your escape…'
                      : playing
                        ? 'You’re a little elsewhere.'
                        : 'Take a breath. Press play.'}
                  </strong>
                  <span>
                    {loading
                      ? 'Loading your selected sounds'
                      : playing
                        ? 'Stay as long as you like'
                        : 'Your soundscape is ready when you are'}
                  </span>
                </div>
                <div className="master-control">
                  <Slider
                    label="Master volume"
                    value={mix.master}
                    onChange={(master) => patch({ master })}
                  />
                </div>
                <button
                  className={`timer-button ${deadline ? 'timer-active' : ''}`}
                  onClick={() => setModal('timer')}
                  aria-label="Sleep timer"
                >
                  <Clock3 size={18} />
                  <span>
                    {deadline
                      ? `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}`
                      : 'Timer'}
                  </span>
                </button>
              </div>
              <div className="evolution-control">
                <div className="auto-mode-header">
                  <label className="switch-row evolve-toggle">
                    <span>
                      <Sparkles size={16} />
                      <strong>Auto mode</strong>
                      <small>
                        {mix.evolveEnabled
                          ? mix.evolution < 40
                            ? 'Gentle'
                            : mix.evolution < 75
                              ? 'Wandering'
                              : 'Lively'
                          : 'Off'}
                      </small>
                    </span>
                    <input
                      type="checkbox"
                      aria-label="Auto mode"
                      checked={mix.evolveEnabled}
                      onChange={(e) => patch({ evolveEnabled: e.target.checked })}
                    />
                  </label>
                  {mix.evolveEnabled && (
                    <button
                      className="randomise-button"
                      disabled={loading}
                      onClick={() => engine.shuffleAuto(mix)}
                      title="Shuffle loop volumes and effect frequencies within their limits"
                    >
                      <Shuffle size={13} /> Shuffle
                    </button>
                  )}
                </div>
                <Slider
                  label="Auto mode intensity"
                  min={1}
                  value={mix.evolution}
                  disabled={!mix.evolveEnabled}
                  onChange={(evolution) => patch({ evolution })}
                />
              </div>
            </div>
            <div className="mixer-tabs" role="tablist" aria-label="Sound types">
              <button
                id="loops-tab"
                role="tab"
                aria-selected={layerTab === 'loop'}
                aria-controls="sound-layers-panel"
                onClick={() => {
                  setLayerTab('loop');
                }}
              >
                <Waves size={14} /> Ambience loops <span className="tab-count">{loopCount}</span>
              </button>
              <button
                id="effects-tab"
                role="tab"
                aria-selected={layerTab === 'effect'}
                aria-controls="sound-layers-panel"
                onClick={() => {
                  setLayerTab('effect');
                }}
              >
                <Bird size={14} /> Sound effects <span className="tab-count">{effectCount}</span>
              </button>
            </div>
            <div
              className="mix-controls"
              role="tabpanel"
              id="sound-layers-panel"
              aria-labelledby={layerTab === 'loop' ? 'loops-tab' : 'effects-tab'}
            >
              <div className="layer-list">
                {visibleLayers.length === 0 ? (
                  <div className="empty-state">
                    <Leaf size={24} />
                    <p>
                      {layerTab === 'loop' ? 'Set the backdrop.' : 'Add a little life.'}
                      <br />
                      {layerTab === 'loop'
                        ? 'Add a continuous sound to begin.'
                        : 'Add an occasional sound to begin.'}
                    </p>
                  </div>
                ) : (
                  <SoundColumns
                    layers={visibleLayers}
                    autoEnabled={mix.evolveEnabled}
                    playing={playing}
                    liveValues={liveValues}
                    activeEvents={activeEvents}
                    onChange={patchLayer}
                    onPreview={preview}
                    onRemove={(id) =>
                      setMix((m) => ({ ...m, layers: m.layers.filter((layer) => layer.id !== id) }))
                    }
                  />
                )}
              </div>
              <button
                className="add-sound"
                onClick={() => {
                  setQuery('');
                  setCategory('All');
                  setModal('library');
                }}
              >
                <Plus size={17} />{' '}
                {layerTab === 'loop' ? 'Add an ambience loop' : 'Add a sound effect'}{' '}
                <span>Explore the library</span>
              </button>
            </div>
            <div className="mixer-footer">
              <button
                onClick={() => {
                  setSaveName(mix.name);
                  setModal('save');
                }}
              >
                <Bookmark size={15} /> Save mix
              </button>
              <button onClick={() => void share()}>
                <Share2 size={15} /> Share
              </button>
            </div>
          </section>
          <aside className="scene-column" aria-label="Scene selection">
            <div className={`scene-stage scene-${scene.id}`}>
              <Scenery scene={scene.id} />
              <div className="scene-overlay" />
              <div className="scene-topline">
                <span className="scene-badge">
                  <span className={playing ? 'live-dot playing' : 'live-dot'} />
                  {playing ? 'SCENE IS LIVE' : 'A MOMENT OF STILLNESS'}
                </span>
                <span className="headphone-badge">
                  <Headphones size={14} /> Best with headphones
                </span>
              </div>
              <div className="scene-title">
                <span className="eyebrow">{scene.eyebrow}</span>
                <h2>{mix.name}</h2>
                <p>{scene.description}</p>
              </div>
              <div className="scene-footer">
                <span>
                  <SoundIcon name={activeCollection.icon} size={15} /> {activeCollection.name} ·{' '}
                  {mix.layers.length} sound layers
                </span>
                <span className="scene-coordinate">
                  {String(activeCollectionScenes.findIndex((s) => s.id === scene.id) + 1).padStart(
                    2,
                    '0',
                  )}{' '}
                  / {String(activeCollectionScenes.length).padStart(2, '0')}
                </span>
              </div>
            </div>
            <div className="section-heading">
              <div>
                <span className="eyebrow">START SOMEWHERE</span>
                <h3>A place for every mood</h3>
              </div>
              <span className="quiet-label">
                {visibleScenes.filter((scene) => !scene.allSounds).length} little escapes
              </span>
            </div>
            <CollectionPicker
              label="Scene collection"
              value={sceneCollection}
              onChange={setSceneCollection}
              counts={Object.fromEntries(
                collections.map((collection) => [
                  collection.id,
                  scenes.filter((scene) => scene.collection === collection.id).length,
                ]),
              )}
            />
            <div className="scene-grid">
              {visibleScenes.map((s, i) => (
                <button
                  className={`preset ${s.id === mix.sceneId ? 'selected' : ''}`}
                  key={s.id}
                  onClick={() => chooseScene(s.id)}
                  aria-pressed={s.id === mix.sceneId}
                >
                  <div className="preset-image">
                    <Scenery scene={s.id} small />
                    {s.id === mix.sceneId && (
                      <span className="preset-check">
                        <Check size={13} />
                      </span>
                    )}
                    <span className="preset-number">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <div className="preset-info">
                    <strong>{s.name}</strong>
                    <span>{s.tag}</span>
                  </div>
                </button>
              ))}
            </div>
            <div className="slow-note">
              <span className="small-orbit">
                <Leaf size={17} />
              </span>
              <p>
                No two moments sound quite the same.
                <br />
                <span>Your scene gently changes as you listen.</span>
              </p>
            </div>
          </aside>
        </div>
      </main>
      <footer className="site-footer">
        <span>
          <AudioLines size={15} /> Virtual Ambience <span className="footer-dot">·</span> A familiar
          idea, reimagined.
        </span>
        <span>Made for moments of quiet.</span>
      </footer>
      {error && (
        <div className="error-banner" role="alert">
          {error}
          <button aria-label="Dismiss error" onClick={() => setError('')}>
            <X size={16} />
          </button>
        </div>
      )}
      {toast && (
        <div className="toast" role="status">
          <Check size={16} />
          {toast}
        </div>
      )}
      <input
        hidden
        ref={importRef}
        type="file"
        accept="application/json,.json"
        onChange={(e) => {
          if (e.target.files?.[0]) void importMix(e.target.files[0]);
        }}
      />
      {modal === 'library' && (
        <Modal
          title={layerTab === 'loop' ? 'Set the backdrop' : 'Bring your scene to life'}
          onClose={() => setModal(null)}
        >
          <p className="modal-description">
            {layerTab === 'loop'
              ? 'Continuous sounds that surround your scene.'
              : 'Individual sounds that appear at random moments in your scene.'}
          </p>
          <CollectionPicker
            label="Sound collection"
            value={libraryCollection}
            onChange={(collection) => {
              setLibraryCollection(collection);
              setCategory('All');
            }}
            counts={Object.fromEntries(
              collections.map((collection) => [
                collection.id,
                sounds.filter(
                  (sound) => sound.collection === collection.id && sound.kind === layerTab,
                ).length,
              ]),
            )}
          />
          <label className="search-box">
            <Search size={18} />
            <input
              placeholder="Find a sound…"
              aria-label="Search sounds"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <div className="category-tabs">
            {categories.map((c) => (
              <button
                key={c}
                className={category === c ? 'active' : ''}
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
          <LibrarySounds
            sounds={filtered}
            master={mix.master}
            onAdd={addSound}
            onError={setError}
          />
          <p className="modal-footnote">
            {collectionSounds.length} {layerTab === 'loop' ? 'ambience loops' : 'sound effects'}.
            Preview up to 10 seconds before adding.
          </p>
        </Modal>
      )}
      {modal === 'save' && (
        <Modal title="Keep this little escape" onClose={() => setModal(null)}>
          <p className="modal-description">Save your layers and settings in this browser.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const name = saveName.trim();
              if (!name) return;
              if (saved.length >= MAX_SAVED_MIXES) {
                setToast('Remove a saved mix before adding another.');
                return;
              }
              const snapshot = { ...mix, name };
              setSaved((s) => [...s, { id: crypto.randomUUID(), mix: snapshot }]);
              setMix(snapshot);
              setModal(null);
              setToast('Your soundscape is saved.');
            }}
          >
            <label className="field-label">
              Soundscape name
              <input
                autoComplete="off"
                required
                maxLength={60}
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="My forest retreat"
              />
            </label>
            <button className="primary-button" type="submit">
              <Bookmark size={16} /> Save soundscape
            </button>
          </form>
          <button className="text-button backup-button" onClick={exportMix}>
            <Download size={15} /> Export a backup file
          </button>
        </Modal>
      )}
      {modal === 'saved' && (
        <Modal title="Your little escapes" onClose={() => setModal(null)}>
          <p className="modal-description">Soundscapes you’ve kept, saved on this device.</p>
          <div className="saved-list">
            {saved.map((s) => (
              <div className="saved-item" key={s.id}>
                <button
                  onClick={() => {
                    setMix(parseMix(s.mix)!);
                    setModal(null);
                    setToast(`${s.mix.name} loaded`);
                  }}
                >
                  <Scenery scene={s.mix.sceneId} small />
                  <span>
                    <strong>{s.mix.name}</strong>
                    <small>{s.mix.layers.length} layers</small>
                  </span>
                  <ArrowUpRight size={18} />
                </button>
                <button
                  className="icon-button"
                  aria-label={`Delete saved mix ${s.mix.name}`}
                  onClick={() => setSaved((items) => items.filter((i) => i.id !== s.id))}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {!saved.length && (
              <div className="empty-state">
                <Bookmark size={30} />
                <p>
                  Your favourite places will live here.
                  <br />
                  Use “Save mix” to keep your first soundscape.
                </p>
              </div>
            )}
          </div>
          <div className="backup-actions">
            <button className="text-button" onClick={() => importRef.current?.click()}>
              <Upload size={15} /> Import a mix
            </button>
            <button className="text-button" onClick={exportMix}>
              <Download size={15} /> Export current mix
            </button>
          </div>
        </Modal>
      )}
      {modal === 'timer' && (
        <Modal title="Drift off, we’ll stop" onClose={() => setModal(null)}>
          <p className="modal-description">Your soundscape fades out when the timer ends.</p>
          <div className="timer-options">
            {[15, 30, 45, 60, 90, 120].map((minutes) => (
              <button
                key={minutes}
                onClick={() => {
                  setDeadline(Date.now() + minutes * 60000);
                  setModal(null);
                  setToast(`Sleep timer set for ${minutes} minutes.`);
                }}
              >
                <Moon size={18} />
                <strong>{minutes}</strong>
                <span>minutes</span>
              </button>
            ))}
          </div>
          {deadline && (
            <button
              className="text-button"
              onClick={() => {
                setDeadline(null);
                setModal(null);
                setToast('Sleep timer cancelled.');
              }}
            >
              <X size={14} /> Cancel timer
            </button>
          )}
        </Modal>
      )}
      {modal === 'about' && (
        <Modal title="A familiar idea, reimagined" onClose={() => setModal(null)}>
          <div className="about-copy">
            <p>
              Virtual Ambience began as a Windows program for building living sound scenes. This new
              version brings that idea to the web, using the original sound collection.
            </p>
            <p>
              Choose a place, add your sounds, and give them room to change. Background loops ebb
              and flow; individual calls and thunder occur at unpredictable intervals. The master
              “Auto mode” switch enables automatic volume changes for loops and automatic frequency
              changes for effects. Its intensity slider controls how often they change, within each
              sound’s limits.
            </p>
            <h3>A space around you</h3>
            <p>
              Turn spatial audio on for any occasional sound to hear it appear at a fresh random
              direction around you each time it plays, including above and below, at a fixed
              distance. It works through ordinary stereo headphones. There is no head tracking.
            </p>
            <p>
              Your mixes stay in your browser. Sharing a link includes the settings, so someone else
              can hear the same scene with their own random variation.
            </p>
            <p className="modal-footnote">
              On mobile, playback while the screen is locked depends on your browser and operating
              system.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}
