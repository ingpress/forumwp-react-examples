// @id 13.7
// @title useRef: a count that survives renders
// @section 13.7
// @click Copy link
import { useRef } from '@wordpress/element';
import { createRoot } from '@wordpress/element'; // Added so this runs on its own

// Added so this runs on its own: playgrounds and local files often block the clipboard.
// This makes a blocked copy log a line instead of an error.
if (window.navigator.clipboard) {
  const write = window.navigator.clipboard.writeText.bind(window.navigator.clipboard);
  window.navigator.clipboard.writeText = (text) =>
    write(text).catch(() => console.log('(the clipboard is blocked here; on a real site the link is copied)'));
}

const ShareButton = ({ post }) => {
  const shares = useRef(0);

  const share = () => {
    window.navigator.clipboard?.writeText(post.url);
    shares.current = shares.current + 1;
    console.log('Link copied', shares.current, 'times');
  };

  return <button type="button" onClick={share}>Copy link</button>;
};

// Added so this runs on its own: click three times.
createRoot(document.getElementById('forumwp-root')).render(
  <ShareButton post={{ id: 881, url: 'https://example.com/community/post/881' }} />
);
