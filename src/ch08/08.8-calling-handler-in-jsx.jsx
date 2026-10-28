// @id 8.8
// @title Mistake: calling the function instead of passing it
// @section 8.2
// @expect error
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own

// Added so this runs on its own: the Like button from 8.2 with the wrong onClick.
const ReactionButton = () => {
  const [count, setCount] = useState(12);
  const like = () => {
    setCount(count + 1);
  };
  return <button onClick={like()}>Like</button>;   // WRONG
};
createRoot(document.getElementById('forumwp-root')).render(<ReactionButton />);
