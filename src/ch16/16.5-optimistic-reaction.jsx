// @id 16.5
// @title An optimistic Like button with rollback
// @section 16.7
// @api fake
// @click Like
import { useState } from '@wordpress/element';
import { Button } from '@wordpress/components';
// In the book: import { post, remove } from '../api/client';

// Added so this runs on its own: post() and remove() from the client in 16.1, inlined.
import apiFetch from '@wordpress/api-fetch';
const post = (path, data = {}) => apiFetch({ path: '/forumwp/v1' + path, method: 'POST', data });
const remove = (path) => apiFetch({ path: '/forumwp/v1' + path, method: 'DELETE' });

const ReactionButton = ({ postId, initialCount, initiallyReacted = false }) => {
  const [count, setCount] = useState(initialCount);
  const [reacted, setReacted] = useState(initiallyReacted);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const toggle = async () => {
    const before = { count, reacted };
    const next = !reacted;

    // 1. Change the screen now.
    setReacted(next);
    setCount(count + (next ? 1 : -1));
    setSaving(true);
    setError(null);

    try {
      // 2. Tell the server.
      const result = next
        ? await post(`/posts/${postId}/reactions`)
        : await remove(`/posts/${postId}/reactions`);
      // 3. Use the server's numbers.
      setCount(result.reactionCount);
      setReacted(result.reacted);
    } catch (err) {
      // 4. It failed: put things back.
      setCount(before.count);
      setReacted(before.reacted);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Button
        variant={reacted ? 'primary' : 'secondary'}
        isPressed={reacted}
        onClick={toggle}
        disabled={saving}
        __next40pxDefaultSize
      >
        Like {count}
      </Button>
      {error && (
        <span className="fwp-error" role="alert">
          {error}
        </span>
      )}
    </>
  );
};

// Added so this runs on its own: a PostCard to hold the book's "In PostCard:" lines.
const PostCard = ({ post }) => (
  <article className="fwp-post">
    <p><strong>{post.title}</strong></p>
{/* In PostCard: */}
<ReactionButton
  postId={post.id}
  initialCount={post.reactionCount}
  initiallyReacted={post.reacted}
/>
  </article>
);

// Added so this runs on its own: one real post from the pretend API, and one that doesn't
// exist (id 999999), so clicking its button shows the rollback and the server's message.
import { createRoot } from '@wordpress/element';
const realPost = await apiFetch({ path: '/forumwp/v1/posts/2' });
const missingPost = { id: 999999, title: 'A post that has been deleted (the Like fails)', reactionCount: 12, reacted: false };

createRoot(document.getElementById('forumwp-root')).render(
  <>
    <PostCard post={realPost} />
    <PostCard post={missingPost} />
  </>
);
