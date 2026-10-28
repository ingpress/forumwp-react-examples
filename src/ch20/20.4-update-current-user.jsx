// @id 20.4
// @title Changing the current member, and who re-renders
// @section 20.4
// @click Save
import { createRoot, createContext, useContext, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, TextControl } from '@wordpress/components'; // Added so this runs on its own
import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query'; // Added so this runs on its own

// Added so this runs on its own: PortalProvider and its hooks, from app/portal/context/portal.js (Example 20.2).
const PortalContext = createContext( null );
const PortalProvider = ( { data, children } ) => {
  const [ currentUser, setCurrentUser ] = useState( data.currentUser );
  return (
    <PortalContext.Provider value={ { ...data, currentUser, setCurrentUser } }>
      { children }
    </PortalContext.Provider>
  );
};
const usePortal = () => useContext( PortalContext );
const useCurrentUser = () => usePortal().currentUser;
const useUpdateCurrentUser = () => {
  const { setCurrentUser } = usePortal();
  return ( changes ) =>
    setCurrentUser( ( user ) => ( user ? { ...user, ...changes } : user ) );
};

// Added so this runs on its own: stand-ins for the profile-saving mutations. The real ones send the profile
// to the REST API (a route the course's fake API doesn't have); these answer after a short wait.
const useSaveProfile = () =>
  useMutation({
    mutationFn: (form) => new Promise((resolve) => setTimeout(() => resolve({ ...form }), 600)),
  });
const useFinishOnboarding = () =>
  useMutation({
    mutationFn: (changes) => new Promise((resolve) => setTimeout(() => resolve(changes), 600)),
  });

// Added so this runs on its own: a ProfileEditor around the book's lines from ProfileEditor.js.
const ProfileEditor = () => {
  const [ form, setForm ] = useState({ name: 'Ada Lovelace', avatarUrl: 'https://i.pravatar.cc/96?img=45' });
  const save = useSaveProfile();
  const updateCurrentUser = useUpdateCurrentUser();

  const onSave = () => {
    // ... inside the save handler:
    save.mutate( form, {
      onSuccess: ( saved ) => {
        updateCurrentUser( {
          name: saved.name,
          avatarUrl: saved.avatarUrl,
        } );
      },
    } );
  };

  return (
    <div className="fwp-card">
      <TextControl label="Name" value={form.name} onChange={(name) => setForm({ ...form, name })} __nextHasNoMarginBottom __next40pxDefaultSize />
      <Button variant="primary" isBusy={save.isPending} onClick={onSave}>Save profile</Button>
    </div>
  );
};

// Added so this runs on its own: a welcome box using the lines from Onboarding.js.
const Onboarding = () => {
  const updateCurrentUser = useUpdateCurrentUser();
  const finish = useFinishOnboarding();

  const done = () => {
    updateCurrentUser( { onboarded: true } );
    finish.mutate( { onboarded: true } );
  };

  return (
    <div className="fwp-card">
      <p>Welcome! Finish setting up your profile.</p>
      <Button variant="secondary" onClick={done}>Done</Button>
    </div>
  );
};

// Added so this runs on its own: the readers and non-readers of the context, each logging its renders (20.5).
const Topbar = () => {
  const { siteName, currentUser } = usePortal();
  console.log('Topbar rendered');
  return (
    <header>
      <strong>{siteName}</strong> · <img className="fwp-avatar" src={currentUser.avatarUrl} width="32" height="32" alt="" /> {currentUser.name}
    </header>
  );
};
const PostCard = () => {
  console.log('PostCard rendered');
  return <article className="fwp-post"><h3>Welcome to the community</h3></article>;
};
const WelcomeBox = () => {
  const currentUser = useCurrentUser();
  return ! currentUser.onboarded && <Onboarding />;
};
const Layout = () => (
  <>
    <Topbar />
    <WelcomeBox />
    <ProfileEditor />
    <PostCard />
  </>
);

window.forumwpData = {
  siteName: 'Maker Collective',
  currentUser: { id: 1, name: 'Ada', avatarUrl: 'https://i.pravatar.cc/96?img=47', onboarded: false },
};

createRoot(document.getElementById('forumwp-root')).render(
  <QueryClientProvider client={new QueryClient()}>
    {/* Layout is created here, outside PortalProvider, and passed in as children (20.5). */}
    <PortalProvider data={window.forumwpData}>
      <Layout />
    </PortalProvider>
  </QueryClientProvider>
);
