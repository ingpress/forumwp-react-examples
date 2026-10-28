// @id 5.16
// @title Mistake: reading a prop the parent didn't pass
// @section 5.4
// @expect error
import { createRoot } from '@wordpress/element'; // Added so this runs on its own

// Added so this runs on its own: the PostCard from 5.4 (with a plain img for the avatar).
const PostCard = ({ post }) => (
  <article className="fwp-post">
    <header className="fwp-post__header">
      <img className="fwp-avatar" src={post.author.avatar_url} width={40} height={40} alt="" />
      <strong>{post.author.name}</strong>
    </header>
    <h3>{post.title}</h3>
    <p>{post.excerpt}</p>
  </article>
);

createRoot(document.getElementById('forumwp-root')).render(
  <PostCard />           // forgot post={...}
);
