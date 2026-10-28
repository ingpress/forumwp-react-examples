// @id 12.14
// @title A missing cleanup: two intervals (broken)
// @section 12.7
// @click Leave and come back
import { useState, useEffect, StrictMode, createRoot } from '@wordpress/element'; // Added so this runs on its own
import { Button } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: count the intervals that are started. With StrictMode
// the page opens with 2 (set-up, clean-up, set-up). "Leave and come back" unmounts and
// mounts the bell for real; each visit adds two more (StrictMode rehearses every new
// mount), and nothing ever stops them.
let running = 0;
const realSetInterval = window.setInterval.bind(window);
window.setInterval = (fn, ms) => {
  running++;
  console.log(`interval started: ${running} running`);
  return realSetInterval(fn, ms);
};

// Added so this runs on its own: the bell from 12.4 with the broken effect.
const NotificationBell = () => {
  const check = () => console.log('checking for notifications');

// BROKEN: no cleanup
useEffect(() => {
  window.setInterval(check, 30000);
}, []);

  return <p className="fwp-bell">Notifications</p>; // Added so this runs on its own
};

// Added so this runs on its own
const App = () => {
  const [visit, setVisit] = useState(1);
  return (
    <>
      <Button variant="secondary" onClick={() => setVisit(visit + 1)}>Leave and come back</Button>
      <NotificationBell key={visit} />
    </>
  );
};

createRoot(document.getElementById('forumwp-root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
