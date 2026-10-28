// @id 19.9
// @title Broken: a Link outside the router
// @section 19.8
// @expect error
import { createRoot } from '@wordpress/element';
// Added so this runs on its own: imports, start-up data, and small Topbar and App components.
import { MemoryRouter, Link } from 'react-router-dom';
window.forumwpData = { basePath: '/community' };
const container = document.getElementById('forumwp-root');
const Topbar = () => <header><Link to="/">Maker Collective</Link></header>;
const App = () => <h1>Home feed</h1>;

// In the course this is BrowserRouter; MemoryRouter keeps the address inside the example so it runs anywhere.
// It fails in the same way. This page loads React Router's production build, which leaves out the friendly
// message, so instead of "useHref() may be used only in the context of a <Router> component." you see
// "Cannot destructure property 'basename' of ... as it is null." Both mean: no router above this Link.
createRoot(container).render(
  <>
    <Topbar />   {/* WRONG: Topbar contains a Link, but it's outside BrowserRouter */}
    <MemoryRouter basename={window.forumwpData.basePath} initialEntries={['/community']}>
      <App />
    </MemoryRouter>
  </>
);
