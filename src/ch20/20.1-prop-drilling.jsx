// @id 20.1
// @title Prop drilling: passing the member through every level
// @section 20.1
import { createRoot } from '@wordpress/element';

// Added so this runs on its own: the start-up data PHP prints, and two posts (one by Ada, one by Tunde).
window.forumwpData = { currentUser: { id: 1, name: 'Ada' } };
const posts = [
  { id: 1, title: 'Welcome to the community', author: { id: 1, name: 'Ada' } },
  { id: 2, title: 'How do I change my avatar?', author: { id: 2, name: 'Tunde' } },
];

const App = () => {
  const currentUser = window.forumwpData.currentUser;
  return <SpacePage currentUser={currentUser} />;
};

const SpacePage = ({ currentUser }) => (
  <SpaceFeed spaceId={12} currentUser={currentUser} />
);

const SpaceFeed = ({ spaceId, currentUser }) => {
  // ... load posts
  return posts.map((post) => (
    <PostCard key={post.id} post={post} currentUser={currentUser} />
  ));
};

const PostCard = ({ post, currentUser }) => (
  <article className="fwp-post">
    <h3>{post.title}</h3>
    <PostActions post={post} currentUser={currentUser} />
  </article>
);

const PostActions = ({ post, currentUser }) => {
  if (!currentUser || currentUser.id !== post.author.id) {
    return null;
  }
  // ... the Edit and Delete menu
  return <button>Edit or delete</button>; // Added so this runs on its own: a stand-in for the menu.
};

createRoot(document.getElementById('forumwp-root')).render(<App />); // Added so this runs on its own
