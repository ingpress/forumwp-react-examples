// @id 17.8
// @title BROKEN: a hook's returned object in a dependency array
// @section Common mistakes
// @api fake
// @click Re-render
// Added so this runs on its own: useReaction from 17.6, inlined (short form), and a
// component around the book's lines with a button that only re-renders it.
import { useState, useEffect, createRoot } from '@wordpress/element';
import { Button } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';

const useReaction = (item) => {
  const [count, setCount] = useState(item.reactionCount);
  const [reacted, setReacted] = useState(item.reacted);
  const toggle = async () => {
    const result = await apiFetch({ path: `/forumwp/v1/posts/${item.id}/reactions`, method: reacted ? 'DELETE' : 'POST' });
    setCount(result.reactionCount);
    setReacted(result.reacted);
  };
  return { count, reacted, toggle };
};

const PostCard = ({ post }) => {
  const [renders, setRenders] = useState(1);

const reaction = useReaction(post);

useEffect(() => {
  console.log('reaction changed');
}, [reaction]);

  return (
    <p>
      Like count: {reaction.count}. Renders: {renders}.{' '}
      <Button variant="secondary" onClick={() => setRenders(renders + 1)}>Re-render (nothing about the reaction changes)</Button>
    </p>
  );
};

createRoot(document.getElementById('forumwp-root')).render(
  <PostCard post={{ id: 2, reactionCount: 7, reacted: false }} />
);
