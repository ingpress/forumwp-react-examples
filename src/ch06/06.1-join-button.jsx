// @id 6.1
// @title Button: a Join space button
// @section 6.5
import { createRoot } from '@wordpress/element'; // Added so this runs on its own
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const JoinButton = ({ onJoin, isJoining }) => (
  <Button
    variant="primary"
    onClick={onJoin}
    isBusy={isJoining}
    disabled={isJoining}
    __next40pxDefaultSize
  >
    {__('Join space', 'forumwp')}
  </Button>
);

// Added so this runs on its own: one button ready to click, one "joining" (busy and disabled).
const App = () => (
  <>
    <p><JoinButton onJoin={() => console.log('Join clicked')} isJoining={false} /></p>
    <p><JoinButton onJoin={() => console.log('Join clicked')} isJoining={true} /></p>
  </>
);
createRoot(document.getElementById('forumwp-root')).render(<App />);
