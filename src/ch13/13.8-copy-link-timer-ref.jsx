// @id 13.8
// @title A ref for a timer id: "Copied!"
// @section 13.8
// @click Copy link
import { useState, useEffect, useRef } from '@wordpress/element';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { createRoot } from '@wordpress/element'; // Added so this runs on its own

// Added so this runs on its own: playgrounds and local files often block the clipboard.
// This makes a blocked copy log a line instead of an error.
if (window.navigator.clipboard) {
  const write = window.navigator.clipboard.writeText.bind(window.navigator.clipboard);
  window.navigator.clipboard.writeText = (text) =>
    write(text).catch(() => console.log('(the clipboard is blocked here; on a real site the link is copied)'));
}

// Added so this runs on its own: the first version, without a ref.
const CopyLinkPlain = ({ post }) => {
  const [copied, setCopied] = useState(false);

const copyLink = () => {
  window.navigator.clipboard?.writeText(post.url);
  setCopied(true);
  window.setTimeout(() => setCopied(false), 2000);
};

  // Added so this runs on its own
  return (
    <Button variant="tertiary" onClick={copyLink}>
      {copied ? 'Copied! (no ref)' : 'Copy link (no ref)'}
    </Button>
  );
};

const CopyLinkButton = ({ post }) => {
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);

  const copyLink = () => {
    window.navigator.clipboard?.writeText(post.url);
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2000);
  };

  // Cancel the timer if the card leaves the screen.
  useEffect(() => {
    return () => window.clearTimeout(timer.current);
  }, []);

  return (
    <Button variant="tertiary" onClick={copyLink}>
      {copied ? __('Copied!', 'forumwp') : __('Copy link', 'forumwp')}
    </Button>
  );
};

// Added so this runs on its own: click each button twice, about 1.5 seconds apart. The one
// without a ref goes back to "Copy link" half a second after the second click.
const post = { id: 881, url: 'https://example.com/community/post/881' };
createRoot(document.getElementById('forumwp-root')).render(
  <>
    <CopyLinkButton post={post} />
    <CopyLinkPlain post={post} />
  </>
);
