// @id 18.7
// @title An optimistic Like in the cache
// @section 18.8
// @api fake
// @click Like
// Added so this runs on its own: imports.
import { createRoot } from '@wordpress/element';
import { Button, Spinner } from '@wordpress/components';
import { QueryClient, QueryClientProvider, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';

const useToggleReaction = (post, spaceId) => {
  const queryClient = useQueryClient();
  const key = ['posts', spaceId];

  const patch = (delta) =>
    queryClient.setQueryData(key, (old) =>
      old
        ? {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.map((p) =>
                p.id === post.id
                  ? { ...p, reacted: delta > 0, reactionCount: p.reactionCount + delta }
                  : p
              ),
            })),
          }
        : old
    );

  return useMutation({
    mutationFn: () =>
      apiFetch({
        path: `/forumwp/v1/posts/${post.id}/reactions`,
        method: post.reacted ? 'DELETE' : 'POST',
      }),
    onMutate: () => patch(post.reacted ? -1 : 1), // change the screen now
    onError: () => patch(post.reacted ? 1 : -1), // undo if the server said no
  });
};

// Added so this runs on its own: useSpacePosts from 18.7 (3 posts per page here), a PostCard
// with a Like button that uses the hook, and the feed. Try fakeApi.fail = true in the browser
// console, then click Like: the count goes up, then back down.
const useSpacePosts = (spaceId) =>
  useInfiniteQuery({
    queryKey: ['posts', spaceId],
    queryFn: ({ pageParam }) =>
      apiFetch({ path: addQueryArgs(`/forumwp/v1/spaces/${spaceId}/posts`, { cursor: pageParam, per_page: 3 }) }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
  });

const PostCard = ({ post, spaceId }) => {
  const toggle = useToggleReaction(post, spaceId);
  return (
    <article className="fwp-post">
      <strong>{post.title}</strong>{' '}
      <Button variant={post.reacted ? 'primary' : 'secondary'} isPressed={post.reacted} onClick={() => toggle.mutate()} disabled={toggle.isPending}>
        Like {post.reactionCount}
      </Button>
    </article>
  );
};

const SpaceFeed = ({ spaceId }) => {
  const { data, isPending } = useSpacePosts(spaceId);
  if (isPending) {
    return <Spinner />;
  }
  return data.pages.flatMap((page) => page.items).map((post) => <PostCard key={post.id} post={post} spaceId={spaceId} />);
};

createRoot(document.getElementById('forumwp-root')).render(
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { staleTime: 30_000 } } })}>
    <SpaceFeed spaceId={1} />
  </QueryClientProvider>
);
