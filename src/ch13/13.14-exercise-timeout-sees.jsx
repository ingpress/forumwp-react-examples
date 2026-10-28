// @id 13.14
// @title What does the timeout see? (Exercise 13.1)
// @section 13 (Exercises)
import { useState, createRoot } from '@wordpress/element'; // Added so this runs on its own

const Test = () => {
  const [n, setN] = useState(0);
  const click = () => {
    setN(n + 1);
    window.setTimeout(() => {
      console.log('timeout sees', n);
    }, 3000);
  };
  return <button onClick={click}>{n}</button>;
};

// Added so this runs on its own: write down your answer first, then click three times.
createRoot(document.getElementById('forumwp-root')).render(<Test />);
