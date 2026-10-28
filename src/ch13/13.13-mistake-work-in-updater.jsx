// @id 13.13
// @title Doing things inside an updater function (broken)
// @section 13 (Common mistakes)
// @api fake
// @expect error
// @click Post
import { useState, StrictMode, createRoot } from '@wordpress/element'; // Added so this runs on its own
import apiFetch from '@wordpress/api-fetch'; // Added so this runs on its own
import { Button } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: a feed whose Post button uses the wrong updater.
// Watch the fake API's log: every click sends two requests, because StrictMode calls the
// updater twice. (In React 18 the very first click sends one: React works out the first
// update straight away, outside the render. From the second click on, they come in pairs.
// The fake API has no POST /forumwp/v1/posts route, so each request also
// answers 404 and the console shows the failed promise.)
const Feed = () => {
  const [posts, setPosts] = useState([]);
  const addPost = () => {
    const post = { id: Date.now(), title: 'Hello' };
setPosts((current) => {
  apiFetch({ path: '/forumwp/v1/posts', method: 'POST', data: post });   // WRONG
  return [post, ...current];
});
  };
  return (
    <>
      <Button variant="primary" onClick={addPost}>Post</Button>
      <ul>{posts.map((p) => <li key={p.id}>{p.title}</li>)}</ul>
    </>
  );
};

createRoot(document.getElementById('forumwp-root')).render(
  <StrictMode>
    <Feed />
  </StrictMode>
);
