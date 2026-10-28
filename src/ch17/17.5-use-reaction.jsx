// @id 17.5
// @title useReaction: a hook that changes things
// @section 17.6
// @api fake
// @click Like
// src/hooks/useReaction.js
import { useState } from '@wordpress/element';
// In the book: import { post, remove } from '../api/client';

// Added so this runs on its own: post() and remove() from the client (Chapter 16.1), inlined.
import apiFetch from '@wordpress/api-fetch';
const post = (path, data = {}) => apiFetch({ path: '/forumwp/v1' + path, method: 'POST', data });
const remove = (path) => apiFetch({ path: '/forumwp/v1' + path, method: 'DELETE' });

const useReaction = (item) => {
  const [count, setCount] = useState(item.reactionCount);
  const [reacted, setReacted] = useState(item.reacted);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const toggle = async () => {
    const before = { count, reacted };
    const next = !reacted;

    setReacted(next);
    setCount(count + (next ? 1 : -1));
    setSaving(true);
    setError(null);

    try {
      const result = next
        ? await post(`/posts/${item.id}/reactions`)
        : await remove(`/posts/${item.id}/reactions`);
      setCount(result.reactionCount);
      setReacted(result.reacted);
    } catch (err) {
      setCount(before.count);
      setReacted(before.reacted);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return { count, reacted, saving, error, toggle };
};

import { Button } from '@wordpress/components';
// In the book: import { useReaction } from '../hooks/useReaction';

const ReactionButton = ({ post }) => {
  const { count, reacted, saving, error, toggle } = useReaction(post);

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

// Added so this runs on its own: a PostCard to hold the book's "In PostCard:" line,
// shown twice for the same post. Like one: the other copy doesn't change (17.3).
import { createRoot } from '@wordpress/element';
const PostCard = ({ post }) => (
  <article className="fwp-post">
    <p><strong>{post.title}</strong></p>
{/* In PostCard: */}
<ReactionButton post={post} />
  </article>
);

const first = await apiFetch({ path: '/forumwp/v1/posts/2' });
createRoot(document.getElementById('forumwp-root')).render(
  <>
    <PostCard post={first} />
    <PostCard post={first} />
  </>
);
