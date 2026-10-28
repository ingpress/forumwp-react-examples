// @id 8.4
// @title BROKEN: changing state in place
// @section 8.4
// @click Add a post
import { createRoot } from '@wordpress/element'; // Added so this runs on its own
import { useState } from '@wordpress/element'; // Added so this runs on its own

// BROKEN: the new post doesn't appear
const Feed = () => {
  const [posts, setPosts] = useState([
    { id: 1, title: 'Welcome to the community' },
    { id: 2, title: 'How do I change my avatar?' },
  ]);

  const addPost = () => {
    posts.push({ id: 3, title: 'Hello from Ada' });
    setPosts(posts);
    console.log(posts); // Added: the array does hold three posts
  };

  return (
    <>
      <button onClick={addPost}>Add a post</button>
      <ul>
        {posts.map((p) => <li key={p.id}>{p.title}</li>)}
      </ul>
    </>
  );
};

createRoot(document.getElementById('forumwp-root')).render(<Feed />); // Added so this runs on its own
