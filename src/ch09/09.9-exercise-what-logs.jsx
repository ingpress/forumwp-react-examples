// @id 9.9
// @title Exercise 9.2: what does this log?
// @section 9.7
// @click 0
import { createRoot } from '@wordpress/element'; // Added so this runs on its own
import { useState } from '@wordpress/element'; // Added so this runs on its own

const Test = () => {
  const [n, setN] = useState(0);
  const click = () => {
    setN(n + 1);
    setN(n + 1);
    setN((x) => x + 10);
    console.log('in click', n);
  };
  console.log('render', n);
  return <button onClick={click}>{n}</button>;
};

createRoot(document.getElementById('forumwp-root')).render(<Test />); // Added so this runs on its own
