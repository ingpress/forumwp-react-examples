// @id 6.5
// @title Feedback: Spinner, VisuallyHidden and Notice
// @section 6.9
// Added so this runs on its own: the imports, a LoadingFeed component and an App that hold the
// three snippets from 6.9.
import { createRoot } from '@wordpress/element';
import { Spinner, VisuallyHidden, Notice } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const LoadingFeed = ({ isPending }) => {
  if (isPending) {
    return <Spinner />;
  }
  return <p>{__('The posts would be here.', 'forumwp')}</p>; // Added
};

const App = () => (
  <>
    <LoadingFeed isPending={true} />
    <span>
      <Spinner />
      <VisuallyHidden>{__('Loading posts…', 'forumwp')}</VisuallyHidden>
    </span>
    <Notice status="error" isDismissible={false}>
      {__('Your post could not be saved. Please try again.', 'forumwp')}
    </Notice>
  </>
);
createRoot(document.getElementById('forumwp-root')).render(<App />);
