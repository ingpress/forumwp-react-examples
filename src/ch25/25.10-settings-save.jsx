// @id 25.10
// @title Saving settings: put the answer straight into the cache
// @section 25.9
// @click Save
import { createRoot, useState, useEffect } from '@wordpress/element'; // Added so this runs on its own
import apiFetch from '@wordpress/api-fetch'; // Added so this runs on its own
import { Button, Notice, Spinner, TextControl } from '@wordpress/components'; // Added so this runs on its own
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; // Added so this runs on its own

// Added so this runs on its own: the settings route lives in wp-admin, so this answers it in the
// browser. Like the real endpoint, saving cleans the values and returns what was stored: an
// accent colour that isn't #rrggbb is replaced by the default.
const PATH = '/forumwp/v1/settings';
let stored = { community_name: 'Maker Collective', accent: '#3858e9' };
apiFetch.use( ( options, next ) => {
  if ( options.path !== PATH ) {
    return next( options );
  }
  console.info( `[stub] ${ options.method ?? 'GET' } ${ PATH }` );
  if ( options.method === 'POST' ) {
    const s = options.data;
    stored = {
      community_name: s.community_name.trim() || 'My community',
      accent: /^#[0-9a-f]{6}$/i.test( s.accent.trim() ) ? s.accent.trim() : '#3858e9',
    };
  }
  return new Promise( ( resolve ) => setTimeout( () => resolve( { ...stored } ), 400 ) );
} );

// Added so this runs on its own: the parts of app/admin/SettingsApp.js around the mutation.
const SettingsApp = () => {
  const queryClient = useQueryClient();
  const { data } = useQuery( { queryKey: [ 'settings' ], queryFn: () => apiFetch( { path: PATH } ) } );
  const [ form, setForm ] = useState( null );
  useEffect( () => {
    if ( data ) {
      setForm( data ); // Shows what the server stored after each save.
    }
  }, [ data ] );

  const save = useMutation( {
    mutationFn: ( settings ) =>
      apiFetch( { path: PATH, method: 'POST', data: settings } ),
    onSuccess: ( response ) =>
      queryClient.setQueryData( [ 'settings' ], response ),
  } );

  if ( ! form ) {
    return <Spinner />;
  }
  const set = ( key ) => ( value ) => setForm( { ...form, [ key ]: value } );
  return (
    <>
      { save.isSuccess && <Notice status="success" onRemove={ () => save.reset() }>Settings saved.</Notice> }
      <TextControl label="Community name" value={ form.community_name } onChange={ set( 'community_name' ) } __next40pxDefaultSize __nextHasNoMarginBottom />
      <TextControl label="Accent colour (try 'blue', then save)" value={ form.accent } onChange={ set( 'accent' ) } __next40pxDefaultSize __nextHasNoMarginBottom />
      <p>
        <Button variant="primary" isBusy={ save.isPending } disabled={ save.isPending } onClick={ () => save.mutate( form ) }>Save</Button>
      </p>
      <p>In the cache: <code>{ JSON.stringify( data ) }</code></p>
    </>
  );
};

createRoot( document.getElementById( 'forumwp-root' ) ).render( // Added so this runs on its own
  <QueryClientProvider client={ new QueryClient() }><SettingsApp /></QueryClientProvider>
);
