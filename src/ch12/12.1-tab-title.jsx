// @id 12.1
// @title An effect that sets the tab title
// @section 12.1
// @click Introductions
import { useEffect } from '@wordpress/element';
import { useState, createRoot } from '@wordpress/element'; // Added so this runs on its own
import { Button, CheckboxControl } from '@wordpress/components'; // Added so this runs on its own

const SpacePage = ({ space }) => {
  useEffect(() => {
    document.title = `${space.name} · Community`;
  }, [space.name]);

  return <h1>{space.name}</h1>;
};

// Added so this runs on its own: Common mistake 4 from the end of the chapter, to compare.
const SpacePageOnce = ({ space }) => {
useEffect(() => {
  document.title = `${space.name} · Community`;
}, []);   // "I only want it once"

  return <h1>{space.name}</h1>; // Added so this runs on its own
};

// Added so this runs on its own: in JSFiddle or CodePen the example runs inside a frame,
// so the browser tab doesn't show its title. This line shows it instead.
const ShowTabTitle = () => {
  const [title, setTitle] = useState(document.title);
  useEffect(() => {
    const timer = window.setInterval(() => setTitle(document.title), 200);
    return () => window.clearInterval(timer);
  }, []);
  return <p>Tab title: <strong>{title}</strong></p>;
};

// Added so this runs on its own: switch space and watch the tab title follow.
const spaces = [{ id: 1, name: 'General' }, { id: 2, name: 'Introductions' }];
const App = () => {
  const [space, setSpace] = useState(spaces[0]);
  const [broken, setBroken] = useState(false);
  return (
    <>
      {spaces.map((s) => <Button key={s.id} variant={s.id === space.id ? 'primary' : 'secondary'} onClick={() => setSpace(s)}>{s.name}</Button>)}
      <CheckboxControl label="Use the broken version (Common mistake 4: [] instead of [space.name])" checked={broken} onChange={setBroken} __nextHasNoMarginBottom />
      {broken ? <SpacePageOnce key="once" space={space} /> : <SpacePage key="right" space={space} />}
      <ShowTabTitle />
    </>
  );
};

createRoot(document.getElementById('forumwp-root')).render(<App />);
