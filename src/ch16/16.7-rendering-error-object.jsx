// @id 16.7
// @title BROKEN: rendering the error object
// @section Common mistakes
// @api fake
// @expect error
// Added so this runs on its own: SpaceFeed from 16.3, with the mistake in its error branch,
// loading a space that doesn't exist (99) so the request fails.
import { useState, useEffect, createRoot } from '@wordpress/element';
import { Spinner, Notice } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
const get = (path) => apiFetch({ path: '/forumwp/v1' + path });

const SpaceFeed = ({ spaceId }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
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
  return <Notice status="error">{error}</Notice>;
}
  return posts.map((post) => <p key={post.id}>{post.title}</p>);
};

createRoot(document.getElementById('forumwp-root')).render(<SpaceFeed spaceId={99} />);
