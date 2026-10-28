// @id 19.4
// @title Reading the address with useParams
// @section 19.4
// @api fake
// src/screens/SpacePage.js
import { createRoot } from '@wordpress/element';
import { useParams } from 'react-router-dom';
import { Spinner } from '@wordpress/components';
// Added so this runs on its own: the imports for the pieces inlined below.
import { MemoryRouter, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';

// Added so this runs on its own: useSpaces and usePost from Chapter 18 (src/api/spaces.js and src/api/posts.js).
const useSpaces = () =>
  useQuery({
    queryKey: ['spaces'],
    queryFn: () => apiFetch({ path: '/forumwp/v1/spaces' }),
  });
const usePost = (id) =>
  useQuery({
    queryKey: ['post', id],
    queryFn: () => apiFetch({ path: `/forumwp/v1/posts/${id}` }),
    retry: false,
  });

// Added so this runs on its own: a small SpaceFeed and NotFound.
const SpaceFeed = ({ spaceId }) => {
  const { data, isPending } = useQuery({
    queryKey: ['posts', spaceId],
    queryFn: () => apiFetch({ path: `/forumwp/v1/spaces/${spaceId}/posts?per_page=3` }),
  });
  if (isPending) {
    return <Spinner />;
  }
  return data.items.map((post) => (
    <p key={post.id}><Link to={`/p/${post.id}`}>{post.title}</Link></p>
  ));
};
const NotFound = () => <h1>Page not found</h1>;

const SpacePage = () => {
  const { slug } = useParams();
  const { data: spaces, isPending } = useSpaces();

  if (isPending) {
    return <Spinner />;
  }

  const space = spaces.find((s) => s.slug === slug);
  if (!space) {
    return <NotFound />;
  }

  return (
    <>
      <h1>{space.name}</h1>
      <SpaceFeed spaceId={space.id} />
    </>
  );
};

// The PostPage from the same section. The book leaves the rest as "// ..."; the lines after it were added so this runs on its own.
const PostPage = () => {
  const { id } = useParams();
  const { data: post, isPending, isError } = usePost(Number(id));
  // ...
  if (isPending) {
    return <Spinner />;
  }
  if (isError) {
    return <NotFound />;
  }
  return <h1>{post.title}</h1>;
};

// Added so this runs on its own: routes, links between spaces, and the providers.
// In the course this is BrowserRouter; MemoryRouter keeps the address inside the example so it runs anywhere.
createRoot(document.getElementById('forumwp-root')).render(
  <QueryClientProvider client={new QueryClient()}>
    <MemoryRouter initialEntries={['/s/general']}>
      <nav>
        <Link to="/s/general">General</Link> · <Link to="/s/help">Help</Link> · <Link to="/s/deleted-space">A deleted space</Link>
      </nav>
      <Routes>
        <Route path="/s/:slug" element={<SpacePage />} />
        <Route path="/p/:id" element={<PostPage />} />
      </Routes>
    </MemoryRouter>
  </QueryClientProvider>
);
