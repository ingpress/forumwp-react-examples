// @id 9.1
// @title A render is a function call
// @section 9.1
// @click Add a member
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own

const SpaceCard = ({ space }) => {
  console.log('SpaceCard rendered for', space.name);
  return (
    <div className="fwp-space-card">
      <h3>{space.name}</h3>
      <small>{space.memberCount} members</small>
    </div>
  );
};

// Added so this runs on its own: a parent with a button, so you can make SpaceCard render again.
const App = () => {
  const [space, setSpace] = useState({ name: 'General', memberCount: 1280 });
  return (
    <>
      <SpaceCard space={space} />
      <button onClick={() => setSpace({ ...space, memberCount: space.memberCount + 1 })}>Add a member</button>
    </>
  );
};
createRoot(document.getElementById('forumwp-root')).render(<App />);
