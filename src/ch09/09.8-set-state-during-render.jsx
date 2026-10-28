// @id 9.8
// @title Mistake: setting state during render
// @section 9.7
// @expect error
import { createRoot } from '@wordpress/element'; // Added so this runs on its own
import { useState } from '@wordpress/element'; // Added so this runs on its own

const Feed = ({ posts }) => {
  const [count, setCount] = useState(0);
  setCount(posts.length);   // WRONG: in the render itself
  // ...
  return <p>{count} posts</p>; // Added so this runs on its own
};

// Added so this runs on its own. The fix is derived data: const count = posts.length;
const posts = [{ id: 1, title: 'Welcome' }, { id: 2, title: 'Hello' }];
createRoot(document.getElementById('forumwp-root')).render(<Feed posts={posts} />);
