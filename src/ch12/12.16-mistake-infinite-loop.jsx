// @id 12.16
// @title An effect that sets state on every render (broken)
// @section 12 (Common mistakes)
// @expect warning
import { useState, useEffect, createRoot } from '@wordpress/element'; // Added so this runs on its own

// BROKEN
const Feed = ({ posts }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    setCount(count + 1);
  });
  // ...
  return <p>Feed rendered {count} times</p>; // Added so this runs on its own
};

// Added so this runs on its own: the loop never stops by itself, so this example removes
// the Feed after 3 seconds to stop your browser working flat out.
const App = () => {
  const [shown, setShown] = useState(true);
  useEffect(() => {
    const timer = window.setTimeout(() => setShown(false), 3000);
    return () => window.clearTimeout(timer);
  }, []);
  return shown ? <Feed posts={[]} /> : <p>Stopped after 3 seconds. Every one of those renders came from the effect.</p>;
};

createRoot(document.getElementById('forumwp-root')).render(<App />);
