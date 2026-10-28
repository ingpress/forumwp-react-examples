// @id 12.18
// @title A Feed with an effect it doesn't need (Exercise 12.3)
// @section 12 (Exercises)
import { useState, useEffect, createRoot } from '@wordpress/element'; // Added so this runs on its own

// Added so this runs on its own: a few posts and a short PostCard (Chapters 5 and 7).
const fakePosts = [
  { id: 881, title: 'Welcome to the community', is_pinned: false },
  { id: 880, title: 'House rules', is_pinned: true },
  { id: 879, title: 'How do I change my avatar?', is_pinned: false },
];
const PostCard = ({ post }) => (
  <article className="fwp-post">
    {post.title}
    {post.is_pinned && <span className="fwp-badge">Pinned</span>}
  </article>
);

const Feed = ({ posts }) => {
  const [pinned, setPinned] = useState([]);
  const [others, setOthers] = useState([]);
  useEffect(() => {
    setPinned(posts.filter((p) => p.is_pinned));
    setOthers(posts.filter((p) => !p.is_pinned));
  }, [posts]);
  return [...pinned, ...others].map((post) => (
    <PostCard key={post.id} post={post} />
  ));
};

// Added so this runs on its own: rewrite Feed without useEffect.
createRoot(document.getElementById('forumwp-root')).render(<Feed posts={fakePosts} />);
