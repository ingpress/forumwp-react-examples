// @id 19.1
// @title Wrapping the app in the router
// @section 19.2
// src/index.js
import { createRoot } from '@wordpress/element';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, useLocation } from 'react-router-dom'; // MemoryRouter and useLocation: added so this runs on its own

// Added so this runs on its own: the start-up data PHP prints (Chapter 16), with the base path.
window.forumwpData = { basePath: '/community' };

// Added so this runs on its own: a tiny App that shows which address React Router sees.
const App = () => {
  const location = useLocation();
  return <p>The app sees the address <code>{location.pathname}</code> (the basename <code>/community</code> is removed).</p>;
};

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000 } },
});

createRoot(document.getElementById('forumwp-root')).render(
  <QueryClientProvider client={queryClient}>
    {/* In the course this is BrowserRouter; MemoryRouter keeps the address inside the example so it runs anywhere. */}
    <MemoryRouter basename={window.forumwpData.basePath} initialEntries={['/community/s/general']}>
      <App />
    </MemoryRouter>
  </QueryClientProvider>
);
