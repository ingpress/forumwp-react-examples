// @id 12.9
// @title A reply draft kept in localStorage
// @section 12.5
import { useState, useEffect } from '@wordpress/element';
import { TextareaControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { createRoot } from '@wordpress/element'; // Added so this runs on its own

const readDraft = (key) => {
  try {
    return window.localStorage.getItem(key) ?? '';
  } catch {
    return '';
  }
};

const ReplyBox = ({ postId }) => {
  const key = `fwp-reply:${postId}`;
  const [body, setBody] = useState(() => readDraft(key));

  useEffect(() => {
    try {
      if (body) {
        window.localStorage.setItem(key, body);
      } else {
        window.localStorage.removeItem(key);
      }
    } catch {}
  }, [key, body]);

  return (
    <TextareaControl
      label={__('Reply', 'forumwp')}
      value={body}
      onChange={setBody}
      __nextHasNoMarginBottom
    />
  );
};

// Added so this runs on its own: type a reply, then reload the page. The text is still there.
createRoot(document.getElementById('forumwp-root')).render(<ReplyBox postId={881} />);
