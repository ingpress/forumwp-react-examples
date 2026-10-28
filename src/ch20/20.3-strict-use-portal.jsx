// @id 20.3
// @title A stricter usePortal with a clear message
// @section 20.3
// @expect error
import { createContext, useContext } from '@wordpress/element';
// Added so this runs on its own: the imports, and the context from app/portal/context/portal.js.
import { createRoot } from '@wordpress/element';
const PortalContext = createContext( null );

export const usePortal = () => {
  const value = useContext(PortalContext);
  if (value === null) {
    throw new Error('usePortal() must be used inside <PortalProvider>.');
  }
  return value;
};

// Added so this runs on its own: a top bar rendered WITHOUT a PortalProvider around it, on purpose.
// Look for the message above in the console.
const Topbar = () => {
  const { siteName } = usePortal();
  return <header>{siteName}</header>;
};

createRoot(document.getElementById('forumwp-root')).render(<Topbar />);
