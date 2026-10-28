// @id 20.5
// @title Broken: reading the context outside its provider
// @section 20.6
// @expect error
import { createRoot, createContext, useContext, useState } from '@wordpress/element'; // Added so this runs on its own
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // Added so this runs on its own
import { MemoryRouter } from 'react-router-dom'; // Added so this runs on its own

// Added so this runs on its own: the context and hooks from app/portal/context/portal.js (Example 20.2).
const PortalContext = createContext( null );
const usePortal = () => useContext( PortalContext );
const useCurrentUser = () => usePortal().currentUser;

// Added so this runs on its own: start-up data, a container, a query client and an App that reads the member.
window.forumwpData = { basePath: '', currentUser: { id: 1, name: 'Ada' } };
const container = document.getElementById('forumwp-root');
const queryClient = new QueryClient();
const App = () => {
  const user = useCurrentUser();
  return <p>Hello, {user.name}</p>;
};

// In the course this is BrowserRouter; MemoryRouter keeps the address inside the example so it runs anywhere.
createRoot(container).render(
  <QueryClientProvider client={queryClient}>
    <MemoryRouter basename={window.forumwpData.basePath}>
      <App />   {/* WRONG: no PortalProvider around it */}
    </MemoryRouter>
  </QueryClientProvider>
);
