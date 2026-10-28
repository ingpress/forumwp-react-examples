// @id 12.17
// @title Making the effect function async (broken)
// @section 12 (Common mistakes)
// @expect warning
import { useState, useEffect, createRoot } from '@wordpress/element'; // Added so this runs on its own
import { Button } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: the stand-in from 12.4.
const getUnreadCount = () => Promise.resolve(Math.floor(Math.random() * 5) + 1);

// Added so this runs on its own
const BrokenBell = () => {
  const [unread, setUnread] = useState(0);

// BROKEN
useEffect(async () => {
  const count = await getUnreadCount();
  setUnread(count);
}, []);

  return <p>Broken bell: {unread}</p>; // Added so this runs on its own
};

// Added so this runs on its own: the fix from the book.
const FixedBell = () => {
  const [unread, setUnread] = useState(0);

useEffect(() => {
  const load = async () => {
    const count = await getUnreadCount();
    setUnread(count);
  };
  load();
}, []);

  return <p>Fixed bell: {unread}</p>; // Added so this runs on its own
};

// Added so this runs on its own: the console message from the book appears as soon as the
// page opens. Removing the bells shows what else goes wrong: React treats the returned
// promise as a cleanup function, tries to call it, and the console shows a TypeError.
const App = () => {
  const [shown, setShown] = useState(true);
  return (
    <>
      <Button variant="secondary" onClick={() => setShown(false)}>Remove the bells</Button>
      {shown && <BrokenBell />}
      {shown && <FixedBell />}
    </>
  );
};

createRoot(document.getElementById('forumwp-root')).render(<App />);
