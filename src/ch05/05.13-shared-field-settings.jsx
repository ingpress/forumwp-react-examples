// @id 5.13
// @title Spreading shared field settings
// @section 5.8
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { TextControl } from '@wordpress/components'; // Added so this runs on its own

const field = { __next40pxDefaultSize: true, __nextHasNoMarginBottom: true };

// Added so this runs on its own: a component with the name state (Chapter 8).
const Settings = () => {
  const [name, setName] = useState('ForumWP Community');
  return (
    // name and setName come from state (Chapter 8)
    <TextControl {...field} label="Community name" value={name} onChange={setName} />
  );
};
createRoot(document.getElementById('forumwp-root')).render(<Settings />);
