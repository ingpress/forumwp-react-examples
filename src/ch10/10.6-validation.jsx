// @id 10.6
// @title Validation and a disabled Post button
// @section 10.6
import { useState, createRoot } from '@wordpress/element'; // Added so this runs on its own
import { Button, TextControl, TextareaControl } from '@wordpress/components'; // Added so this runs on its own
import { __ } from '@wordpress/i18n'; // Added so this runs on its own

const EMPTY = { title: '', body: '' }; // Added so this runs on its own (from 10.5)

const TITLE_MAX = 120;

const PostComposer = ({ onSubmit }) => {
  const [form, setForm] = useState(EMPTY);
  const set = (field) => (value) => setForm({ ...form, [field]: value });

  const titleTooLong = form.title.length > TITLE_MAX;
  const canSubmit = form.title.trim() !== '' && !titleTooLong;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }
    onSubmit({ title: form.title.trim(), body: form.body });
  };

  return (
    <form className="fwp-composer" onSubmit={handleSubmit}>
      <TextControl
        label={__('Title', 'forumwp')}
        value={form.title}
        onChange={set('title')}
        help={titleTooLong ? __('Keep the title under 120 characters.', 'forumwp') : null}
        className={titleTooLong ? 'has-error' : ''}
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

// Added so this runs on its own: a red help line for the has-error class.
document.head.insertAdjacentHTML('beforeend', '<style>.has-error .components-base-control__help { color: #b32d2e; }</style>');

// Added so this runs on its own: the button stays disabled until the title has text.
createRoot(document.getElementById('forumwp-root')).render(
  <PostComposer onSubmit={(post) => console.log('new post', post)} />
);
