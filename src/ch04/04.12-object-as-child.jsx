// @id 4.12
// @title BROKEN: an object where text should go
// @section Common mistakes
// @expect error
import { createRoot } from '@wordpress/element'; // Added so this runs on its own

const author = { name: 'Ada', avatar_url: '/a.png' };

// Added so this runs on its own: a component for the JSX line.
const PostAuthor = () => (
  <strong>{author}</strong>
);

createRoot(document.getElementById('forumwp-root')).render(<PostAuthor />); // Added so this runs on its own
