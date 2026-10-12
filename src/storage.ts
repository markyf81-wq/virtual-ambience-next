import { parseMix, sceneMix, type Mix } from './data';

export const STORAGE = 'virtual-ambience:v1';
export const MAX_SAVED_MIXES = 30;
export type Saved = { id: string; mix: Mix };

export function readInitial(): Mix {
  try {
    if (location.hash.startsWith('#mix=')) {
      const bytes = Uint8Array.from(atob(decodeURIComponent(location.hash.slice(5))), (c) =>
        c.charCodeAt(0),
      );
      return parseMix(JSON.parse(new TextDecoder().decode(bytes))) ?? sceneMix('forest');
    }
    const stored = JSON.parse(localStorage.getItem(STORAGE) ?? '{}');
    return parseMix(stored.current) ?? sceneMix('forest');
  } catch {
    return sceneMix('forest');
  }
}

export function readSaved(): Saved[] {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE) ?? '{}');
    if (!Array.isArray(stored.saved)) return [];
    return stored.saved.slice(0, MAX_SAVED_MIXES).flatMap((entry: unknown) => {
      if (!entry || typeof entry !== 'object' || !('mix' in entry) || !('id' in entry)) return [];
      const mix = parseMix(entry.mix);
      return mix ? [{ id: String(entry.id), mix }] : [];
    });
  } catch {
    return [];
  }
}
