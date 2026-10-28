// @id 12.12
// @title Do it in the event handler, not an effect
// @section 12.6
import { useState, useEffect, createRoot } from '@wordpress/element'; // Added so this runs on its own
import { Button, TextControl } from '@wordpress/components'; // Added so this runs on its own

const EMPTY = { title: '', body: '' }; // Added so this runs on its own

// Added so this runs on its own: a small composer around the book's roundabout version.
const ComposerWithEffect = ({ onSubmit }) => {
  const [form, setForm] = useState(EMPTY);
  console.log('ComposerWithEffect rendered');

// UNNECESSARY
const [submitted, setSubmitted] = useState(null);

useEffect(() => {
  if (submitted) {
    onSubmit(submitted);
    setSubmitted(null);
  }
}, [submitted, onSubmit]);

const handleSubmit = (event) => {
  event.preventDefault();
  setSubmitted(form);
};

  return ( // Added so this runs on its own
    <form onSubmit={handleSubmit} className="fwp-card">
      <TextControl label="Title (effect version)" value={form.title} onChange={(title) => setForm({ ...form, title })} __next40pxDefaultSize __nextHasNoMarginBottom />
      <Button variant="primary" type="submit">Post</Button>
    </form>
  );
};

// Added so this runs on its own: the same composer with the direct version.
const ComposerDirect = ({ onSubmit }) => {
  const [form, setForm] = useState(EMPTY);
  console.log('ComposerDirect rendered');

const handleSubmit = (event) => {
  event.preventDefault();
  onSubmit(form);
};

  return ( // Added so this runs on its own
    <form onSubmit={handleSubmit} className="fwp-card">
      <TextControl label="Title (event handler version)" value={form.title} onChange={(title) => setForm({ ...form, title })} __next40pxDefaultSize __nextHasNoMarginBottom />
      <Button variant="primary" type="submit">Post</Button>
    </form>
  );
};

// Added so this runs on its own: press each Post and compare the renders logged.
const log = (post) => console.log('new post', post);
createRoot(document.getElementById('forumwp-root')).render(
  <>
    <ComposerWithEffect onSubmit={log} />
    <ComposerDirect onSubmit={log} />
  </>
);
