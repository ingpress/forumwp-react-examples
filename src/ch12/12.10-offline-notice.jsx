// @id 12.10
// @title An "offline" notice from window events
// @section 12.5
import { useState, useEffect } from '@wordpress/element';
import { Notice } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { createRoot } from '@wordpress/element'; // Added so this runs on its own

const OfflineNotice = () => {
  const [online, setOnline] = useState(() => window.navigator.onLine);

  useEffect(() => {
    const update = () => setOnline(window.navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  if (online) {
    return null;
  }
  return (
    <Notice status="warning" isDismissible={false}>
      {__('You are offline. New posts will not load until you reconnect.', 'forumwp')}
    </Notice>
  );
};

// Added so this runs on its own: turn off your network (or choose "Offline" in the
// browser's developer tools, Network tab) and the notice appears.
createRoot(document.getElementById('forumwp-root')).render(
  <>
    <OfflineNotice />
    <p>The space page would be here.</p>
  </>
);
