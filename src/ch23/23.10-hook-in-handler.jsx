// @id 23.10
// @title Broken: a hook inside a click handler
// @section 23.3
// @click Save for later
// @expect error
import { createRoot } from '@wordpress/element'; // Added so this runs on its own
import { Button } from '@wordpress/components'; // Added so this runs on its own
import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query'; // Added so this runs on its own

// Added so this runs on its own: a stand-in for useToggleSaved (Example 22.2 has a fuller one).
const useToggleSaved = (id) =>
  useMutation({ mutationFn: (saved) => Promise.resolve({ id, saved }) });

const SaveButton = ({ post }) => {
  const onClick = () => {
    const toggle = useToggleSaved(post.id); // a hook inside a click handler
    toggle.mutate(!post.saved);
  };
  // ...
  return <Button variant="secondary" onClick={onClick}>Save for later</Button>; // Added so this runs on its own
};

createRoot(document.getElementById('forumwp-root')).render(
  <QueryClientProvider client={new QueryClient()}>
    <SaveButton post={{ id: 42, saved: false }} />
  </QueryClientProvider>
);
