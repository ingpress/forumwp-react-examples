// @id 10.3
// @title TextControl and TextareaControl
// @section 10.3
import { useState } from '@wordpress/element';
import { TextControl, TextareaControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { createRoot } from '@wordpress/element'; // Added so this runs on its own

const ComposerFields = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  return (
    <>
      <TextControl
        label={__('Title', 'forumwp')}
        value={title}
        onChange={setTitle}
        __next40pxDefaultSize
        __nextHasNoMarginBottom
      />
      <TextareaControl
        label={__('Post', 'forumwp')}
        rows={5}
        value={body}
        onChange={setBody}
        __nextHasNoMarginBottom
      />
    </>
  );
};

// Added so this runs on its own
createRoot(document.getElementById('forumwp-root')).render(<ComposerFields />);
