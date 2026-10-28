// @id 6.4
// @title Form fields: a first look at controlled inputs
// @section 6.8
import { createRoot } from '@wordpress/element'; // Added so this runs on its own
import { useState } from '@wordpress/element';
import { TextControl, SelectControl, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

// Added so this runs on its own: the book's fwp-stack class (even gaps between fields).
document.head.insertAdjacentHTML('beforeend', '<style>.fwp-stack { display: flex; flex-direction: column; gap: 16px; max-width: 420px; }</style>');

const NewSpaceForm = () => {
  const [name, setName] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [notify, setNotify] = useState(true);

  return (
    <form className="fwp-stack">
      <TextControl
        __next40pxDefaultSize
        __nextHasNoMarginBottom
        label={__('Space name', 'forumwp')}
        value={name}
        onChange={setName}
      />
      <SelectControl
        __next40pxDefaultSize
        __nextHasNoMarginBottom
        label={__('Who can see it?', 'forumwp')}
        value={visibility}
        options={[
          { value: 'public', label: __('Everyone', 'forumwp') },
          { value: 'private', label: __('Members only', 'forumwp') },
        ]}
        onChange={setVisibility}
      />
      <ToggleControl
        __nextHasNoMarginBottom
        label={__('Email me about new posts', 'forumwp')}
        checked={notify}
        onChange={setNotify}
      />
    </form>
  );
};

createRoot(document.getElementById('forumwp-root')).render(<NewSpaceForm />); // Added so this runs on its own
