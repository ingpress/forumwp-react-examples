// @id 4.3
// @title BROKEN: two elements side by side
// @section 4.4
// @expect error
import { createRoot } from '@wordpress/element'; // Added so this runs on its own

// BROKEN
const PostMeta = () => {
  return (
    <span>Ada</span>
    <span>2h ago</span>
  );
};

createRoot(document.getElementById('forumwp-root')).render(<PostMeta />); // Added so this runs on its own
