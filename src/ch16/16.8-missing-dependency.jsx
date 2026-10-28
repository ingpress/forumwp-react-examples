// @id 16.8
// @title BROKEN: leaving spaceId out of the dependency array
// @section Common mistakes
// @api fake
// @click Help
// Added so this runs on its own: imports, the client's get(), and a SpaceFeed whose effect
// has [] instead of [spaceId], under two buttons that switch spaces.
import { useState, useEffect, createRoot } from '@wordpress/element';
import { Button, Spinner } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
const get = (path) => apiFetch({ path: '/forumwp/v1' + path });

const SpaceFeed = ({ spaceId }) => {
  const [posts, setPosts] = useState(null);

useEffect(() => {
  // ... loads `/spaces/${spaceId}/posts`
  get(`/spaces/${spaceId}/posts`).then((page) => setPosts(page.items)); // Added so this runs on its own
}, []);

  if (!posts) {
    return <Spinner />;
  }
  return posts.slice(0, 3).map((post) => <p key={post.id} className="fwp-post">{post.title}</p>);
};

// In the pretend API, Help is space 2.
const App = () => {
  const [spaceId, setSpaceId] = useState(1);
  return (
    <>
      <p>
        <Button variant="secondary" onClick={() => setSpaceId(1)}>General</Button>{' '}
        <Button variant="secondary" onClick={() => setSpaceId(2)}>Help</Button>
      </p>
      <h2>{spaceId === 1 ? 'General' : 'Help'} (space {spaceId})</h2>
      <SpaceFeed spaceId={spaceId} />
    </>
  );
};

createRoot(document.getElementById('forumwp-root')).render(<App />);
