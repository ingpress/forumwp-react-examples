// @id 10.9
// @title Forgetting preventDefault() (broken)
// @section 10 (Common mistakes)
import { useState, createRoot } from '@wordpress/element'; // Added so this runs on its own
import { Button, TextControl } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: the composer from 10.4 with the broken handleSubmit.
const PostComposer = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const body = '';

  const handleSubmit = () => {
    onSubmit({ title, body });   // WRONG: no event.preventDefault()
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextControl label="Title" value={title} onChange={setTitle} __next40pxDefaultSize __nextHasNoMarginBottom />
      <Button variant="primary" type="submit" __next40pxDefaultSize>Post</Button>
    </form>
  );
};

// Added so this runs on its own: type a title and press Post. The page reloads and the text is gone.
createRoot(document.getElementById('forumwp-root')).render(
  <PostComposer onSubmit={(post) => console.log('new post', post)} />
);
