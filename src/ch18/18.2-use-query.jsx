// @id 18.2
// @title Setting up TanStack Query and reading spaces with useQuery
// @section 18.3
// @api fake
// src/index.js
import { createRoot } from '@wordpress/element';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// In the book: import App from './App';

// src/api/spaces.js
import { useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';

const useSpaces = () =>
  useQuery({
    queryKey: ['spaces'],
    queryFn: () => apiFetch({ path: '/forumwp/v1/spaces' }),
  });

// src/components/SpaceList.js
import { Spinner, Notice } from '@wordpress/components';
// In the book: import { useSpaces } from '../api/spaces'; import SpaceCard from './SpaceCard';

// Added so this runs on its own: a simple SpaceCard.
const SpaceCard = ({ space }) => (
  <div className="fwp-space-card">
    <strong>{space.name}</strong> <span className="fwp-badge">{space.memberCount} members</span>
    <p>{space.description}</p>
  </div>
);

const SpaceList = () => {
  const { data: spaces, isPending, isError, error } = useSpaces();

  if (isPending) {
    return <Spinner />;
  }
  if (isError) {
    return (
      <Notice status="error" isDismissible={false}>
        {error.message}
      </Notice>
    );
  }

  return spaces.map((space) => <SpaceCard key={space.id} space={space} />);
};

// Added so this runs on its own: an App with two SpaceLists. Both use the key ['spaces'],
// so the console below shows only ONE request (compare with Example 18.1).
const App = () => (
  <>
    <SpaceList />
    <h3>The same list again, from the same cache</h3>
    <SpaceList />
  </>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000 },
  },
});

createRoot(document.getElementById('forumwp-root')).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
