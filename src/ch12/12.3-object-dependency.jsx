// @id 12.3
// @title An object in the dependency array
// @section 12.3
// @click Render again
import { useEffect, useState, createRoot } from '@wordpress/element'; // Added so this runs on its own
import { Button } from '@wordpress/components'; // Added so this runs on its own

const SpaceFeed = ({ space }) => {
  const options = { spaceId: space.id, perPage: 20 };   // a new object every render

  useEffect(() => {
    console.log('loading with', options);
  }, [options]);
  // ...
  return <p>SpaceFeed (object dependency) for {space.name}</p>; // Added so this runs on its own
};

// Added so this runs on its own: the fix from the book, in a second component.
const SpaceFeedFixed = ({ space }) => {
useEffect(() => {
  const options = { spaceId: space.id, perPage: 20 };
  console.log('fixed: loading with', options);
}, [space.id]);

  return <p>SpaceFeedFixed (depends on space.id) for {space.name}</p>; // Added so this runs on its own
};

// Added so this runs on its own: "Render again" re-renders with the same space.
// The first component logs every time; the fixed one only logs when the space changes.
const space = { id: 1, name: 'General' };
const App = () => {
  const [renders, setRenders] = useState(1);
  return (
    <>
      <Button variant="secondary" onClick={() => setRenders(renders + 1)}>Render again ({renders})</Button>
      <SpaceFeed space={space} />
      <SpaceFeedFixed space={space} />
    </>
  );
};

createRoot(document.getElementById('forumwp-root')).render(<App />);
