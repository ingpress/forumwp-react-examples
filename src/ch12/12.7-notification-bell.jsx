// @id 12.7
// @title Polling: the notification bell
// @section 12.4
import { useState, useEffect } from '@wordpress/element';
import { createRoot } from '@wordpress/element'; // Added so this runs on its own

// Stand-in until Chapter 16: pretends the server answered.
const getUnreadCount = () => Promise.resolve(Math.floor(Math.random() * 5));

const NotificationBell = () => {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let stopped = false;

    const check = () => {
      getUnreadCount().then((count) => {
        if (!stopped) {
          setUnread(count);
        }
      });
    };

    check();
    const timer = window.setInterval(check, 30000);

    return () => {
      stopped = true;
      window.clearInterval(timer);
    };
  }, []);

  return <span className="fwp-bell">Notifications {unread > 0 && `(${unread})`}</span>;
};

// Added so this runs on its own: the count is random and changes every 30 seconds.
createRoot(document.getElementById('forumwp-root')).render(<NotificationBell />);
