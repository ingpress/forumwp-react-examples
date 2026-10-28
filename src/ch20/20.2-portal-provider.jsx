// @id 20.2
// @title PortalProvider and useCurrentUser
// @section 20.2
// app/portal/context/portal.js
import { createContext, useContext, useState } from '@wordpress/element';
// Added so this runs on its own: the imports src/index.js has.
import { createRoot } from '@wordpress/element';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

/**
 * Start-up data printed by PHP (see ForumWP\Portal\Assets::boot_data).
 * The current member can change while the app runs (new photo, onboarding done).
 */
const PortalContext = createContext( null );

export const PortalProvider = ( { data, children } ) => {
  const [ currentUser, setCurrentUser ] = useState( data.currentUser );

  return (
    <PortalContext.Provider
      value={ { ...data, currentUser, setCurrentUser } }
    >
      { children }
    </PortalContext.Provider>
  );
};

export const usePortal = () => useContext( PortalContext );

export const useCurrentUser = () => usePortal().currentUser;

/**
 * @return {(changes: Object) => void} Merges changes into the current member.
 */
export const useUpdateCurrentUser = () => {
  const { setCurrentUser } = usePortal();

  return ( changes ) =>
    setCurrentUser( ( user ) => ( user ? { ...user, ...changes } : user ) );
};

// PostActions, from the end of section 20.2.
const PostActions = ({ post }) => {
  const user = useCurrentUser();

  if (!user || user.id !== post.author.id) {
    return null;
  }
  // ... the Edit and Delete menu
  return <button>Edit or delete</button>; // Added so this runs on its own: a stand-in for the menu.
};

// Added so this runs on its own: start-up data, two posts, a top bar using the line from Layout.js (20.3),
// and App. Notice SpacePage, SpaceFeed and PostCard no longer pass currentUser along.
window.forumwpData = {
  basePath: '', siteName: 'Maker Collective', signupMode: 'open',
  currentUser: { id: 1, name: 'Ada', avatarUrl: 'https://i.pravatar.cc/96?img=47' },
};
const posts = [
  { id: 1, title: 'Welcome to the community', author: { id: 1, name: 'Ada' } },
  { id: 2, title: 'How do I change my avatar?', author: { id: 2, name: 'Tunde' } },
];
const Topbar = () => {
  const { siteName, signupMode, currentUser, brand = {} } = usePortal();
  return <header><strong>{siteName}</strong> · signed in as {currentUser.name}</header>;
};
const PostCard = ({ post }) => (
  <article className="fwp-post">
    <h3>{post.title}</h3>
    <PostActions post={post} />
  </article>
);
const SpaceFeed = () => posts.map((post) => <PostCard key={post.id} post={post} />);
const App = () => (
  <>
    <Topbar />
    <SpaceFeed />
  </>
);
const queryClient = new QueryClient();

// src/index.js
createRoot(document.getElementById('forumwp-root')).render(
  <QueryClientProvider client={queryClient}>
    <PortalProvider data={window.forumwpData}>
      {/* In the course this is BrowserRouter; MemoryRouter keeps the address inside the example so it runs anywhere. */}
      <MemoryRouter basename={window.forumwpData.basePath}>
        <App />
      </MemoryRouter>
    </PortalProvider>
  </QueryClientProvider>
);
