// @id 16.6
// @title BROKEN: making the effect function itself async
// @section Common mistakes
// @api fake
// @expect warning
// Added so this runs on its own: imports, the client's get(), a Feed and a small SpaceFeed.
import { useState, useEffect, createRoot } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
const get = (path) => apiFetch({ path: '/forumwp/v1' + path });
const Feed = ({ posts }) => posts.map((post) => <article key={post.id} className="fwp-post">{post.title}</article>);

const SpaceFeed = ({ spaceId }) => {
  const [posts, setPosts] = useState([]);

useEffect(async () => {
  const page = await get(`/spaces/${spaceId}/posts`);
  setPosts(page.items);
}, [spaceId]);

  return <Feed posts={posts} />;
};

// Added so this runs on its own. The data loads, and the console shows React's warning
// "useEffect must not return anything besides a function, which is used for clean-up."
createRoot(document.getElementById('forumwp-root')).render(<SpaceFeed spaceId={1} />);
