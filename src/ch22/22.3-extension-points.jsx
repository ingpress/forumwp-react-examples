// @id 22.3
// @title Extension points: extend.js and an add-on
// @section 22.8
// app/portal/extend.js (shortened)
import { applyFilters } from '@wordpress/hooks';
import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
// import { get, post, remove, upload } from './api/client';
// import Avatar from './components/Avatar';
// import { useCurrentUser, usePortal } from './context/portal';
// ... more imports ...
// Added so this runs on its own: the other imports, and stand-ins for the files imported above.
import { createRoot, createElement, createContext, useContext } from '@wordpress/element';
import { addFilter } from '@wordpress/hooks';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const get = () => {}, post = () => {}, remove = () => {}, upload = () => {};
const Avatar = ({ user }) => <img className="fwp-avatar" src={user.avatarUrl} width="24" height="24" alt="" />;
window.forumwpData = { version: '0.20.0', siteName: 'Maker Collective', currentUser: { id: 1, name: 'Ada', avatarUrl: 'https://i.pravatar.cc/96?img=47' } };
const PortalContext = createContext(window.forumwpData);
const usePortal = () => useContext(PortalContext);
const useCurrentUser = () => usePortal().currentUser;

const list = (value) => (Array.isArray(value) ? value : []);

export const extraRoutes = () =>
  list(applyFilters('forumwp.routes', [])).filter(
    (route) => route?.path && route?.component
  );

export const extraNavItems = (user) =>
  list(applyFilters('forumwp.navItems', [], user)).filter(
    (item) => item?.to && item?.label
  );

// ... extraProfileTabs, extraPostFooter, composerTools, composerSubmitLabel,
//     memberNameExtras, extraEmailTypes, notificationSettings ...

window.forumwp = {
  ...(window.forumwp || {}),
  version: window.forumwpData?.version,
  api: { get, post, remove, upload },
  components: { Avatar /* , MemberAvatar, MemberName, MentionTextarea, Tabs */ },
  query: { useQuery, useMutation, useQueryClient, useInfiniteQuery },
  router: { Link, useNavigate, useParams },
  hooks: { useCurrentUser, usePortal },
};

// The add-on's JavaScript from tests/e2e/mu-plugins/forumwp-e2e-addon.php. In WordPress, PHP prints it
// after portal.js. Added so this runs on its own: window.wp only exists in WordPress, so we build the two
// pieces the add-on uses (wp.element.createElement and wp.hooks.addFilter) from the imports above.
window.wp = { element: { createElement }, hooks: { addFilter } };

( function ( wp, forumwp ) {
  var el = wp.element.createElement;
  var useCurrentUser = forumwp.hooks.useCurrentUser;

  function Hello() {
    var user = useCurrentUser();
    return el( 'h1', { className: 'fwp-page-title' }, 'Hello from an add-on, ' + ( user ? user.name : 'visitor' ) );
  }

  wp.hooks.addFilter( 'forumwp.routes', 'forumwp-e2e', function ( routes ) {
    return routes.concat( [ { path: '/hello', component: Hello } ] );
  } );
  wp.hooks.addFilter( 'forumwp.navItems', 'forumwp-e2e', function ( items ) {
    return items.concat( [ { to: '/hello', label: 'Add-on screen' } ] );
  } );
} )( window.wp, window.forumwp );

// Added so this runs on its own: a sidebar that uses extraNavItems (as SpaceNav.js does), and App.js's routes.
// The example starts at /hello, the add-on's screen; use the links to move around.
const Home = () => <h1>Home feed</h1>;
const Saved = () => <h1>Saved</h1>;
const NotFound = () => <h1>Page not found</h1>;
const SpaceNav = () => {
  const user = useCurrentUser();
  return (
    <nav>
      <Link to="/">Home</Link> · <Link to="/saved">Saved</Link>
      {extraNavItems(user).map((item) => (
        <span key={item.to}> · <Link to={item.to}>{item.label}</Link></span>
      ))}
    </nav>
  );
};
const App = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/saved" element={<Saved />} />
    {extraRoutes().map(({ path, component: Screen }) => (
      <Route key={path} path={path} element={<Screen />} />
    ))}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

// In the course this is BrowserRouter; MemoryRouter keeps the address inside the example so it runs anywhere.
createRoot(document.getElementById('forumwp-root')).render(
  <QueryClientProvider client={new QueryClient()}>
    <MemoryRouter initialEntries={['/hello']}>
      <SpaceNav />
      <App />
    </MemoryRouter>
  </QueryClientProvider>
);
