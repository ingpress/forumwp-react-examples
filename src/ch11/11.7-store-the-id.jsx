// @id 11.7
// @title Store the id, not a copy
// @section 11.5
import { useState, createRoot } from '@wordpress/element'; // Added so this runs on its own
import { Button } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: two side panels, one storing a copy and one storing the id.
// Open a post in both, then click "Edit titles": only the id version shows the new title.
// "Delete the first post" closes only the id version's panel.
const firstPosts = [
  { id: 881, title: 'Welcome to the community' },
  { id: 880, title: 'Office hours on Thursday' },
];

// Added so this runs on its own
const Panel = ({ label, posts, onPick, selectedPost }) => (
  <div className="fwp-card">
    <strong>{label}</strong>
    <div>{posts.map((p) => <Button key={p.id} variant="link" onClick={() => onPick(p)}>{p.title}</Button>)}</div>
    <p>Panel: {selectedPost ? selectedPost.title : '(nothing open)'}</p>
  </div>
);

// Added so this runs on its own
const CopyVersion = ({ posts }) => {
// AVOID: a copy of the post object
const [selectedPost, setSelectedPost] = useState(null);

  return <Panel label="AVOID: a copy of the post" posts={posts} onPick={setSelectedPost} selectedPost={selectedPost} />; // Added so this runs on its own
};

// Added so this runs on its own
const IdVersion = ({ posts }) => {
// BETTER: the id, and find the post when you need it
const [selectedId, setSelectedId] = useState(null);
const selectedPost = posts.find((p) => p.id === selectedId) ?? null;

  return <Panel label="BETTER: the id" posts={posts} onPick={(p) => setSelectedId(p.id)} selectedPost={selectedPost} />; // Added so this runs on its own
};

// Added so this runs on its own
const SpacePage = () => {
  const [posts, setPosts] = useState(firstPosts);
  return (
    <>
      <CopyVersion posts={posts} />
      <IdVersion posts={posts} />
      <Button variant="secondary" onClick={() => setPosts(posts.map((p) => ({ ...p, title: p.title + ' (edited)' })))}>Edit titles</Button>{' '}
      <Button variant="secondary" isDestructive onClick={() => setPosts(posts.slice(1))}>Delete the first post</Button>
    </>
  );
};

createRoot(document.getElementById('forumwp-root')).render(<SpacePage />); // Added so this runs on its own
