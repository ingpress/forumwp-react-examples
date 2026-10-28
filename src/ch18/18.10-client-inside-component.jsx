// @id 18.10
// @title BROKEN: creating the QueryClient inside a component
// @section Common mistakes
// @api fake
// @click Menu
// Added so this runs on its own: imports, a SpaceList, and a menu that changes state in App
// and shows the spaces again inside it. The list of spaces is already cached and fresh, yet
// opening the menu shows a spinner and sends a new request (see the console below): the
// re-render built a new, empty cache. (The list that was already on screen keeps working,
// because in version 5 a mounted useQuery stays attached to the cache it started with.)
import { useState, createRoot } from '@wordpress/element';
import { Button, Spinner } from '@wordpress/components';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';

const SpaceList = () => {
  const { data: spaces, isPending } = useQuery({
    queryKey: ['spaces'],
    queryFn: () => apiFetch({ path: '/forumwp/v1/spaces' }),
    staleTime: 30_000,
  });
  return isPending ? <Spinner /> : <ul>{spaces.map((s) => <li key={s.id}>{s.name}</li>)}</ul>;
};

const App = () => {
  const queryClient = new QueryClient(); // WRONG: a new, empty cache on every render
  const [menuOpen, setMenuOpen] = useState(false); // Added so this runs on its own
  return (
    <QueryClientProvider client={queryClient}>
      {/* ... */}
      <Button variant="secondary" onClick={() => setMenuOpen(!menuOpen)}>Menu ({menuOpen ? 'open' : 'closed'})</Button>
      {menuOpen && <div className="fwp-card"><strong>Menu</strong><SpaceList /></div>}
      <SpaceList />
    </QueryClientProvider>
  );
};

createRoot(document.getElementById('forumwp-root')).render(<App />); // Added so this runs on its own
