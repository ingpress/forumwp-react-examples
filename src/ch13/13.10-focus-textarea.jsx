// @id 13.10
// @title A ref to the textarea: focus when the composer opens
// @section 13.10
// @click Write something
import { useState, useEffect, useRef } from '@wordpress/element';
import { TextareaControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { createRoot } from '@wordpress/element'; // Added so this runs on its own
import { Button } from '@wordpress/components'; // Added so this runs on its own

const ComposerBox = () => {
  const textarea = useRef(null);
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState('');

  // The form opens because the member clicked the prompt; put the cursor in it.
  useEffect(() => {
    if (open) {
      textarea.current?.focus();
    }
  }, [open]);

  if (!open) {
    return (
      <button type="button" className="fwp-composer__prompt" onClick={() => setOpen(true)}>
        {__('Write something in this space…', 'forumwp')}
      </button>
    );
  }

  return (
    <TextareaControl
      ref={textarea}
      label={__('Post', 'forumwp')}
      hideLabelFromVision
      value={body}
      onChange={setBody}
      __nextHasNoMarginBottom
    />
  );
};

// Added so this runs on its own: a composer that is already open, for the handleSubmit
// from the end of 13.10. After posting, the cursor goes back into the textarea.
const EMPTY = { title: '', body: '' };
const OpenComposer = ({ onSubmit }) => {
  const textarea = useRef(null);
  const [form, setForm] = useState(EMPTY);

const handleSubmit = (event) => {
  event.preventDefault();
  onSubmit(form);
  setForm(EMPTY);
  textarea.current?.focus();   // the textarea is already on the page
};

  // Added so this runs on its own
  return (
    <form onSubmit={handleSubmit} className="fwp-card">
      <TextareaControl ref={textarea} label="Reply" value={form.body} onChange={(body) => setForm({ ...form, body })} __nextHasNoMarginBottom />
      <Button variant="primary" type="submit">Send</Button>
    </form>
  );
};

// Added so this runs on its own: click the prompt and start typing straight away.
createRoot(document.getElementById('forumwp-root')).render(
  <>
    <ComposerBox />
    <OpenComposer onSubmit={(post) => console.log('sent', post)} />
  </>
);
