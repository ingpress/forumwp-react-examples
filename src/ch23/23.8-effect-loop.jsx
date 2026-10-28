// @id 23.8
// @title Broken: an effect that sets the state it depends on
// @section 23.3
// @expect error
import { createRoot, useState, useEffect } from '@wordpress/element'; // Added so this runs on its own

const SpaceFeed = ({ spaceId }) => { // Added so this runs on its own: the component around the book's lines.
  const [filters, setFilters] = useState({ tag: 0 });

  useEffect(() => {
    setFilters({ ...filters, space: spaceId }); // new object every time
  }, [filters, spaceId]);

  // Added so this runs on its own: count the renders, and stop the loop after 200 so your browser stays usable.
  window.renders = (window.renders || 0) + 1;
  if (window.renders >= 200) {
    throw new Error('Stopped after 200 renders: the effect keeps changing filters, which runs the effect again.');
  }
  return <p>Renders so far: {window.renders}</p>;
};

createRoot(document.getElementById('forumwp-root')).render(<SpaceFeed spaceId={12} />);
