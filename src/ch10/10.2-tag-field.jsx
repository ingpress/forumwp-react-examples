// @id 10.2
// @title A tag field that cleans its text as you type
// @section 10.2
import { useState, createRoot } from '@wordpress/element'; // Added so this runs on its own

const TagField = () => {
  const [tag, setTag] = useState('');

  const handleChange = (event) => {
    const clean = event.target.value
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    setTag(clean);
  };

  return <input type="text" value={tag} onChange={handleChange} />;
};

// Added so this runs on its own: type "Plugin Dev!" and the box shows plugin-dev.
createRoot(document.getElementById('forumwp-root')).render(
  <label>Tag: <TagField /></label>
);
