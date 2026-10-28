// @id 12.2
// @title When an effect and its cleanup run
// @section 12.2
// @click Introductions
import { useEffect, useState, createRoot } from '@wordpress/element'; // Added so this runs on its own
import { Button } from '@wordpress/components'; // Added so this runs on its own

const SpacePage = ({ space }) => {
  console.log('render', space.name);

  useEffect(() => {
    console.log('effect', space.name);
    return () => {
      console.log('cleanup', space.name);
    };
  }, [space.name]);

  return <h1>{space.name}</h1>;
};

// Added so this runs on its own: buttons for each case in 12.2. (No StrictMode here, as the book asks.)
const spaces = { general: { name: 'General' }, intro: { name: 'Introductions' } };
const App = () => {
  const [space, setSpace] = useState(spaces.general);
  const [shown, setShown] = useState(true);
  const [, setTick] = useState(0);
  return (
    <>
      <Button variant="secondary" onClick={() => setSpace(spaces.general)}>General</Button>{' '}
      <Button variant="secondary" onClick={() => setSpace(spaces.intro)}>Introductions</Button>{' '}
      <Button variant="secondary" onClick={() => setTick((t) => t + 1)}>Render the parent again</Button>{' '}
      <Button variant="secondary" onClick={() => setShown(!shown)}>{shown ? 'Go to the Members page (unmount)' : 'Back to the space'}</Button>
      {shown ? <SpacePage space={space} /> : <h1>Members</h1>}
    </>
  );
};

createRoot(document.getElementById('forumwp-root')).render(<App />);
