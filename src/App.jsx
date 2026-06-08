import { useCategories, usePrimaryMenu } from './hooks/useWpQuery.js';
import { useStore } from './store.js';

export default function App() {
  const cats = useCategories();
  const menu = usePrimaryMenu();
  const offsetY = useStore((s) => s.offsetY);
  const setOffset = useStore((s) => s.setOffset);

  return (
    <div className="amiga-root" data-testid="amiga-root">
      <div className="boot-placeholder">
        <p>Workbench 3.1</p>
        <p className="boot-subtitle">
          step3: data layer online — offsetY {offsetY}
        </p>

        {menu.data && (
          <ul data-testid="primary-menu">
            {menu.data.items.map((item) => (
              <li key={item.id}>{item.title}</li>
            ))}
          </ul>
        )}

        {cats.data && (
          <ul data-testid="categories">
            {cats.data.map((c) => (
              <li key={c.id}>
                {c.name} ({c.count})
              </li>
            ))}
          </ul>
        )}

        {(cats.isError || menu.isError) && (
          <p data-testid="wp-error" className="boot-error">
            Software Failure — WP REST unreachable
          </p>
        )}

        <button
          type="button"
          onClick={() => setOffset(offsetY > 0 ? 0 : 120)}
          data-testid="poke-store"
        >
          poke store
        </button>
      </div>
    </div>
  );
}
