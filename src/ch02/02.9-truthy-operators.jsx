// @id 2.9
// @title Truthy, falsy, && || ?? and ?.
// @section 2.9
import { createRoot } from '@wordpress/element'; // Added so this runs on its own

// Added so this runs on its own: show() prints what you'd type in the console and what it shows.
const show = (typed, value) => console.log(`> ${typed}\n`, typeof value === 'string' ? `'${value}'` : value === undefined ? 'undefined' : value);

// Added so this runs on its own: the console lines from the book.
show("'0' ? 'truthy' : 'falsy'", '0' ? 'truthy' : 'falsy');
show("[] ? 'truthy' : 'falsy'", [] ? 'truthy' : 'falsy');
show("'Ada' || 'Anonymous'", 'Ada' || 'Anonymous');
show("'' || 'Anonymous'", '' || 'Anonymous');
show("true && 'Pinned'", true && 'Pinned');
show("false && 'Pinned'", false && 'Pinned');
const perPage = 0;
show('perPage || 20', perPage || 20);
show("0 && 'likes'", 0 && 'likes');
show('0 ?? 20', 0 ?? 20);
show('null ?? 20', null ?? 20);
show("undefined ?? 'Anonymous'", undefined ?? 'Anonymous');

// Added so this runs on its own: a member and a post, and a component for the JSX lines.
const member = { display_name: '' };
const PinnedTitle = ({ post }) => {
  const name = member.display_name || 'Anonymous';
  return (
    <p className="fwp-post">
      {post.title} by {name}
      {post.pinned && <span className="fwp-badge">Pinned</span>}
    </p>
  );
};

// Added so this runs on its own: the BROKEN line, in a component, for a post with no reactions.
const BrokenLikes = ({ post }) => (
  <p className="fwp-post">
    BROKEN: {post.title}{' '}
    {/* BROKEN: shows a stray "0" on posts with no reactions */}
    {post.reactions && <span>{post.reactions} likes</span>}
  </p>
);
// Added so this runs on its own: the fix.
const FixedLikes = ({ post }) => (
  <p className="fwp-post">
    Fixed: {post.title}{' '}
    {post.reactions > 0 && <span>{post.reactions} likes</span>}
  </p>
);

{ // Added so this runs on its own: a block keeps each snippet's `post` apart
  const post = { title: 'Hello from Tunde', reactions: 0 };
  const reactions = post.reactions ?? 0;
  show('reactions', reactions); // Added so this runs on its own
}

{ // Added so this runs on its own: optional chaining
  const post = { id: 881 };
  try {
    post.author.name;
  } catch (error) {
    console.log(`> post.author.name\n Uncaught ${error.name}: ${error.message}`);
  }
  show('post.author?.name', post.author?.name);
  show("post.author?.name ?? 'Former member'", post.author?.name ?? 'Former member');

  const onDelete = undefined; // Added so this runs on its own: nothing was passed in
  post.tags?.[0];   // first tag, or undefined if there are no tags
  onDelete?.();     // call onDelete only if it was passed in
  show('post.tags?.[0]', post.tags?.[0]); // Added so this runs on its own
  console.log('onDelete?.() ran without an error'); // Added so this runs on its own
}

// Added so this runs on its own
createRoot(document.getElementById('forumwp-root')).render(
  <>
    <PinnedTitle post={{ title: 'Welcome to the community', pinned: true }} />
    <PinnedTitle post={{ title: 'How do I change my avatar?', pinned: false }} />
    <BrokenLikes post={{ title: 'How do I change my avatar?', reactions: 0 }} />
    <FixedLikes post={{ title: 'How do I change my avatar?', reactions: 0 }} />
  </>
);
