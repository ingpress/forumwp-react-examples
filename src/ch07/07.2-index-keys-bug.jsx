// @id 7.2
// @title BROKEN: index keys and the reply box
// @section 7.3
// @click Load new post
import { createRoot } from '@wordpress/element'; // Added so this runs on its own
import { useState } from '@wordpress/element';

const firstPosts = [
  { id: 881, title: 'Welcome to the community' },
  { id: 880, title: 'Office hours on Thursday' },
];

const newPost = { id: 882, title: 'Show us your setup' };

const PostWithReply = ({ post }) => (
  <article className="fwp-post">
    <h3>{post.title}</h3>
    <input type="text" placeholder="Write a reply…" aria-label={`Reply to ${post.title}`} />
  </article>
);

// BROKEN: index keys
// Try it: reload, type "Thanks Ada!" under "Welcome to the community", then click
// "Load new post". The fix is key={post.id}.
const Feed = () => {
  const [posts, setPosts] = useState(firstPosts);

  return (
    <div className="fwp-feed">
      <button type="button" disabled={posts.length > 2} onClick={() => setPosts([newPost, ...posts])}>
        Load new post
      </button>
      {posts.map((post, index) => (
        <PostWithReply key={index} post={post} />
      ))}
    </div>
  );
};

createRoot(document.getElementById('forumwp-root')).render(<Feed />); // Added so this runs on its own
