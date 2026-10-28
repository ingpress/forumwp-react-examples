// @id 18.11
// @title BROKEN: copying version 4 code
// @section Common mistakes
// @api fake
// @expect error
// Added so this runs on its own: imports, a fetchSpaces function, a component using the
// version 4 call, and the set-up.
import { createRoot } from '@wordpress/element';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';

const fetchSpaces = () => apiFetch({ path: '/forumwp/v1/spaces' });

const SpaceList = () => {
  const { data } = useQuery(['spaces'], fetchSpaces); // version 4 style: crashes in version 5
  return <p>{data ? data.length : 0} spaces</p>;
};

createRoot(document.getElementById('forumwp-root')).render(
  <QueryClientProvider client={new QueryClient()}>
    <SpaceList />
  </QueryClientProvider>
);
