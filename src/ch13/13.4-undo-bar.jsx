// @id 13.4
// @title The countdown that sticks at 4, and the fix
// @section 13.4
import { useState, useEffect } from '@wordpress/element';
import { Button } from '@wordpress/components';
import { createRoot } from '@wordpress/element'; // Added so this runs on its own

// BROKEN: the countdown sticks at 4
const UndoBar = ({ onUndo }) => {
  const [left, setLeft] = useState(5);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setLeft(left - 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="fwp-undo">
      Post deleted.{' '}
      <Button variant="link" onClick={onUndo}>
        Undo ({left})
      </Button>
    </div>
  );
};

// Added so this runs on its own: the same bar with the functional update from 13.5.
const UndoBarFixed = ({ onUndo }) => {
  const [left, setLeft] = useState(5);

useEffect(() => {
  const timer = window.setInterval(() => {
    setLeft((current) => Math.max(current - 1, 0));
  }, 1000);
  return () => window.clearInterval(timer);
}, []);

  // Added so this runs on its own
  return (
    <div className="fwp-undo">
      Post deleted (fixed).{' '}
      <Button variant="link" onClick={onUndo}>
        Undo ({left})
      </Button>
    </div>
  );
};

// Added so this runs on its own: watch both for a few seconds.
const undo = () => console.log('undo');
createRoot(document.getElementById('forumwp-root')).render(
  <>
    <UndoBar onUndo={undo} />
    <UndoBarFixed onUndo={undo} />
  </>
);
