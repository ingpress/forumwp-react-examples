// @id 10.1
// @title A controlled title field
// @section 10.1
import { useState } from '@wordpress/element';
import { createRoot } from '@wordpress/element'; // Added so this runs on its own

const TitleField = () => {
  const [title, setTitle] = useState('');

  return (
    <input
      type="text"
      value={title}
      onChange={(event) => setTitle(event.target.value)}
    />
  );
};

// Added so this runs on its own: type in the box. React stores every keystroke in `title`.
createRoot(document.getElementById('forumwp-root')).render(
  <label>Title: <TitleField /></label>
);
