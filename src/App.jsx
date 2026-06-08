import ScreenStack from './components/ScreenStack.jsx';
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts.js';

export default function App() {
  useKeyboardShortcuts();
  return (
    <div className="amiga-root" data-testid="amiga-root">
      <ScreenStack />
    </div>
  );
}
