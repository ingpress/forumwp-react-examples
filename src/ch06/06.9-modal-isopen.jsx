// @id 6.9
// @title Mistake: expecting Modal to have an isOpen prop
// @section 6.9
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Modal } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: isOpen starts as false, yet the dialog is open.
const DeleteDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const close = () => setIsOpen(false);
  return (
    <Modal title="Delete this post?" isOpen={isOpen} onRequestClose={close}>
      <p>isOpen is {String(isOpen)}, and this dialog is open anyway. Press Escape: it stays.</p>
    </Modal>
  );
};
createRoot(document.getElementById('forumwp-root')).render(<DeleteDialog />);
