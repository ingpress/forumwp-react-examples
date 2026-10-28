// @id 18.9
// @title BROKEN: leaving spaceId out of the key
// @section Common mistakes
// @api fake
// @click Announcements
// Added so this runs on its own: imports, the SpaceFeed from 18.7 (short form), and buttons
// to switch spaces. Announcements has no posts in the pretend API, yet it shows General's.
import { useState, createRoot } from '@wordpress/element';
import { Button, Spinner } from '@wordpress/components';
import { QueryClient, QueryClientProvider, useInfiniteQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';

const useSpacePosts = (spaceId) =>
  useInfiniteQuery({
    queryKey: ['posts'], // WRONG: spaceId missing
    queryFn: ({ pageParam }) => apiFetch({ path: addQueryArgs(`/forumwp/v1/spaces/${spaceId}/posts`, { cursor: pageParam }) }),
    // ...
    initialPageParam: 0, // Added so this runs on its own (the "..." in the book)
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined, // Added so this runs on its own
  });

const SpaceFeed = ({ spaceId }) => {
  const { data, isPending } = useSpacePosts(spaceId);
  if (isPending) {
    return <Spinner />;
  }
  const posts = data.pages.flatMap((page) => page.items);
  if (posts.length === 0) {
    return <p className="fwp-empty">No posts yet.</p>;
  }
  return posts.slice(0, 3).map((post) => <article key={post.id} className="fwp-post">{post.title}</article>);
};

const App = () => {
  const [spaceId, setSpaceId] = useState(1);
  return (
    <>
      <Button variant="secondary" onClick={() => setSpaceId(1)}>General</Button>{' '}
      <Button variant="secondary" onClick={() => setSpaceId(3)}>Announcements</Button>
      <h2>{spaceId === 1 ? 'General' : 'Announcements'}</h2>
      <SpaceFeed spaceId={spaceId} />
    </>
  );
};

createRoot(document.getElementById('forumwp-root')).render(
  <QueryClientProvider client={new QueryClient()}>
    <App />
  </QueryClientProvider>
);
