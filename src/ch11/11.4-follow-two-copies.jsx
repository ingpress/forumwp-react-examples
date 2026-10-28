// @id 11.4
// @title Two components, two copies (broken)
// @section 11.4
// @click Follow
import { useState, createRoot } from '@wordpress/element'; // Added so this runs on its own
import { Button } from '@wordpress/components'; // Added so this runs on its own

// BROKEN: two separate "following" values for the same space
const SpaceCard = ({ space }) => {
  const [following, setFollowing] = useState(false);
  // ...a Follow button using following/setFollowing
  // Added so this runs on its own:
  return (
    <div className="fwp-space-card">
      Sidebar card: {space.name}{' '}
      <Button variant="secondary" onClick={() => setFollowing(!following)}>{following ? 'Following' : 'Follow'}</Button>
    </div>
  );
};

const SpaceHeader = ({ space }) => {
  const [following, setFollowing] = useState(false);
  // ...another Follow button
  // Added so this runs on its own:
  return (
    <h2>
      {space.name}{' '}
      <Button variant="primary" onClick={() => setFollowing(!following)}>{following ? 'Following' : 'Follow'}</Button>
    </h2>
  );
};

// Added so this runs on its own: click Follow in the header; the card still says "Follow".
const space = { id: 1, name: 'General' };
createRoot(document.getElementById('forumwp-root')).render(
  <>
    <SpaceHeader space={space} />
    <SpaceCard space={space} />
  </>
);
