// @id 25.1
// @title The QueryClient setup: fresh for 30 seconds
// @section 25.2
// @api fake
// @click Help
import { useState, createRoot } from '@wordpress/element'; // Added so this runs on its own
import apiFetch from '@wordpress/api-fetch'; // Added so this runs on its own
import { Button, Spinner } from '@wordpress/components'; // Added so this runs on its own
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'; // Added so this runs on its own

const queryClient = new QueryClient( {
  defaultOptions: {
    queries: { staleTime: 30_000, refetchOnWindowFocus: false },
  },
} );

// Added so this runs on its own: two spaces to move between. Switch back within 30 seconds and the
// posts show at once, with no new request in the fake API log; after 30 seconds they still show at
// once, but a fresh copy is fetched in the background.
const SpacePosts = ( { spaceId } ) => {
  const { data, isPending, isFetching } = useQuery( {
    queryKey: [ 'feed', spaceId ],
    queryFn: () => apiFetch( { path: `/forumwp/v1/spaces/${ spaceId }/posts?per_page=3` } ),
  } );
  if ( isPending ) {
    return <Spinner />;
  }
  return (
    <>
      { data.items.map( ( p ) => <div className="fwp-post" key={ p.id }>{ p.title }</div> ) }
      { isFetching && <p>Refreshing in the background…</p> }
    </>
  );
};

// Added so this runs on its own
const App = () => {
  const [ spaceId, setSpaceId ] = useState( 1 );
  return (
    <>
      <p>
        <Button variant={ spaceId === 1 ? 'primary' : 'secondary' } onClick={ () => setSpaceId( 1 ) }>General</Button>{ ' ' }
        <Button variant={ spaceId === 2 ? 'primary' : 'secondary' } onClick={ () => setSpaceId( 2 ) }>Help</Button>
      </p>
      <SpacePosts spaceId={ spaceId } />
    </>
  );
};

createRoot( document.getElementById( 'forumwp-root' ) ).render( // Added so this runs on its own
  <QueryClientProvider client={ queryClient }><App /></QueryClientProvider>
);
