// @id 8.3
// @title A real ForumWP reaction button
// @section 8.3
// @click Like
import { createRoot } from '@wordpress/element'; // Added so this runs on its own
import { useState } from '@wordpress/element';
import { Button } from '@wordpress/components';

const ReactionButton = ({ initialCount, initiallyReacted = false }) => {
  const [count, setCount] = useState(initialCount);
  const [reacted, setReacted] = useState(initiallyReacted);

  const toggle = () => {
    if (reacted) {
      setReacted(false);
      setCount(count - 1);
    } else {
      setReacted(true);
      setCount(count + 1);
    }
  };

  return (
    <Button
      variant={reacted ? 'primary' : 'secondary'}
      isPressed={reacted}
      onClick={toggle}
      __next40pxDefaultSize
    >
      Like {count}
    </Button>
  );
};

// Added so this runs on its own: a fake post, and a PostCard-like wrapper for the usage line.
const post = { id: 881, title: 'Welcome to the community', reactions: 12, reacted_by_me: false };
createRoot(document.getElementById('forumwp-root')).render(
  <article className="fwp-post">
    <h3>{post.title}</h3>
    {/* Used in PostCard: */}
    <ReactionButton initialCount={post.reactions} initiallyReacted={post.reacted_by_me} />
  </article>
);
