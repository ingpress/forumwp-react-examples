// @id 12.6
// @title Escape closes the post panel
// @section 12.4
// @click Open the post
import { useEffect, useState, createRoot } from '@wordpress/element'; // Added so this runs on its own
import { Button } from '@wordpress/components'; // Added so this runs on its own

const PostPanel = ({ post, onClose }) => {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <aside className="fwp-panel">
      <h2>{post.title}</h2>
      {/* ... */}
      <p>Press Escape to close this panel.</p>{/* Added so this runs on its own */}
    </aside>
  );
};

// Added so this runs on its own: open the panel, then press Escape (click the page first so it has focus).
const post = { id: 881, title: 'Welcome to the community' };
const App = () => {
  const [open, setOpen] = useState(false);
  const close = () => {
    console.log('onClose called');
    setOpen(false);
  };
  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>Open the post</Button>
      {open && <PostPanel post={post} onClose={close} />}
    </>
  );
};

createRoot(document.getElementById('forumwp-root')).render(<App />);
