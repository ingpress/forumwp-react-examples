// @id 13.5
// @title The leave-page warning that never comes, and the fix
// @section 13.4
// @click Test both
import { useState, useEffect, createRoot } from '@wordpress/element'; // Added so this runs on its own
import { Button, TextareaControl } from '@wordpress/components'; // Added so this runs on its own

const EMPTY = { title: '', body: '' }; // Added so this runs on its own

// BROKEN: never warns
const PostComposer = ({ onSubmit }) => {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    const onBeforeUnload = (event) => {
      if (form.body.trim()) {
        event.preventDefault();      // asks the browser to show "Leave site?"
        event.returnValue = true;    // the same, for older browsers
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);
  // ...
  // Added so this runs on its own
  return <TextareaControl label="Post (broken composer)" value={form.body} onChange={(body) => setForm({ ...form, body })} __nextHasNoMarginBottom />;
};

// Added so this runs on its own: the honest dependency array from 13.6.
const PostComposerFixed = ({ onSubmit }) => {
  const [form, setForm] = useState(EMPTY);

useEffect(() => {
  const onBeforeUnload = (event) => {
    if (form.body.trim()) {
      event.preventDefault();
      event.returnValue = true;
    }
  };
  window.addEventListener('beforeunload', onBeforeUnload);
  return () => window.removeEventListener('beforeunload', onBeforeUnload);
}, [form.body]);

  // Added so this runs on its own
  return <TextareaControl label="Post (fixed composer)" value={form.body} onChange={(body) => setForm({ ...form, body })} __nextHasNoMarginBottom />;
};

// Added so this runs on its own: closing the tab inside JSFiddle or CodePen won't show the
// browser's "Leave site?" box, so this button sends a pretend beforeunload event and reports
// whether a listener asked for the warning. Type in one composer at a time, then press it.
const testLeaving = () => {
  const event = new Event('beforeunload', { cancelable: true });
  window.dispatchEvent(event);
  console.log(event.defaultPrevented ? 'The browser would warn: "Leave site?"' : 'No warning: the tab would just close');
};

createRoot(document.getElementById('forumwp-root')).render(
  <>
    <PostComposer />
    <PostComposerFixed />
    <Button variant="secondary" onClick={testLeaving}>Test both: try to leave the page</Button>
  </>
);
