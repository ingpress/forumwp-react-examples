// @id 19.6
// @title useNavigate: moving after a mutation
// @section 19.6
// @click Message
// From app/portal/components/MessageButton.js
import { createRoot } from '@wordpress/element';
// Added so this runs on its own: the imports MessageButton.js has in the real plugin.
import { Button } from '@wordpress/components';
import { envelope } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import { MemoryRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query';

// Added so this runs on its own: a stand-in for useStartConversation. The real one POSTs to the
// conversations route, which the course's fake API doesn't have, so this one answers after a short wait
// with a new conversation, id 42.
const useStartConversation = () =>
  useMutation({
    mutationFn: (data) =>
      new Promise((resolve) => {
        console.log('Starting a conversation with', data);
        setTimeout(() => resolve({ id: 42 }), 800);
      }),
  });

const MessageButton = ( { member } ) => {
  const navigate = useNavigate();
  const start = useStartConversation();

  return (
    <Button
      variant="secondary"
      icon={ envelope }
      isBusy={ start.isPending }
      disabled={ start.isPending }
      onClick={ () =>
        start.mutate(
          { user_ids: [ member.id ] },
          {
            onSuccess: ( conversation ) =>
              navigate( `/messages/${ conversation.id }` ),
          }
        )
      }
    >
      { __( 'Message', 'forumwp' ) }
    </Button>
  );
};

// Added so this runs on its own: a member card, the Messages screen and the router.
const MemberCard = () => (
  <div className="fwp-card">
    <h3>Tunde</h3>
    <MessageButton member={{ id: 2, name: 'Tunde' }} />
  </div>
);
const Messages = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  return (
    <>
      <h1>Conversation {id}</h1>
      <Button variant="link" onClick={() => navigate(-1)}>Back</Button>
    </>
  );
};

// In the course this is BrowserRouter; MemoryRouter keeps the address inside the example so it runs anywhere.
createRoot(document.getElementById('forumwp-root')).render(
  <QueryClientProvider client={new QueryClient()}>
    <MemoryRouter initialEntries={['/members']}>
      <Routes>
        <Route path="/members" element={<MemberCard />} />
        <Route path="/messages/:id?" element={<Messages />} />
      </Routes>
    </MemoryRouter>
  </QueryClientProvider>
);
