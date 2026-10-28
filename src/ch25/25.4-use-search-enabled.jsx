// @id 25.4
// @title enabled: no search until two characters
// @section 25.5
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import apiFetch from '@wordpress/api-fetch'; // Added so this runs on its own
import { addQueryArgs, getQueryArg } from '@wordpress/url'; // Added so this runs on its own
import { TextControl, Spinner } from '@wordpress/components'; // Added so this runs on its own
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'; // Added so this runs on its own

// Added so this runs on its own: the pretend API has no /search route, so this answers it in the
// browser from a few made-up posts, and logs every request it gets.
const POSTS = [ 'Welcome to the community', 'How do I change my avatar?', 'Dark mode is here', 'Meetup in Lagos?', 'Feature request: polls', 'Release notes 0.20' ];
apiFetch.use( ( options, next ) => {
  if ( ! options.path?.startsWith( '/forumwp/v1/search' ) ) {
    return next( options );
  }
  const q = String( getQueryArg( options.path, 'q' ) ?? '' ).toLowerCase();
  console.info( `[stub] GET ${ options.path }` );
  return new Promise( ( resolve ) =>
    setTimeout( () => resolve( POSTS.filter( ( t ) => t.toLowerCase().includes( q ) ) ), 300 )
  );
} );

// Added so this runs on its own: get() from app/portal/api/client.js (Example 25.2).
const BASE = '/forumwp/v1';
const get = ( path, query = {} ) =>
  apiFetch( { path: addQueryArgs( BASE + path, query ) } );

// app/portal/api/misc.js
export const useSearch = ( q ) =>
  useQuery( {
    queryKey: [ 'search', q ],
    queryFn: () => get( '/search', { q } ),
    enabled: q.trim().length >= 2,
  } );

// Added so this runs on its own: type one letter (no request), then a second (one request).
const Search = () => {
  const [ q, setQ ] = useState( '' );
  const { data, isFetching, fetchStatus } = useSearch( q );
  return (
    <>
      <TextControl label="Search posts" value={ q } onChange={ setQ } __next40pxDefaultSize __nextHasNoMarginBottom />
      { fetchStatus === 'idle' && ! data && <p>Type at least two characters to search.</p> }
      { isFetching && <Spinner /> }
      { data && ( data.length ? data.map( ( t ) => <div className="fwp-post" key={ t }>{ t }</div> ) : <p>No posts match.</p> ) }
    </>
  );
};

createRoot( document.getElementById( 'forumwp-root' ) ).render( // Added so this runs on its own
  <QueryClientProvider client={ new QueryClient() }><Search /></QueryClientProvider>
);
