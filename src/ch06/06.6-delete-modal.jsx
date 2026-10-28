// @id 6.6
// @title Modal: a delete confirmation
// @section 6.9
// @click Delete
import { createRoot } from '@wordpress/element'; // Added so this runs on its own
import { useState } from '@wordpress/element';
import { Button, Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

// Added so this runs on its own: the book's fwp-row classes (a row, pushed to the right).
document.head.insertAdjacentHTML('beforeend', '<style>.fwp-row { display: flex; gap: 8px; } .fwp-row.is-end { justify-content: flex-end; }</style>');

const DeletePostButton = ({ onConfirm }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button variant="tertiary" isDestructive onClick={() => setIsOpen(true)}>
        {__('Delete', 'forumwp')}
      </Button>
      {isOpen && (
        <Modal
          title={__('Delete this post?', 'forumwp')}
          onRequestClose={() => setIsOpen(false)}
          size="small"
        >
          <p>{__('The post and all its comments will be removed. This cannot be undone.', 'forumwp')}</p>
          <div className="fwp-row is-end">
            <Button variant="tertiary" onClick={() => setIsOpen(false)}>
              {__('Cancel', 'forumwp')}
            </Button>
            <Button variant="primary" isDestructive onClick={onConfirm}>
              {__('Delete', 'forumwp')}
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
};

// Added so this runs on its own
createRoot(document.getElementById('forumwp-root')).render(
  <DeletePostButton onConfirm={() => console.log('Post 881 deleted')} />
);
