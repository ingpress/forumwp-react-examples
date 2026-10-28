// @id 9.3
// @title Batching: many setters, one render
// @section 9.4
// @click Like
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: a reaction button around the book's toggle, logging each render.
const ReactionButton = () => {
  const [count, setCount] = useState(12);
  const [reacted, setReacted] = useState(false);

  const toggle = () => {
    setReacted(true);    // queued
    setCount(count + 1); // queued
    // no render has happened yet
    console.log('handler finished'); // Added
  };
  // handler finished: React applies both, then renders once

  console.log('render: reacted', reacted, 'count', count); // Added
  return <Button variant={reacted ? 'primary' : 'secondary'} onClick={toggle} __next40pxDefaultSize>Like {count}</Button>;
};
createRoot(document.getElementById('forumwp-root')).render(<ReactionButton />);
