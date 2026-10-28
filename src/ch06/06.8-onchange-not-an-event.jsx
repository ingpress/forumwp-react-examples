// @id 6.8
// @title Mistake: treating onChange as a browser event
// @section 6.8
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { TextControl } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: a component with the title state.
// Type one letter into the field to see the error.
const TitleField = () => {
  const [title, setTitle] = useState('');
  return (
    <TextControl label="Title" value={title} onChange={(event) => setTitle(event.target.value)} />
  );
};
createRoot(document.getElementById('forumwp-root')).render(<TitleField />);
