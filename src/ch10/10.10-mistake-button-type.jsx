// @id 10.10
// @title A submit button that doesn't submit (broken)
// @section 10 (Common mistakes)
import { useState, createRoot } from '@wordpress/element'; // Added so this runs on its own
import { Button, TextControl } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: a small form for each wrong button.
const Composer = ({ version }) => {
  const [title, setTitle] = useState('');
  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(`version ${version} submitted`, { title });
  };
  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
      <TextControl label={`Title (version ${version})`} value={title} onChange={setTitle} __next40pxDefaultSize __nextHasNoMarginBottom />
      {version === 1
        ? <Button variant="primary" onClick={handleSubmit}>Post</Button>   // WRONG
        : <Button variant="primary">Post</Button>                          // WRONG
      }
    </form>
  );
};

// Added so this runs on its own: version 1 works on click but not on Enter; version 2 does nothing.
createRoot(document.getElementById('forumwp-root')).render(
  <>
    <Composer version={1} />
    <Composer version={2} />
  </>
);
