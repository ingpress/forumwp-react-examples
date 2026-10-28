// @id 18.6
// @title The infinite feed with useInfiniteQuery
// @section 18.7
// @api fake
// @click Load more
// src/api/posts.js
import { useInfiniteQuery } from '@tanstack/react-query';
import { addQueryArgs } from '@wordpress/url';
import apiFetch from '@wordpress/api-fetch'; // Added so this runs on its own (imported earlier in posts.js in the book)

const useSpacePosts = (spaceId) =>
  useInfiniteQuery({
    queryKey: ['posts', spaceId],
    queryFn: ({ pageParam }) =>
      apiFetch({
        path: addQueryArgs(`/forumwp/v1/spaces/${spaceId}/posts`, {
          cursor: pageParam,
        }),
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
  });

// src/components/SpaceFeed.js
import { Button, Notice, Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
// In the book: import { useSpacePosts } from '../api/posts'; import PostCard from './PostCard';

// Added so this runs on its own: a simple PostCard.
const PostCard = ({ post }) => (
  <article className="fwp-post">
    <strong>{post.title}</strong> by {post.author.name} <span className="fwp-badge">id {post.id}</span>
  </article>
);

const SpaceFeed = ({ spaceId }) => {
  const { data, isPending, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSpacePosts(spaceId);

  if (isPending) {
    return <Spinner />;
  }
  if (isError) {
    return <Notice status="error" isDismissible={false}>{error.message}</Notice>;
  }

  const posts = data.pages.flatMap((page) => page.items);

  return (
    <>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      {hasNextPage && (
        <Button
          variant="secondary"
          onClick={() => fetchNextPage()}
          isBusy={isFetchingNextPage}
          disabled={isFetchingNextPage}
          __next40pxDefaultSize
        >
          {__('Load more', 'forumwp')}
        </Button>
      )}
    </>
  );
};

// Added so this runs on its own: the pretend API has only 17 posts in General, fewer than one
// page of 20, so this apiFetch middleware asks for 5 per page to give "Load more" something to do.
apiFetch.use((options, next) => next({ ...options, path: addQueryArgs(options.path, { per_page: 5 }) }));

// Added so this runs on its own: the QueryClient set-up from 18.2, and the render call.
import { createRoot } from '@wordpress/element';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
createRoot(document.getElementById('forumwp-root')).render(
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { staleTime: 30_000 } } })}>
    <SpaceFeed spaceId={1} />
  </QueryClientProvider>
);
