// @id 11.11
// @title A callback prop that was never passed (broken)
// @section 11 (Common mistakes)
// @expect error
// @click Post
import { useState, createRoot } from '@wordpress/element'; // Added so this runs on its own
import { Button, TextControl, TextareaControl } from '@wordpress/components'; // Added so this runs on its own
import { __ } from '@wordpress/i18n'; // Added so this runs on its own

// Added so this runs on its own: the PostComposer from Example 10.4.
const PostComposer = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ title, body });
  };
  return (
    <form className="fwp-composer" onSubmit={handleSubmit}>
      <TextControl label={__('Title', 'forumwp')} value={title} onChange={setTitle} __next40pxDefaultSize __nextHasNoMarginBottom />
      <TextareaControl label={__('Post', 'forumwp')} value={body} onChange={setBody} __nextHasNoMarginBottom />
      <Button variant="primary" type="submit" __next40pxDefaultSize>{__('Post', 'forumwp')}</Button>
    </form>
  );
};

// Added so this runs on its own: press Post and the console shows
// "TypeError: onSubmit is not a function".
createRoot(document.getElementById('forumwp-root')).render(
<PostComposer />   // forgot onSubmit
);
