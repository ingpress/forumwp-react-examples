// @id 12.11
// @title Calculate it, don't copy it with an effect
// @section 12.6
// @click Show pinned
import { useState, useEffect, createRoot } from '@wordpress/element'; // Added so this runs on its own
import { Button } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: a few posts and a short PostCard (Chapters 5 and 7).
const fakePosts = [
  { id: 881, title: 'Welcome to the community', is_pinned: true },
  { id: 880, title: 'Office hours on Thursday', is_pinned: false },
  { id: 879, title: 'How do I change my avatar?', is_pinned: false },
  { id: 878, title: 'House rules', is_pinned: true },
];
const PostCard = ({ post }) => (
  <article className="fwp-post">
    {post.title}
    {post.is_pinned && <span className="fwp-badge">Pinned</span>}
  </article>
);

// Added so this runs on its own: both versions keep the book's name, Feed. The
// (() => { ... return Feed; })() wrapper only lets the two live on one page.
const FeedWithEffect = (() => {
// UNNECESSARY
const Feed = ({ posts, filter }) => {
  const [visible, setVisible] = useState([]);

  useEffect(() => {
    setVisible(filter === 'pinned' ? posts.filter((p) => p.is_pinned) : posts);
  }, [posts, filter]);

  return visible.map((post) => <PostCard key={post.id} post={post} />);
};
  return Feed; // Added so this runs on its own
})();

// Added so this runs on its own
const FeedCalculated = (() => {
const Feed = ({ posts, filter }) => {
  const visible = filter === 'pinned' ? posts.filter((p) => p.is_pinned) : posts;
  return visible.map((post) => <PostCard key={post.id} post={post} />);
};
  return Feed; // Added so this runs on its own
})();

// Added so this runs on its own: both feeds show the same list, but the effect version
// draws an empty list first, then the old list for one render after each filter change.
const App = () => {
  const [filter, setFilter] = useState('all');
  return (
    <>
      <Button variant="secondary" onClick={() => setFilter(filter === 'all' ? 'pinned' : 'all')}>
        {filter === 'all' ? 'Show pinned' : 'Show all'}
      </Button>
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1 }}><h3>With an effect</h3><FeedWithEffect posts={fakePosts} filter={filter} /></div>
        <div style={{ flex: 1 }}><h3>Calculated</h3><FeedCalculated posts={fakePosts} filter={filter} /></div>
      </div>
    </>
  );
};

createRoot(document.getElementById('forumwp-root')).render(<App />);
