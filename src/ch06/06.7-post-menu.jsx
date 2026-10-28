// @id 6.7
// @title DropdownMenu: the post's "more" menu
// @section 6.10
// @click Post actions
import { createRoot } from '@wordpress/element'; // Added so this runs on its own
import { DropdownMenu } from '@wordpress/components';
import { moreVertical, pencil, trash } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';

const PostMenu = ({ onEdit, onDelete }) => (
  <DropdownMenu
    icon={moreVertical}
    label={__('Post actions', 'forumwp')}
    controls={[
      { title: __('Edit', 'forumwp'), icon: pencil, onClick: onEdit },
      { title: __('Delete', 'forumwp'), icon: trash, onClick: onDelete },
    ]}
  />
);

// Added so this runs on its own
createRoot(document.getElementById('forumwp-root')).render(
  <PostMenu onEdit={() => console.log('Edit post 881')} onDelete={() => console.log('Delete post 881')} />
);
