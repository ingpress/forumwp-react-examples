// @id 13.11
// @title Using a ref before the element exists (broken)
// @section 13 (Common mistakes)
// @expect error
// @click Write something
import { useState, useRef, createRoot } from '@wordpress/element'; // Added so this runs on its own
import { TextareaControl } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: the ComposerBox from 13.10 with the wrong click handler.
const ComposerBox = () => {
  const textarea = useRef(null);
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState('');

  if (!open) {
    return (
<button type="button" onClick={() => {
  setOpen(true);
  textarea.current.focus();   // WRONG: the textarea isn't on the page yet
}}>
        Write something in this space…{/* Added so this runs on its own */}
      </button>
    );
  }
  return <TextareaControl ref={textarea} label="Post" value={body} onChange={setBody} __nextHasNoMarginBottom />;
};

// Added so this runs on its own: click the prompt. The console shows the TypeError.
createRoot(document.getElementById('forumwp-root')).render(<ComposerBox />);
