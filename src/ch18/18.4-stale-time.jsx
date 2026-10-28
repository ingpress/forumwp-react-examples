// @id 18.4
// @title Fresh, stale, and coming back
// @section 18.5
// @api fake
// @click Hide
// Added so this runs on its own: imports.
import { useState, createRoot } from '@wordpress/element';
import { Button, Spinner } from '@wordpress/components';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';

// The real set-up from app/portal/index.js:
const queryClient = new QueryClient( {
  defaultOptions: {
    queries: { staleTime: 30_000, refetchOnWindowFocus: false },
  },
} );

const useSpaces = () =>
  useQuery({
    queryKey: ['spaces'],
    queryFn: () => apiFetch({ path: '/forumwp/v1/spaces' }),
    staleTime: 5 * 60 * 1000, // spaces change rarely: fresh for 5 minutes
  });

// Added so this runs on its own: hide and show the list. While it's fresh, showing it again
// uses the cache: no spinner, and no new request in the console below.
const SpaceList = () => {
  const { data: spaces, isPending } = useSpaces();
  if (isPending) {
    return <Spinner />;
  }
  return <ul>{spaces.map((s) => <li key={s.id}>{s.name}</li>)}</ul>;
};

const App = () => {
  const [showing, setShowing] = useState(true);
  return (
    <>
      <Button variant="secondary" onClick={() => setShowing(!showing)}>{showing ? 'Hide the list' : 'Show the list'}</Button>
      {showing ? <SpaceList /> : <p>(The list is gone, but its cache entry stays for gcTime, 5 minutes.)</p>}
    </>
  );
};

createRoot(document.getElementById('forumwp-root')).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
