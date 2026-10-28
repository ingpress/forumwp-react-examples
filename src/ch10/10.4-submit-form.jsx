// @id 10.4
// @title Submitting the composer with onSubmit
// @section 10.4
// @click Post
import { useState } from '@wordpress/element';
import { Button, TextControl, TextareaControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { createRoot } from '@wordpress/element'; // Added so this runs on its own

const PostComposer = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ title, body });
  };

  return (
    <form className="fwp-composer" onSubmit={handleSubmit}>
      <TextControl
        label={__('Title', 'forumwp')}
        value={title}
        onChange={setTitle}
        __next40pxDefaultSize
        __nextHasNoMarginBottom
      />
      <TextareaControl
        label={__('Post', 'forumwp')}
        value={body}
        onChange={setBody}
        __nextHasNoMarginBottom
      />
      <Button variant="primary" type="submit" __next40pxDefaultSize>
        {__('Post', 'forumwp')}
      </Button>
    </form>
  );
};

// For now, the page only logs what the composer sends:
const SpacePage = () => (
  <PostComposer onSubmit={(post) => console.log('new post', post)} />
);

// Added so this runs on its own: type a title and a post, then press Post (or Enter in the title).
createRoot(document.getElementById('forumwp-root')).render(<SpacePage />);
