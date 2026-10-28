// @id 6.2
// @title Icons on a button and on their own
// @section 6.6
import { createRoot } from '@wordpress/element'; // Added so this runs on its own
import { Button } from '@wordpress/components';
import { trash } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import { Icon, people } from '@wordpress/icons';

const DeleteIconButton = ({ onDelete }) => (
  <Button
    icon={trash}
    label={__('Delete post', 'forumwp')}
    onClick={onDelete}
    isDestructive
    __next40pxDefaultSize
  />
);

const MemberCount = ({ count }) => (
  <span className="fwp-member-count">
    <Icon icon={people} size={20} />
    {count}
  </span>
);

// Added so this runs on its own. The last button is Common mistake 3 (no label): hover both
// trash buttons and only the first shows a tooltip.
const onDelete = () => console.log('Delete clicked');
const App = () => (
  <>
    <p><DeleteIconButton onDelete={onDelete} /> with a label</p>
    <p><MemberCount count={1280} /></p>
    <p><Button icon={trash} onClick={onDelete} /> without a label (WRONG)</p>
  </>
);
createRoot(document.getElementById('forumwp-root')).render(<App />);
