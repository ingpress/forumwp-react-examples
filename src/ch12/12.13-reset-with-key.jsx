// @id 12.13
// @title Resetting state with a key instead of an effect
// @section 12.6
import { useState, useEffect, createRoot } from '@wordpress/element'; // Added so this runs on its own
import { Button, TextControl } from '@wordpress/components'; // Added so this runs on its own

const EMPTY = { title: '', body: '' }; // Added so this runs on its own

// UNNECESSARY
const ComposerBox = ({ space }) => {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    setForm(EMPTY);
  }, [space.id]);
  // ...
  // Added so this runs on its own: log what each render draws, so you can see the old
  // text being drawn once in the new space.
  console.log(`drawing "${form.title}" in ${space.name}`);
  return (
    <TextControl label={`New post in ${space.name}`} value={form.title} onChange={(title) => setForm({ ...form, title })} __next40pxDefaultSize __nextHasNoMarginBottom />
  );
};

// A fresh box (and its draft) for each space, even when the screen stays mounted.
const Composer = (props) => (
  <ComposerBox key={props.space?.id ?? 'home'} {...props} />
);

// Added so this runs on its own: type a title, then switch space. Without the key, the log shows
// the old title drawn once in the new space before the effect clears it. With the key, the
// box starts fresh, so the old text is never drawn there (the effect is then not needed at all).
const spaces = [{ id: 1, name: 'General' }, { id: 2, name: 'Help' }];
const App = () => {
  const [space, setSpace] = useState(spaces[0]);
  const [useKey, setUseKey] = useState(false);
  return (
    <>
      {spaces.map((s) => <Button key={s.id} variant={s.id === space.id ? 'primary' : 'secondary'} onClick={() => setSpace(s)}>{s.name}</Button>)}{' '}
      <Button variant="link" onClick={() => setUseKey(!useKey)}>{useKey ? 'Using <Composer> (key): switch to the effect only' : 'Using <ComposerBox> (effect only): switch to the key version'}</Button>
      {useKey ? <Composer space={space} /> : <ComposerBox space={space} />}
    </>
  );
};

createRoot(document.getElementById('forumwp-root')).render(<App />);
