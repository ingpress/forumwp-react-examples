// @id 18.8
// @title BROKEN: a queryFn that doesn't return anything
// @section Common mistakes
// @api fake
// @expect error
// Added so this runs on its own: imports, useSpaces and SpaceList from 18.3 with the mistake
// in the queryFn, and the set-up. The spinner turns into the error message, and the console
// shows "Query data cannot be undefined".
import { createRoot } from '@wordpress/element';
import { Notice, Spinner } from '@wordpress/components';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';

const useSpaces = () =>
  useQuery({
    queryKey: ['spaces'],
queryFn: () => {
  apiFetch({ path: '/forumwp/v1/spaces' }); // WRONG: no return
},
  });

const SpaceList = () => {
  const { data: spaces, isPending, isError, error } = useSpaces();
  if (isPending) {
    return <Spinner />;
  }
  if (isError) {
    return <Notice status="error" isDismissible={false}>{error.message}</Notice>;
  }
  return spaces.map((space) => <p key={space.id}>{space.name}</p>);
};

createRoot(document.getElementById('forumwp-root')).render(
  <QueryClientProvider client={new QueryClient()}>
    <SpaceList />
  </QueryClientProvider>
);
