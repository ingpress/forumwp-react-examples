// @id 23.9
// @title Broken: a hook after an early return
// @section 23.3
// @api fake
// @expect error
import { createRoot, useRef, useState } from '@wordpress/element'; // Added so this runs on its own
import { Spinner } from '@wordpress/components'; // Added so this runs on its own
import apiFetch from '@wordpress/api-fetch'; // Added so this runs on its own
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'; // Added so this runs on its own

const FeedList = ({ query }) => {
  const [open, setOpen] = useState(false);
  if (query.isPending) {
    return <Spinner />;
  }
  const sentinel = useRef(); // only reached after loading
  // ...
  return query.data.items.map((post) => <p key={post.id} ref={sentinel}>{post.title}</p>); // Added so this runs on its own
};

// Added so this runs on its own: a screen that passes a query to FeedList.
const Home = () => {
  const query = useQuery({ queryKey: ['feed', 'home'], queryFn: () => apiFetch({ path: '/forumwp/v1/spaces/1/posts?per_page=3' }) });
  return <FeedList query={query} />;
};
createRoot(document.getElementById('forumwp-root')).render(
  <QueryClientProvider client={new QueryClient()}>
    <Home />
  </QueryClientProvider>
);
