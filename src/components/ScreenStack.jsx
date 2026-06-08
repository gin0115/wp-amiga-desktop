import BackScreen from './BackScreen.jsx';
import FrontScreen from './FrontScreen.jsx';

export default function ScreenStack() {
  return (
    <div className="screen-stack" data-testid="screen-stack">
      <BackScreen />
      <FrontScreen />
    </div>
  );
}
