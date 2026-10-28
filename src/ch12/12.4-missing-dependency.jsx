// @id 12.4
// @title A missing dependency: the title that never updates (broken)
// @section 12.3
// @click Add a notification
import { useEffect, useState, createRoot } from '@wordpress/element'; // Added so this runs on its own
import { Button } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own
const UnreadTitle = ({ unread }) => {
useEffect(() => {
  document.title = `(${unread}) Community`;
}, []);

  return <p>unread is {unread}</p>; // Added so this runs on its own
};

// Added so this runs on its own: in JSFiddle or CodePen the browser tab doesn't show the
// example's title, so this line shows it.
const ShowTabTitle = () => {
  const [title, setTitle] = useState(document.title);
  useEffect(() => {
    const timer = window.setInterval(() => setTitle(document.title), 200);
    return () => window.clearInterval(timer);
  }, []);
  return <p>Tab title: <strong>{title}</strong></p>;
};

// Added so this runs on its own: add notifications; the tab title stays "(0) Community".
const App = () => {
  const [unread, setUnread] = useState(0);
  return (
    <>
      <Button variant="secondary" onClick={() => setUnread(unread + 1)}>Add a notification</Button>
      <UnreadTitle unread={unread} />
      <ShowTabTitle />
    </>
  );
};

createRoot(document.getElementById('forumwp-root')).render(<App />);
