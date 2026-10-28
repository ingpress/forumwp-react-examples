// @id 12.15
// @title Loading posts in an effect
// @section 12.8
// @api fake
// @click Help
import { useState, useEffect, createRoot } from '@wordpress/element'; // Added so this runs on its own
import apiFetch from '@wordpress/api-fetch'; // Added so this runs on its own
import { Button } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: a feed around the book's effect.
const SpaceFeed = ({ spaceId }) => {
  const [posts, setPosts] = useState([]);

useEffect(() => {
  let ignore = false;
  apiFetch({ path: `/forumwp/v1/spaces/${spaceId}/posts` }).then((page) => {
    if (!ignore) {
      setPosts(page.items);
    }
  });
  return () => {
    ignore = true;
  };
}, [spaceId]);

  return <ul>{posts.slice(0, 5).map((p) => <li key={p.id}>{p.title}</li>)}</ul>;
};

// Added so this runs on its own: switch space quickly; only the last space's answer is shown.
const App = () => {
  const [spaceId, setSpaceId] = useState(1);
  return (
    <>
      <Button variant={spaceId === 1 ? 'primary' : 'secondary'} onClick={() => setSpaceId(1)}>General</Button>{' '}
      <Button variant={spaceId === 2 ? 'primary' : 'secondary'} onClick={() => setSpaceId(2)}>Help</Button>
      <SpaceFeed spaceId={spaceId} />
    </>
  );
};

createRoot(document.getElementById('forumwp-root')).render(<App />);
