// @id 22.2
// @title Saved posts: the hooks, the button and the screen
// @section 22.5
// @click Save for later
// app/portal/api/bookmarks.js
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { cursorPages, post, remove } from './client';
// import { updateCachedPost } from './posts';
// Added so this runs on its own: the other imports used below.
import { createRoot } from '@wordpress/element';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Button, Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

// Added so this runs on its own: a stand-in for api/client.js. The course's fake API has no saved-posts
// routes, so these helpers answer GET /feed, GET /saved and POST/DELETE /posts/:id/save from memory,
// after a short wait, with the same shapes ForumWP's PHP returns.
const server = {
  posts: [
    { id: 42, title: 'Pricing teardown', saved: false, can: { save: true } },
    { id: 41, title: 'Weekly wins thread', saved: false, can: { save: true } },
    { id: 40, title: 'Meetup in Lagos?', saved: true, can: { save: true } },
  ],
  savedOrder: [40],
};
const answer = (value) => new Promise((resolve) => setTimeout(() => resolve(value), 400));
const get = (path) => {
  console.log('GET /forumwp/v1' + path);
  if (path.startsWith('/feed')) {
    return answer({ items: server.posts.map((p) => ({ ...p })), next_cursor: null });
  }
  const items = server.savedOrder.map((id) => ({ ...server.posts.find((p) => p.id === id) }));
  return answer({ items, next_cursor: null });
};
const setSaved = (path, saved) => {
  const id = Number(path.split('/')[2]);
  server.posts.find((p) => p.id === id).saved = saved;
  server.savedOrder = saved ? [id, ...server.savedOrder.filter((x) => x !== id)] : server.savedOrder.filter((x) => x !== id);
  return answer({ saved });
};
const post = (path) => { console.log('POST /forumwp/v1' + path); return setSaved(path, true); };
const remove = (path) => { console.log('DELETE /forumwp/v1' + path); return setSaved(path, false); };
const cursorPages = (path) => ({
  queryFn: ({ pageParam }) => get(`${path}?cursor=${pageParam}`),
  initialPageParam: 0,
  getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
});

// Added so this runs on its own: a short version of updateCachedPost from api/posts.js (Chapter 25 has the real one).
// It changes the post in every cached query whose key starts with 'feed'.
const updateCachedPost = (queryClient, id, update) =>
  queryClient.setQueriesData({ queryKey: ['feed'] }, (data) =>
    data && {
      ...data,
      pages: data.pages.map((page) => ({
        ...page,
        items: page.items.map((p) => (p.id === id ? update(p) : p)),
      })),
    }
  );

// Saved posts live under the "feed" key, so likes and edits update them too.
export const useSaved = () =>
  useInfiniteQuery({
    queryKey: ['feed', 'saved'],
    ...cursorPages('/saved'),
  });

export const useToggleSaved = (id) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (saved) =>
      saved ? post(`/posts/${id}/save`) : remove(`/posts/${id}/save`),
    onMutate: (saved) =>
      updateCachedPost(queryClient, id, (p) => ({ ...p, saved })),
    onError: (error, saved) =>
      updateCachedPost(queryClient, id, (p) => ({ ...p, saved: !saved })),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ['feed', 'saved'] }),
  });
};

// Added so this runs on its own: bookmarkIcon, which the real SaveButton.js also exports.
const bookmarkIcon = (filled) => (
  <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M7 4h10v16l-5-4-5 4z" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

// app/portal/components/SaveButton.js
const SaveButton = ({ post }) => {
  const toggle = useToggleSaved(post.id);

  return (
    <Button
      size="compact"
      className={`fwp-save ${post.saved ? 'is-active' : ''}`}
      icon={bookmarkIcon(post.saved)}
      label={post.saved ? __('Remove from saved', 'forumwp') : __('Save for later', 'forumwp')}
      aria-pressed={!!post.saved}
      onClick={() => toggle.mutate(!post.saved)}
    />
  );
};

// Added so this runs on its own: small versions of PostCard and FeedList from components/.
const PostCard = ({ post }) => (
  <article className="fwp-post">
    <strong>{post.title}</strong> {post.can.save && <SaveButton post={post} />}
  </article>
);
const FeedList = ({ query, emptyText }) => {
  if (query.isPending) {
    return <Spinner />;
  }
  const posts = query.data.pages.flatMap((page) => page.items);
  if (!posts.length) {
    return <p>{emptyText}</p>;
  }
  return posts.map((p) => <PostCard key={p.id} post={p} />);
};

// app/portal/screens/Saved.js
const Saved = () => (
  <div className="fwp-stack">
    <h1 className="fwp-page-title">{__('Saved', 'forumwp')}</h1>
    <FeedList
      query={useSaved()}
      emptyText={__('Nothing saved yet. Use the bookmark on any post to keep it here.', 'forumwp')}
    />
  </div>
);

// Added so this runs on its own: a home feed next to the Saved screen, so you can watch both change.
const Home = () => (
  <div className="fwp-stack">
    <h1 className="fwp-page-title">Home</h1>
    <FeedList query={useInfiniteQuery({ queryKey: ['feed', 'home'], ...cursorPages('/feed') })} emptyText="No posts." />
  </div>
);

createRoot(document.getElementById('forumwp-root')).render(
  <QueryClientProvider client={new QueryClient()}>
    <Home />
    <Saved />
  </QueryClientProvider>
);
