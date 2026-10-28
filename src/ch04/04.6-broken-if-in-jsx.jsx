// @id 4.6
// @title BROKEN: an if inside JSX braces
// @section 4.5
// @expect error
import { createRoot } from '@wordpress/element'; // Added so this runs on its own

const isPinned = true; // Added so this runs on its own

// BROKEN
const PostCard = () => (
  <article>
    {if (isPinned) { <span>Pinned</span> }}
  </article>
);

createRoot(document.getElementById('forumwp-root')).render(<PostCard />); // Added so this runs on its own
