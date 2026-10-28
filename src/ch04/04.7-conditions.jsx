// @id 4.7
// @title Four ways to show something conditionally
// @section 4.5
import { createRoot } from '@wordpress/element'; // Added so this runs on its own

// Added so this runs on its own: change these and run again.
const isPrivate = false;
const isPinned = true;
const isNew = true;
const isHidden = false;

// Added so this runs on its own: the one-line examples, in components.
const PrivacyLine = () => (
  // 1. The ternary
  <p>{isPrivate ? 'Private space' : 'Public space'}</p>
);
const PinnedBadge = () => (
  // 2. &&
  <p>
    {isPinned && <span className="fwp-badge">Pinned</span>}
  </p>
);

// 3. A variable worked out before the return
const PostBadge = () => {
  let badge = null;
  if (isPinned) {
    badge = <span className="fwp-badge">Pinned</span>;
  } else if (isNew) {
    badge = <span className="fwp-badge is-new">New</span>;
  }

  return <div className="fwp-post__badges">{badge}</div>;
};

// 4. An early return
const SpaceCard = () => {
  if (isHidden) {
    return null;
  }

  return (
    <div className="fwp-space-card">
      <h3>General</h3>
    </div>
  );
};

// Added so this runs on its own
createRoot(document.getElementById('forumwp-root')).render(
  <>
    <PrivacyLine />
    <PinnedBadge />
    <PostBadge />
    <SpaceCard />
  </>
);
