// @id 5.6
// @title Passing whole objects
// @section 5.4
import { createRoot } from '@wordpress/element'; // Added so this runs on its own

// Added so this runs on its own: there is no /ada.png in the sandbox, so a small drawn avatar stands in for it.
const adaPng = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%233858e9'/%3E%3Ctext x='20' y='26' font-size='18' text-anchor='middle' fill='white' font-family='sans-serif'%3EA%3C/text%3E%3C/svg%3E";

// Added so this runs on its own: the Avatar from 5.2.
const Avatar = ({ src, size = 40, alt = '' }) => (
  <img className="fwp-avatar" src={src} width={size} height={size} alt={alt} />
);

const post = {
  id: 881,
  title: 'Welcome to the community',
  excerpt: 'Start here: introduce yourself.',
  is_pinned: true,
  author: { name: 'Ada', avatar_url: adaPng /* the book: '/ada.png' */ },
};

const PostCard = ({ post }) => (
  <article className="fwp-post">
    <header className="fwp-post__header">
      <Avatar src={post.author.avatar_url} />
      <strong>{post.author.name}</strong>
    </header>
    <h3>{post.title}</h3>
    <p>{post.excerpt}</p>
  </article>
);

// The SpaceCard that takes a space object, from the end of 5.4.
const SpaceCard = ({ space }) => (
  <div className="fwp-space-card">
    <h3>{space.name}</h3>
    <p>{space.description}</p>
    <small>{space.memberCount} members</small>
  </div>
);

// Added so this runs on its own
const general = { name: 'General', description: 'Introduce yourself and say hi.', memberCount: 1280 };
const App = () => (
  <>
    <PostCard post={post} />
    <SpaceCard space={general} />
  </>
);
createRoot(document.getElementById('forumwp-root')).render(<App />);
