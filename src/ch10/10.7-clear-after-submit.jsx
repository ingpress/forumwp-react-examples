// @id 10.7
// @title Clearing the form after submitting
// @section 10.7
import { useState, createRoot } from '@wordpress/element'; // Added so this runs on its own
import { Button, TextControl, TextareaControl } from '@wordpress/components'; // Added so this runs on its own
import { __ } from '@wordpress/i18n'; // Added so this runs on its own

// Added so this runs on its own: the composer from Example 10.6, with the new handleSubmit below.
const EMPTY = { title: '', body: '' };
const TITLE_MAX = 120;

const PostComposer = ({ onSubmit }) => {
  const [form, setForm] = useState(EMPTY);
  const set = (field) => (value) => setForm({ ...form, [field]: value });
  const titleTooLong = form.title.length > TITLE_MAX;
  const canSubmit = form.title.trim() !== '' && !titleTooLong;

  // The book's code for 10.7:
  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }
    onSubmit({ title: form.title.trim(), body: form.body });
    setForm(EMPTY);
  };

  // Added so this runs on its own (the same form as 10.6)
  return (
    <form className="fwp-composer" onSubmit={handleSubmit}>
      <TextControl
        label={__('Title', 'forumwp')}
        value={form.title}
        onChange={set('title')}
        help={titleTooLong ? __('Keep the title under 120 characters.', 'forumwp') : null}
        __next40pxDefaultSize
        __nextHasNoMarginBottom
      />
      <TextareaControl
        label={__('Post', 'forumwp')}
        value={form.body}
        onChange={set('body')}
        __nextHasNoMarginBottom
      />
      <Button variant="primary" type="submit" disabled={!canSubmit} __next40pxDefaultSize>
        {__('Post', 'forumwp')}
      </Button>
    </form>
  );
};

// Added so this runs on its own: post something, and both fields empty again.
createRoot(document.getElementById('forumwp-root')).render(
  <PostComposer onSubmit={(post) => console.log('new post', post)} />
);
