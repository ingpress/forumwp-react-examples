// @id 18.5
// @title Creating a post with useMutation and invalidateQueries
// @section 18.6
// @api fake
// src/api/posts.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';

const useCreatePost = (spaceId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (post) =>
      apiFetch({
        path: `/forumwp/v1/spaces/${spaceId}/posts`,
        method: 'POST',
        data: post,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['posts', spaceId] }),
  });
};

// Added so this runs on its own: imports, a PostComposer that takes isSaving, a SpaceFeed
// that reads ['posts', spaceId] with useQuery, and the QueryClient set-up from 18.2.
import { useState, createRoot } from '@wordpress/element';
import { Button, Notice, Spinner, TextControl } from '@wordpress/components';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';

const PostComposer = ({ onSubmit, isSaving }) => {
  const [title, setTitle] = useState('');
  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ title, body: '' });
  };
  return (
    <form className="fwp-composer" onSubmit={handleSubmit}>
      <TextControl label="Title" value={title} onChange={setTitle} __next40pxDefaultSize __nextHasNoMarginBottom />
      <Button variant="primary" type="submit" isBusy={isSaving} disabled={isSaving || !title.trim()} __next40pxDefaultSize>
        Publish
      </Button>
    </form>
  );
};

const SpaceFeed = ({ spaceId }) => {
  const { data, isPending } = useQuery({
    queryKey: ['posts', spaceId],
    queryFn: () => apiFetch({ path: `/forumwp/v1/spaces/${spaceId}/posts` }),
  });
  if (isPending) {
    return <Spinner />;
  }
  if (data.items.length === 0) {
    return <p className="fwp-empty">No posts yet. Start the conversation!</p>;
  }
  return data.items.map((p) => <article key={p.id} className="fwp-post">{p.title}</article>);
};

const SpacePage = ({ spaceId }) => {
  const createPost = useCreatePost(spaceId);

  return (
    <>
      <PostComposer
        onSubmit={(post) => createPost.mutate(post)}
        isSaving={createPost.isPending}
      />
      {createPost.isError && (
        <Notice status="error" onRemove={() => createPost.reset()}>
          {createPost.error.message}
        </Notice>
      )}
      <SpaceFeed spaceId={spaceId} />
    </>
  );
};

// Added so this runs on its own. Space 3 starts empty in the pretend API: publish something,
// and the feed refreshes itself. (Type fakeApi.fail = true in the browser console to see the error notice.)
createRoot(document.getElementById('forumwp-root')).render(
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { staleTime: 30_000 } } })}>
    <SpacePage spaceId={3} />
  </QueryClientProvider>
);
