// @id 20.6
// @title Broken: changing the context value in place
// @section 20.6
// @click Save
import { createRoot, createContext, useContext, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: PortalProvider and useCurrentUser (Example 20.2).
const PortalContext = createContext( null );
const PortalProvider = ( { data, children } ) => {
  const [ currentUser, setCurrentUser ] = useState( data.currentUser );
  return (
    <PortalContext.Provider value={ { ...data, currentUser, setCurrentUser } }>
      { children }
    </PortalContext.Provider>
  );
};
const useCurrentUser = () => useContext( PortalContext ).currentUser;

// Added so this runs on its own: a profile page that "saves" a new photo and shows it from the saved data.
const ProfilePage = () => {
  const [ saved, setSaved ] = useState(null);
  const user = useCurrentUser();

  const onSaved = (saved) => {
    user.avatarUrl = saved.avatarUrl;   // WRONG
  };

  return (
    <div className="fwp-card">
      <p>Profile page photo: <img className="fwp-avatar" src={saved ? saved.avatarUrl : user.avatarUrl} width="48" height="48" alt="" /></p>
      <Button variant="primary" onClick={() => {
        const answer = { avatarUrl: 'https://i.pravatar.cc/96?img=45' };
        onSaved(answer);
        setSaved(answer);
      }}>Save new photo</Button>
    </div>
  );
};
const Topbar = () => {
  const user = useCurrentUser();
  return <header>Top bar photo: <img className="fwp-avatar" src={user.avatarUrl} width="32" height="32" alt="" /> (stays old after saving)</header>;
};

window.forumwpData = { currentUser: { id: 1, name: 'Ada', avatarUrl: 'https://i.pravatar.cc/96?img=47' } };
createRoot(document.getElementById('forumwp-root')).render(
  <PortalProvider data={window.forumwpData}>
    <Topbar />
    <ProfilePage />
  </PortalProvider>
);
