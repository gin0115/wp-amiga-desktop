import { useStore } from '../store.js';
import AmigaWindow from './AmigaWindow.jsx';

export default function WindowManager() {
  const windows = useStore((s) => s.windows);
  if (windows.size === 0) return null;
  return (
    <div className="window-manager" data-testid="window-manager">
      {[...windows.values()].map((w) => (
        <AmigaWindow key={w.id} window={w} />
      ))}
    </div>
  );
}
