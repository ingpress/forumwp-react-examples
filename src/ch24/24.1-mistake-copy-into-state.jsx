// @id 24.1
// @title Mistake: copying server data into useState (broken)
// @section 24 (Common mistakes)
// @api fake
// @click Like
import { useState, createRoot } from '@wordpress/element'; // Added so this runs on its own
import apiFetch from '@wordpress/api-fetch'; // Added so this runs on its own
import { Button, Spinner } from '@wordpress/components'; // Added so this runs on its own
import { QueryClient, QueryClientProvider, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'; // Added so this runs on its own

// Added so this runs on its own: a feed query and a Like mutation that refreshes it (Chapter 18).
const useFeed = () =>
  useInfiniteQuery({
    queryKey: ['feed', 1],
    queryFn: ({ pageParam }) => apiFetch({ path: `/forumwp/v1/spaces/1/posts?per_page=3&cursor=${pageParam}` }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
  });
const useLike = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => apiFetch({ path: `/forumwp/v1/posts/${id}/reactions`, method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['feed'] }),
  });
};
const PostList = ({ title, posts }) => {
  const like = useLike();
  return (
    <div style={{ flex: 1 }}>
      <h3>{title}</h3>
      {posts.map((p) => (
        <div className="fwp-post" key={p.id}>
          {p.title} <Button variant="secondary" onClick={() => like.mutate(p.id)}>Like {p.reactionCount}</Button>
        </div>
      ))}
    </div>
  );
};

// WRONG: the posts are copied into state once.
const CopiedFeed = ({ data }) => {
  const [posts, setPosts] = useState(data.pages.flatMap((p) => p.items));
  return <PostList title="Copied into useState (broken)" posts={posts} />;
};

// Added so this runs on its own: the fix from the text, for comparison: read from the query every render.
const QueryFeed = ({ data }) => <PostList title="Read from the query (the fix)" posts={data.pages.flatMap((p) => p.items)} />;

// Added so this runs on its own: click Like on the left. The fake API log shows the like saved and the
// feed refetched; the right column shows the new count, the left one never changes.
const Feed = () => {
  const { data, isPending } = useFeed();
  if (isPending) return <Spinner />;
  return (
    <div style={{ display: 'flex', gap: 24 }}>
      <CopiedFeed data={data} />
      <QueryFeed data={data} />
    </div>
  );
};

createRoot(document.getElementById('forumwp-root')).render( // Added so this runs on its own
  <QueryClientProvider client={new QueryClient()}><Feed /></QueryClientProvider>
);
