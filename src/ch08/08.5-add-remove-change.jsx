// @id 8.5
// @title Add, remove and change one, with new arrays
// @section 8.4
// @click Add a post
import { createRoot } from '@wordpress/element'; // Added so this runs on its own
import { useState } from '@wordpress/element'; // Added so this runs on its own

// Added so this runs on its own: the feed from 8.4 with the fixed addPost, plus one button
// for each of the three patterns.
const Feed = () => {
  const [posts, setPosts] = useState([
    { id: 1, title: 'Welcome to the community' },
    { id: 2, title: 'How do I change my avatar?' },
  ]);

  const addPost = () => {
    setPosts([...posts, { id: 3, title: 'Hello from Ada' }]);
  };

  const newPost = { id: Date.now(), title: 'A new post at the top' }; // Added
  const deletedId = 1; // Added

  return (
    <>
      <button onClick={addPost}>Add a post</button>{' '}
      {/* ADD: new array with the extra item (at the start, like a feed) */}
      <button onClick={() => setPosts([newPost, ...posts])}>Add at the top</button>{' '}
      {/* REMOVE: new array without the item */}
      <button onClick={() => setPosts(posts.filter((p) => p.id !== deletedId))}>Remove post 1</button>{' '}
      {/* CHANGE ONE: new array where one item is replaced by an edited copy */}
      <button onClick={() => setPosts(posts.map((p) => (p.id === 2 ? { ...p, title: 'Edited title' } : p)))}>Edit post 2</button>
      <ul>
        {posts.map((p) => <li key={p.id}>{p.title}</li>)}
      </ul>
    </>
  );
};

createRoot(document.getElementById('forumwp-root')).render(<Feed />);
