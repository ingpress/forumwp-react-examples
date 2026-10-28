// @id 8.6
// @title When the new value depends on the old one
// @section 8.5
// @click Like twice
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own

// Added so this runs on its own: each likeTwice from 8.5 inside its own button component.
const LikeTwiceWithValues = () => {
  const [count, setCount] = useState(12);

  const likeTwice = () => {
    setCount(count + 1);
    setCount(count + 1);
  };

  return <p><button onClick={likeTwice}>Like twice (values)</button> {count}</p>;
};

const LikeTwiceWithFunctions = () => {
  const [count, setCount] = useState(12);

  const likeTwice = () => {
    setCount((current) => current + 1);
    setCount((current) => current + 1);
  };

  return <p><button onClick={likeTwice}>Like twice (functions)</button> {count}</p>;
};

// The first button adds one per click, the second adds two.
createRoot(document.getElementById('forumwp-root')).render(
  <>
    <LikeTwiceWithValues />
    <LikeTwiceWithFunctions />
  </>
);
