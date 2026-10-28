// @id 23.4
// @title Broken: data.map is not a function
// @section 23.3
// @api fake
// @expect error
// Added so this runs on its own: the imports.
import { createRoot } from '@wordpress/element';
import { Spinner } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import { QueryClient, QueryClientProvider, useInfiniteQuery } from '@tanstack/react-query';

// Added so this runs on its own: a stand-in for useSaved. The course's fake API has no /saved route, so this
// loads space 1's posts instead. Like the real hook, it's an infinite query: data is { pages, pageParams }.
const useSaved = () =>
  useInfiniteQuery({
    queryKey: ['feed', 'saved'],
    queryFn: ({ pageParam }) => apiFetch({ path: `/forumwp/v1/spaces/1/posts?per_page=3&cursor=${pageParam}` }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
  });
const PostCard = ({ post }) => <article className="fwp-post">{post.title}</article>;

const Saved = () => { // Added so this runs on its own: the component around the book's two lines.
  const { data } = useSaved();
  if (!data) return <Spinner />; // Added so this runs on its own: wait for the data, so you see this error and not error 1.
  return data.map((post) => <PostCard key={post.id} post={post} />);
};

createRoot(document.getElementById('forumwp-root')).render(
  <QueryClientProvider client={new QueryClient()}>
    <Saved />
  </QueryClientProvider>
);
