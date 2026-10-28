// @id 18.3
// @title One cache entry per post, and isFetching
// @section 18.3
// @api fake
// Added so this runs on its own: imports.
import { useState, createRoot } from '@wordpress/element';
import { Button, Spinner } from '@wordpress/components';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';

// src/api/posts.js
const usePost = (id) =>
  useQuery({
    queryKey: ['post', id],
    queryFn: () => apiFetch({ path: `/forumwp/v1/posts/${id}` }),
  });

// Added so this runs on its own: a post viewer with buttons to switch posts. Switching back
// to a post you've seen shows it at once from the cache, while it refreshes in the background
// (staleTime is 0 here), which is when the small spinner from 18.4 appears.
const PostView = ({ id }) => {
  const { data: post, isPending, isFetching } = usePost(id);
  if (isPending) {
    return <Spinner />;
  }
  return (
    <article className="fwp-post">
      <strong>{post.title}</strong>
{isFetching && !isPending && <Spinner />}
      <p>{post.body}</p>
    </article>
  );
};

const App = () => {
  const [id, setId] = useState(1);
  return (
    <>
      {[1, 2, 3].map((n) => (
        <Button key={n} variant={n === id ? 'primary' : 'secondary'} onClick={() => setId(n)}>
          Post {n}
        </Button>
      ))}
      <PostView id={id} />
    </>
  );
};

window.fakeApi.delay = 1000; // Added: a slower pretend server, so the background spinner is easy to see
createRoot(document.getElementById('forumwp-root')).render(
  <QueryClientProvider client={new QueryClient()}>
    <App />
  </QueryClientProvider>
);
