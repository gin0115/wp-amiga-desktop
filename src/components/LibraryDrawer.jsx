import { useState } from 'react';
import { useStore } from '../store.js';
import { useLibrary } from '../hooks/useLibrary.js';
import { mountSlot } from '../lib/disk-tools.js';

/**
 * Content for the 'library' window kind: groups library items by category,
 * each clickable to fetch + mount into the configured drive slot.
 */
export default function LibraryDrawer() {
  const { data, isLoading, isError } = useLibrary();
  const sae = useStore((s) => s.saeRef);
  const setDriveName = useStore((s) => s.setDriveName);
  const [mounting, setMounting] = useState(null);
  const [lastError, setLastError] = useState(null);

  if (isLoading) return <p className="window-status">Loading library…</p>;
  if (isError)
    return (
      <p className="window-status">
        Library manifest unreachable. Check <code>public/library/manifest.json</code>.
      </p>
    );

  const items = data?.items ?? [];
  if (items.length === 0) {
    return (
      <p className="window-status">
        No items in the library. Drop ADFs in <code>public/library/</code> and add
        them to <code>manifest.json</code>.
      </p>
    );
  }

  // Group by category, preserving manifest order within each group.
  const groups = new Map();
  for (const item of items) {
    const cat = item.category || 'Other';
    if (!groups.has(cat)) groups.set(cat, []);
    groups.get(cat).push(item);
  }

  async function onMount(item) {
    if (!sae) return;
    setMounting(item.id);
    setLastError(null);
    try {
      const res = await fetch(item.url);
      if (!res.ok) throw new Error(`Fetch ${item.url} → ${res.status}`);
      const data = new Uint8Array(await res.arrayBuffer());
      const slot = item.slot || 'df0';
      if (mountSlot(sae, slot, item.title, data)) {
        setDriveName(slot, item.title);
      }
    } catch (e) {
      setLastError(e.message);
    } finally {
      setMounting(null);
    }
  }

  return (
    <div className="library-drawer" data-testid="library-drawer">
      <p className="drive-note">
        Click a disk to mount it into its slot. Floppies swap live; hardfile
        / ROM swaps need a power-cycle.
      </p>
      {[...groups.entries()].map(([cat, items]) => (
        <section
          key={cat}
          className="library-group"
          data-testid={`library-group-${cat.toLowerCase()}`}
        >
          <h3>{cat}</h3>
          <ul className="library-list">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="library-item"
                  data-testid={`library-item-${item.id}`}
                  disabled={!sae || mounting === item.id}
                  onClick={() => onMount(item)}
                  title={item.description}
                >
                  <span className="library-item-title">
                    {mounting === item.id ? '…' : item.title}
                  </span>
                  <span className="library-item-meta">
                    {item.slot?.toUpperCase()} · {item.kind?.toUpperCase()}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
      {lastError && <p className="library-error">{lastError}</p>}
    </div>
  );
}

export const LIBRARY_WINDOW = {
  id: 'library',
  kind: 'library',
  title: 'Games & Demos',
  x: 200,
  y: 100,
  w: 520,
  h: 380,
};
