// @id 20.7
// @title Broken: putting server data in context
// @section 20.6
// @api fake
// @click Add a space
import { createRoot, createContext, useContext, useState, useEffect } from '@wordpress/element'; // Added so this runs on its own
import { Button } from '@wordpress/components'; // Added so this runs on its own
import apiFetch from '@wordpress/api-fetch'; // Added so this runs on its own
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query'; // Added so this runs on its own
const SpacesContext = createContext([]); // Added so this runs on its own

// WRONG: a hand-made cache in a provider
const SpacesProvider = ({ children }) => {
  const [spaces, setSpaces] = useState([]);
  useEffect(() => {
    apiFetch({ path: '/forumwp/v1/spaces' }).then(setSpaces);
  }, []);
  return <SpacesContext.Provider value={spaces}>{children}</SpacesContext.Provider>;
};

// Added so this runs on its own: a sidebar that reads the list, and an admin button that creates a space
// (straight into the fake API's data, as the real create route would) and invalidates ['spaces'].
// The sidebar doesn't change: invalidateQueries can't reach a list TanStack Query doesn't hold.
const Sidebar = () => {
  const spaces = useContext(SpacesContext);
  return <ul>{spaces.map((space) => <li key={space.id}>{space.name}</li>)}</ul>;
};
const AddSpace = () => {
  const queryClient = useQueryClient();
  return (
    <Button variant="secondary" onClick={() => {
      window.fakeApi.db.spaces.push({ id: 4, slug: 'events', name: 'Events', description: '', memberCount: 1 });
      queryClient.invalidateQueries({ queryKey: ['spaces'] });
      console.log('Created the space "Events" on the server. The sidebar still shows 3 spaces.');
    }}>Add a space</Button>
  );
};

createRoot(document.getElementById('forumwp-root')).render(
  <QueryClientProvider client={new QueryClient()}>
    <SpacesProvider>
      <Sidebar />
      <AddSpace />
    </SpacesProvider>
  </QueryClientProvider>
);
