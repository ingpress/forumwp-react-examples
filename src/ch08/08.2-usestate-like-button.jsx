// @id 8.2
// @title useState: a Like button that counts
// @section 8.2
// @click Like
import { createRoot } from '@wordpress/element'; // Added so this runs on its own
import { useState } from '@wordpress/element';

const ReactionButton = () => {
  const [count, setCount] = useState(12);
  // The same as (8.2):
  // const pair = useState(12);
  // const count = pair[0];     // the current value
  // const setCount = pair[1];  // the function that changes it

  const like = () => {
    setCount(count + 1);
  };

  return <button onClick={like}>Like {count}</button>;
};

createRoot(document.getElementById('forumwp-root')).render(<ReactionButton />); // Added so this runs on its own
