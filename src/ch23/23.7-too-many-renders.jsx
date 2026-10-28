// @id 23.7
// @title Broken: calling a setter while rendering
// @section 23.3
// @expect error
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button } from '@wordpress/components'; // Added so this runs on its own

const ReplyBox = () => { // Added so this runs on its own: the component around the book's line.
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={setOpen(true)}>Reply</Button>
      {open && <textarea />}
    </>
  );
};

createRoot(document.getElementById('forumwp-root')).render(<ReplyBox />);
