// @id 11.8
// @title Prop drilling
// @section 11.6
import { createRoot } from '@wordpress/element'; // Added so this runs on its own

// Added so this runs on its own: the posts SpacePage passes down (in the book they come from
// SpacePage's state), and a ReactionButton that uses currentUser.
const posts = [
  { id: 881, title: 'Welcome to the community', reactions: 12 },
  { id: 880, title: 'Office hours on Thursday', reactions: 3 },
];
const ReactionButton = ({ post, currentUser }) => (
  <button type="button">Like · You ({currentUser.name}) and {post.reactions - 1} others</button>
);

const SpacePage = ({ currentUser }) => (
  <Feed posts={posts} currentUser={currentUser} />
);

const Feed = ({ posts, currentUser }) =>
  posts.map((post) => (
    <PostCard key={post.id} post={post} currentUser={currentUser} />
  ));

const PostCard = ({ post, currentUser }) => (
  <article className="fwp-post">
    {/* ... */}
    <strong>{post.title}</strong>{' '}{/* Added so this runs on its own */}
    <ReactionButton post={post} currentUser={currentUser} />
  </article>
);

// Added so this runs on its own: currentUser travels SpacePage -> Feed -> PostCard -> ReactionButton.
createRoot(document.getElementById('forumwp-root')).render(<SpacePage currentUser={{ id: 1, name: 'Ada' }} />);
