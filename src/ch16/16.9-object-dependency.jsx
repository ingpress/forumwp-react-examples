// @id 16.9
// @title BROKEN: an object in the dependency array
// @section Common mistakes
// @api fake
// Added so this runs on its own: imports, the client's get(), and a SpaceFeed around the
// book's lines. Watch the console below: the same request is sent again and again.
import { useState, useEffect, createRoot } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
const get = (path, query = {}) => apiFetch({ path: addQueryArgs('/forumwp/v1' + path, query) });

let requests = 0; // Added so this runs on its own: counts the requests

const SpaceFeed = ({ spaceId }) => {
  const [posts, setPosts] = useState([]);

const query = { per_page: 10 };

useEffect(() => {
  // ... get(`/spaces/${spaceId}/posts`, query) and set state
  requests++; // Added so this runs on its own
  get(`/spaces/${spaceId}/posts`, query).then((page) => setPosts(page.items)); // Added so this runs on its own
}, [spaceId, query]);

  return <p>{posts.length} posts loaded. Requests so far: {requests}</p>;
};

createRoot(document.getElementById('forumwp-root')).render(<SpaceFeed spaceId={1} />);
