// @id 13.9
// @title Autosave: a ref for the latest value
// @section 13.9
import { useState, useEffect, useRef } from '@wordpress/element';
import { createRoot } from '@wordpress/element'; // Added so this runs on its own
import { TextareaControl } from '@wordpress/components'; // Added so this runs on its own

const EMPTY = { title: '', body: '' }; // Added so this runs on its own

// Added so this runs on its own: the broken effect in its own composer.
const PostComposerBroken = ({ onAutosave }) => {
  const [form, setForm] = useState(EMPTY);

// BROKEN: always saves the empty form
useEffect(() => {
  const timer = window.setInterval(() => {
    onAutosave(form);
  }, 10000);
  return () => window.clearInterval(timer);
}, []);

  // Added so this runs on its own
  return <TextareaControl label="Post (broken autosave)" value={form.body} onChange={(body) => setForm({ ...form, body })} __nextHasNoMarginBottom />;
};

const PostComposer = ({ onSubmit, onAutosave }) => {
  const [form, setForm] = useState(EMPTY);
  const latestForm = useRef(form);

  // After every render, keep the ref pointing at the newest form.
  useEffect(() => {
    latestForm.current = form;
  });

  // One interval for as long as the composer is on screen.
  useEffect(() => {
    const timer = window.setInterval(() => {
      onAutosave(latestForm.current);
    }, 10000);
    return () => window.clearInterval(timer);
  }, [onAutosave]);

  // ...the form from Chapter 10
  // Added so this runs on its own
  return <TextareaControl label="Post (autosave with a ref)" value={form.body} onChange={(body) => setForm({ ...form, body })} __nextHasNoMarginBottom />;
};

// Added so this runs on its own: type in both boxes and wait. Every 10 seconds each one
// autosaves; the broken one always saves an empty body.
const saveBroken = (form) => console.log('broken autosave:', form);
const save = (form) => console.log('autosave with a ref:', form);
createRoot(document.getElementById('forumwp-root')).render(
  <>
    <PostComposerBroken onAutosave={saveBroken} />
    <PostComposer onAutosave={save} />
  </>
);
