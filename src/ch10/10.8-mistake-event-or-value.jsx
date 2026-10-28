// @id 10.8
// @title Mixing up event and value in onChange (broken)
// @section 10 (Common mistakes)
import { useState, createRoot } from '@wordpress/element'; // Added so this runs on its own
import { TextControl } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: each wrong line from the book in a small component.
const WrongTextControl = () => {
  const [title, setTitle] = useState('');
  return (
    <TextControl label="TextControl with e.target.value" __nextHasNoMarginBottom __next40pxDefaultSize
      value={title} onChange={(e) => setTitle(e.target.value)} />  // WRONG
  );
};

// Added so this runs on its own: the opposite mistake.
const WrongInput = () => {
  const [title, setTitle] = useState('');
  return (
    <p>
      <label>
        Plain input with onChange={'{setTitle}'}:{' '}
        <input value={title} onChange={setTitle} />
      </label>
    </p>
  );
};

// Added so this runs on its own: type one letter in the first field (TypeError in the console),
// then in the second (it shows [object Object]).
createRoot(document.getElementById('forumwp-root')).render(
  <>
    <WrongTextControl />
    <WrongInput />
  </>
);
