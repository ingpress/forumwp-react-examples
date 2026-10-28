// @id 4.9
// @title Picking the tag at run time
// @section 4.7
import { createRoot } from '@wordpress/element'; // Added so this runs on its own

// Added so this runs on its own: a small component around the book's two lines.
const PostTitle = ({ post, full }) => {
  const Title = full ? 'h1' : 'h2';

  return <Title className="fwp-post__title">{post.title}</Title>;
};

// Added so this runs on its own
const post = { title: 'Welcome to the community' };
createRoot(document.getElementById('forumwp-root')).render(
  <>
    <PostTitle post={post} full={true} />
    <PostTitle post={post} full={false} />
  </>
);
setTimeout(() => console.log([...document.querySelectorAll('.fwp-post__title')].map((el) => el.tagName).join(', ')), 0); // Added so this runs on its own
