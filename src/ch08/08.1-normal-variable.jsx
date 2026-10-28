// @id 8.1
// @title BROKEN: a normal variable as a counter
// @section 8.1
// @click Like
import { createRoot } from '@wordpress/element'; // Added so this runs on its own

// BROKEN: the number on screen never changes
const ReactionButton = () => {
  let count = 12;

  const like = () => {
    count = count + 1;
    console.log('count is now', count);
  };

  return <button onClick={like}>Like {count}</button>;
};

createRoot(document.getElementById('forumwp-root')).render(<ReactionButton />); // Added so this runs on its own
