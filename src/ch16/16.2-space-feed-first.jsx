// @id 16.2
// @title Loading the feed in an effect (first version)
// @section 16.3
// @api fake
import { useState, useEffect } from '@wordpress/element';
import { Spinner, Notice } from '@wordpress/components';
// In the book: import { get } from '../api/client';

// Added so this runs on its own: get() from src/api/client.js (16.1), inlined.
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
const get = (path, query = {}) => apiFetch({ path: addQueryArgs('/forumwp/v1' + path, query) });

// Added so this runs on its own: a simple Feed (Chapter 7).
const Feed = ({ posts }) => (
  <div className="fwp-feed">
    {posts.map((post) => (
      <article key={post.id} className="fwp-post">
        <strong>{post.title}</strong> by {post.author.name}
      </article>
    ))}
  </div>
);

const SpaceFeed = ({ spaceId }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const page = await get(`/spaces/${spaceId}/posts`);
        setPosts(page.items);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [spaceId]);

  if (loading) {
    return <Spinner />;
  }
  if (error) {
    return (
      <Notice status="error" isDismissible={false}>
        {error.message}
      </Notice>
    );
  }
  if (posts.length === 0) {
    return <p className="fwp-empty">No posts yet. Start the conversation!</p>;
  }
  return <Feed posts={posts} />;
};

// Added so this runs on its own: the two buttons from 16.5, to see the race.
// General is made slow (2 seconds). Click General, then quickly Help: Help's posts
// appear, then General's replace them under the "Help" heading. In the pretend API, Help is space 2.
import { createRoot } from '@wordpress/element';
import { Button } from '@wordpress/components';

const fakeFetch = window.fetch;
window.fetch = async (input, init) => {
  if (String(input).includes('/spaces/1/posts')) {
    await new Promise((r) => setTimeout(r, 2000));
  }
  return fakeFetch(input, init);
};

const App = () => {
  const [spaceId, setSpaceId] = useState(1);
  return (
    <>
      <p>
        <Button variant={spaceId === 1 ? 'primary' : 'secondary'} onClick={() => setSpaceId(1)}>General (slow)</Button>{' '}
        <Button variant={spaceId === 2 ? 'primary' : 'secondary'} onClick={() => setSpaceId(2)}>Help (fast)</Button>
      </p>
      <h2>{spaceId === 1 ? 'General' : 'Help'}</h2>
      <SpaceFeed spaceId={spaceId} />
    </>
  );
};

createRoot(document.getElementById('forumwp-root')).render(<App />);
