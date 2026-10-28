// @id 10.11
// @title A field you can't type in (broken)
// @section 10 (Common mistakes)
// @expect warning
import { useState, createRoot } from '@wordpress/element'; // Added so this runs on its own

// Added so this runs on its own
const ReadOnlyField = () => {
  const title = 'Hell';
  return (
    <input value={title} />                       // WRONG: no onChange
  );
};

// Added so this runs on its own
const StartsUndefined = () => {
  const [title, setTitle] = useState();         // WRONG: starts as undefined
  return (
    <input value={title} onChange={(e) => setTitle(e.target.value)} />
  );
};

// Added so this runs on its own: the first warning appears straight away; type in the
// second field to see the other one.
createRoot(document.getElementById('forumwp-root')).render(
  <>
    <p>No onChange: <ReadOnlyField /></p>
    <p>Starts as undefined: <StartsUndefined /></p>
  </>
);
