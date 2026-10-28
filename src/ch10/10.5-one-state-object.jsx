// @id 10.5
// @title One state object for the whole form
// @section 10.5
// @click Post
import { useState, createRoot } from '@wordpress/element'; // Added so this runs on its own
import { Button, TextControl, TextareaControl } from '@wordpress/components'; // Added so this runs on its own
import { __ } from '@wordpress/i18n'; // Added so this runs on its own

const EMPTY = { title: '', body: '' };

const PostComposer = ({ onSubmit }) => {
  const [form, setForm] = useState(EMPTY);

  const set = (field) => (value) => setForm({ ...form, [field]: value });

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(form);
  };

  return (
    <form className="fwp-composer" onSubmit={handleSubmit}>
      <TextControl
        label={__('Title', 'forumwp')}
        value={form.title}
        onChange={set('title')}
        __next40pxDefaultSize
        __nextHasNoMarginBottom
      />
      <TextareaControl
        label={__('Post', 'forumwp')}
        value={form.body}
        onChange={set('body')}
        __nextHasNoMarginBottom
      />
      {/* ...the same Button as before */}
      {/* Added so this runs on its own: the Button from Example 10.4 */}
      <Button variant="primary" type="submit" __next40pxDefaultSize>
        {__('Post', 'forumwp')}
      </Button>
    </form>
  );
};

// Added so this runs on its own
createRoot(document.getElementById('forumwp-root')).render(
  <PostComposer onSubmit={(post) => console.log('new post', post)} />
);
