// @id 9.2
// @title State is a snapshot
// @section 9.3
// @click Like
import { createRoot } from '@wordpress/element'; // Added so this runs on its own
import { useState } from '@wordpress/element'; // Added so this runs on its own

const ReactionButton = () => {
  const [count, setCount] = useState(12);

  const like = () => {
    setCount(count + 1);
    console.log('after setCount:', count);
  };

  console.log('rendering with', count);
  return <button onClick={like}>Like {count}</button>;
};

createRoot(document.getElementById('forumwp-root')).render(<ReactionButton />); // Added so this runs on its own
