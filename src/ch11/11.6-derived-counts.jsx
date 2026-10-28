// @id 11.6
// @title Counts calculated during render
// @section 11.5
import { useState, createRoot } from '@wordpress/element'; // Added so this runs on its own
import { Button, TextControl, TextareaControl } from '@wordpress/components'; // Added so this runs on its own
import { __ } from '@wordpress/i18n'; // Added so this runs on its own

// Added so this runs on its own: the fake posts from Chapter 7 (src/data/fake.js).
const fakePosts = [
  { id: 881, title: 'Welcome to the community', excerpt: 'Start here: introduce yourself.', is_pinned: true, author: { name: 'Ada', avatar_url: '/wp-content/plugins/forumwp/img/ada.png' } },
  { id: 880, title: 'Office hours on Thursday', excerpt: 'Bring your setup questions, 4pm.', is_pinned: false, author: { name: 'Tunde', avatar_url: '/wp-content/plugins/forumwp/img/tunde.png' } },
  { id: 879, title: 'How do I change my avatar?', excerpt: 'I cannot find the setting anywhere.', is_pinned: false, author: { name: 'Ada', avatar_url: '/wp-content/plugins/forumwp/img/ada.png' } },
];

// Added so this runs on its own: a short PostCard (Chapter 5), with the Delete button from Exercise 8.2.
// (The avatar image is left out: its file only exists in a WordPress site.)
const PostCard = ({ post, onDelete }) => (
  <article className="fwp-post">
    <strong>{post.title}</strong>
    {post.is_pinned && <span className="fwp-badge">Pinned</span>}
    <div>{post.author.name}: {post.excerpt}</div>
    {onDelete && <Button variant="link" isDestructive onClick={() => onDelete()}>Delete</Button>}
  </article>
);

// Added so this runs on its own: the PostComposer from Chapter 10 (Example 10.7).
const EMPTY = { title: '', body: '' };
const PostComposer = ({ onSubmit }) => {
  const [form, setForm] = useState(EMPTY);
  const set = (field) => (value) => setForm({ ...form, [field]: value });
  const canSubmit = form.title.trim() !== '' && form.title.length <= 120;
  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }
    onSubmit({ title: form.title.trim(), body: form.body });
    setForm(EMPTY);
  };
  return (
    <form className="fwp-composer" onSubmit={handleSubmit} style={{ marginBottom: 16 }}>
      <TextControl label={__('Title', 'forumwp')} value={form.title} onChange={set('title')} __next40pxDefaultSize __nextHasNoMarginBottom />
      <TextareaControl label={__('Post', 'forumwp')} value={form.body} onChange={set('body')} __nextHasNoMarginBottom />
      <Button variant="primary" type="submit" disabled={!canSubmit} __next40pxDefaultSize>{__('Post', 'forumwp')}</Button>
    </form>
  );
};

// Added so this runs on its own: a header that shows the counts.
const SpaceHeader = ({ title, postCount, pinnedCount }) => (
  <h2>{title} <small>{postCount} posts · {pinnedCount} pinned</small></h2>
);
const ME = { name: 'Ada', avatar_url: '/ada.png' }; // Added so this runs on its own
// Added so this runs on its own: the Feed from 11.2.
const Feed = ({ posts, onDelete }) => {
  if (posts.length === 0) {
    return <p className="fwp-empty">No posts yet. Start the conversation!</p>;
  }
  return posts.map((post) => <PostCard key={post.id} post={post} onDelete={() => onDelete(post.id)} />);
};

const SpacePage = () => {
  const [posts, setPosts] = useState(fakePosts);

  const postCount = posts.length;
  const pinnedCount = posts.filter((p) => p.is_pinned).length;

  // ...addPost and deletePost only change posts
  // Added so this runs on its own (from 11.2):
  const addPost = ({ title, body }) => {
    const post = { id: Date.now(), title, excerpt: body.slice(0, 140), author: ME, reactions: 0, is_pinned: false };
    setPosts([post, ...posts]);
  };
  const deletePost = (id) => {
    setPosts(posts.filter((p) => p.id !== id));
  };

  return (
    <>
      <SpaceHeader title="General" postCount={postCount} pinnedCount={pinnedCount} />
      <PostComposer onSubmit={addPost} />
      <Feed posts={posts} onDelete={deletePost} />
    </>
  );
};

// Added so this runs on its own: add and delete posts; the counts are always right.
createRoot(document.getElementById('forumwp-root')).render(<SpacePage />);
