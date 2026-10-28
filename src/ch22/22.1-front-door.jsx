// @id 22.1
// @title The front door: app/portal/index.js
// @section 22.4
import { createRoot } from '@wordpress/element';
// import domReady from '@wordpress/dom-ready';
// Added so this runs on its own: @wordpress/dom-ready isn't loaded in this sandbox, so here is a tiny
// version that does the same job: run the callback once the page's HTML has been read.
const domReady = (callback) =>
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', callback) : callback();
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom'; // Added so this runs on its own (the course imports BrowserRouter)
// import './extend';
// import App from './App';
// import FrameApp from './FrameApp';
// import { PortalProvider } from './context/portal';
// import { forgetOtherDrafts } from './utils/drafts';
// import './portal.scss';
// Added so this runs on its own: small stand-ins for the files imported above (no Sass in this sandbox).
import { createContext, useContext, useState } from '@wordpress/element';
const PortalContext = createContext(null);
const PortalProvider = ({ data, children }) => {
  const [currentUser, setCurrentUser] = useState(data.currentUser);
  return <PortalContext.Provider value={{ ...data, currentUser, setCurrentUser }}>{children}</PortalContext.Provider>;
};
const App = () => {
  const { siteName, currentUser } = useContext(PortalContext);
  return (
    <Routes>
      <Route path="/" element={<h1>{siteName}: home feed for {currentUser.name}</h1>} />
    </Routes>
  );
};
const FrameApp = () => <p>The community's bars around a non-community page.</p>;
window.forumwpData = {
  basePath: '/community', siteName: 'Maker Collective', frame: false,
  currentUser: { id: 1, name: 'Ada' },
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, refetchOnWindowFocus: false },
  },
});

domReady(() => {
  const root = document.getElementById('forumwp-root');
  if (!root) {
    return;
  }
  // ... forget other members' drafts ...

  createRoot(root).render(
    <QueryClientProvider client={queryClient}>
      <PortalProvider data={window.forumwpData}>
        {window.forumwpData.frame ? (
          <FrameApp />
        ) : (
          // In the course this is BrowserRouter; MemoryRouter keeps the address inside the example so it runs anywhere.
          <MemoryRouter basename={window.forumwpData.basePath} initialEntries={['/community']}>
            <App />
          </MemoryRouter>
        )}
      </PortalProvider>
    </QueryClientProvider>
  );
});
