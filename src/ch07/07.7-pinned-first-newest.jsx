// @id 7.7
// @title Pinned first, then newest
// @section 7.7
import { createRoot } from '@wordpress/element'; // Added so this runs on its own

// Added so this runs on its own: the avatar files do not exist in the sandbox, so small drawn avatars stand in for them.
const drawnAvatar = (letter) => `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%233858e9'/%3E%3Ctext x='20' y='26' font-size='18' text-anchor='middle' fill='white' font-family='sans-serif'%3E${letter}%3C/text%3E%3C/svg%3E`;

// From src/data/fake.js (7.1).
const fakePosts = [
  {
    id: 881,
    title: 'Welcome to the community',
    excerpt: 'Start here: introduce yourself.',
    is_pinned: true,
    author: { name: 'Ada', avatar_url: drawnAvatar('A') /* the book: '/wp-content/plugins/forumwp/img/ada.png' */ },
  },
  {
    id: 880,
    title: 'Office hours on Thursday',
    excerpt: 'Bring your setup questions, 4pm.',
    is_pinned: false,
    author: { name: 'Tunde', avatar_url: drawnAvatar('T') /* the book: '/wp-content/plugins/forumwp/img/tunde.png' */ },
  },
  {
    id: 879,
    title: 'How do I change my avatar?',
    excerpt: 'I cannot find the setting anywhere.',
    is_pinned: false,
    author: { name: 'Ada', avatar_url: drawnAvatar('A') /* the book: '/wp-content/plugins/forumwp/img/ada.png' */ },
  },
];

// Added so this runs on its own: Avatar and PostCard from Chapter 5 (instead of import PostCard from './PostCard').
const Avatar = ({ src, size = 40, alt = '' }) => (
  <img className="fwp-avatar" src={src} width={size} height={size} alt={alt} />
);
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

const orderFeed = (posts) =>
  posts.toSorted(
    (a, b) => Number(b.is_pinned) - Number(a.is_pinned) || b.id - a.id
  );

const Feed = ({ posts }) => {
  const ordered = orderFeed(posts);

  if (ordered.length === 0) {
    return <p className="fwp-empty">No posts yet. Start the conversation!</p>;
  }

  return (
    <div className="fwp-feed">
      {ordered.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};

// Added so this runs on its own: the posts arrive oldest first; the feed puts them in order.
const oldestFirst = [...fakePosts].reverse();
createRoot(document.getElementById('forumwp-root')).render(<Feed posts={oldestFirst} />);
console.log('the original array is unchanged:', oldestFirst.map((p) => p.id).join(', '));
