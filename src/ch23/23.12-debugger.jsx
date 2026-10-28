// @id 23.12
// @title Pausing the code with debugger
// @section 23.7
import { createRoot } from '@wordpress/element'; // Added so this runs on its own
import { Button } from '@wordpress/components'; // Added so this runs on its own
import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query'; // Added so this runs on its own

// Added so this runs on its own: a stand-in for useToggleSaved (Example 22.2 has a fuller one).
const useToggleSaved = (id) =>
  useMutation({
    mutationFn: (saved) => new Promise((resolve) => setTimeout(() => resolve({ id, saved }), 400)),
    onSuccess: (result) => console.log('Saved on the server:', result),
  });

// Added so this runs on its own: a SaveButton around the book's lines.
// Open the browser's developer tools (F12) first, then click the button: the page pauses on "debugger;".
const SaveButton = ({ post }) => {
  const toggle = useToggleSaved(post.id);

  const onClick = () => {
    debugger;
    toggle.mutate(!post.saved);
  };

  return <Button variant="secondary" onClick={onClick}>Save for later</Button>;
};

createRoot(document.getElementById('forumwp-root')).render(
  <QueryClientProvider client={new QueryClient()}>
    <SaveButton post={{ id: 42, saved: false }} />
  </QueryClientProvider>
);
