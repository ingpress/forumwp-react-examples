// @id 12.8
// @title The tab title, put back afterwards
// @section 12.5
// @click Add a notification
import { useEffect, useState, createRoot } from '@wordpress/element'; // Added so this runs on its own
import { Button } from '@wordpress/components'; // Added so this runs on its own

const SpaceTitle = ({ space, unread }) => {
  useEffect(() => {
    const previous = document.title;
    document.title = unread > 0 ? `(${unread}) ${space.name}` : space.name;
    return () => {
      document.title = previous;
    };
  }, [space.name, unread]);

  return null;
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

// Added so this runs on its own: add and clear notifications, then leave the space.
const App = () => {
  const [inSpace, setInSpace] = useState(true);
  const [unread, setUnread] = useState(0);
  return (
    <>
      <Button variant="secondary" onClick={() => setUnread(unread + 1)}>Add a notification</Button>{' '}
      <Button variant="secondary" onClick={() => setUnread(0)}>Clear notifications</Button>{' '}
      <Button variant="secondary" onClick={() => setInSpace(!inSpace)}>{inSpace ? 'Leave the space' : 'Go back to General'}</Button>
      {inSpace && <SpaceTitle space={{ name: 'General' }} unread={unread} />}
      <ShowTabTitle />
    </>
  );
};

createRoot(document.getElementById('forumwp-root')).render(<App />);
