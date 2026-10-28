// @id 2.10
// @title Modules: named and default exports
// @section 2.11
import { createRoot } from '@wordpress/element'; // Added so this runs on its own

// Package imports work here too:
import { useState } from '@wordpress/element';
import { Button } from '@wordpress/components';

// Added so this runs on its own: in the course these are three separate files.
// The sandbox has only this one file, so their code is pasted in below and the
// imports between them are left as comments.

// src/utils/format.js
export const formatCount = (n) => (n > 999 ? `${(n / 1000).toFixed(1)}k` : String(n));

export const memberLabel = ({ name, role = 'member' }) => `${name} (${role})`;

// src/components/PostCard.js
// import { formatCount, memberLabel } from '../utils/format';
// import { formatCount as shortCount } from '../utils/format';
const shortCount = formatCount; // Added so this runs on its own: what the `as` import gives you

// src/components/Avatar.js
const Avatar = ({ member }) => (
  <img className="fwp-avatar" src={member.avatar_url} alt={member.name} />
);

export default Avatar;

// import Avatar from './Avatar';

// Added so this runs on its own: use everything on one small card.
const member = { name: 'Ada', role: 'admin', avatar_url: 'https://i.pravatar.cc/96?img=47' };
const PostCard = () => {
  const [reactions, setReactions] = useState(1499);
  return (
    <div className="fwp-post">
      <Avatar member={member} /> {memberLabel(member)}
      <p>Welcome to the community</p>
      <Button variant="secondary" onClick={() => setReactions(reactions + 1)}>
        Like {formatCount(reactions)}
      </Button>{' '}
      ({shortCount(reactions + 2000)} with the renamed import)
    </div>
  );
};
console.log(formatCount(1500), memberLabel({ name: 'Tunde' }));
createRoot(document.getElementById('forumwp-root')).render(<PostCard />);
