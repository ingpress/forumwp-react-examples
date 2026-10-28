// @id 27.4
// @title Settings that are a list of objects (webhooks)
// @section 27.4
// @click Add a webhook
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import apiFetch from '@wordpress/api-fetch'; // Added so this runs on its own
import { Button, CheckboxControl, TextControl, ToggleControl } from '@wordpress/components'; // Added so this runs on its own
import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query'; // Added so this runs on its own

// Added so this runs on its own: Pro's settings route lives in wp-admin, so this answers it in the
// browser. Like Webhooks::clean(), it gives new rows an id and a 32-character secret and keeps both
// for existing rows. The browser never invents them.
const PATH = '/forumwp/v1/settings';
const random = ( n ) => [ ...crypto.getRandomValues( new Uint8Array( n ) ) ].map( ( b ) => 'abcdefghijklmnopqrstuvwxyz0123456789'[ b % 36 ] ).join( '' );
apiFetch.use( ( options, next ) => {
  if ( options.path !== PATH ) {
    return next( options );
  }
  console.info( `[stub] POST ${ PATH }` );
  const webhooks = ( options.data.webhooks ?? [] )
    .filter( ( h ) => h.url.trim() )
    .map( ( h ) => ( { ...h, id: h.id ?? 'wh_' + random( 8 ), secret: h.secret ?? random( 32 ) } ) );
  return new Promise( ( resolve ) => setTimeout( () => resolve( { ...options.data, webhooks } ), 400 ) );
} );

// Added so this runs on its own: the events a webhook can send, and an empty new row.
const EVENTS = [
  { id: 'post.created', label: 'A post is published' },
  { id: 'comment.created', label: 'A comment is added' },
  { id: 'member.joined', label: 'A member joins' },
];
const newHook = () => ( { url: '', events: [ 'post.created' ], private: false, active: true } );

// Added so this runs on its own: one webhook. set( key ) returns a function that changes one field.
const WebhookRow = ( { hook, onChange, onRemove } ) => {
  const set = ( key ) => ( value ) => onChange( { ...hook, [ key ]: value } );
  return (
    <div className="fwp-card">
      <TextControl label="URL" value={ hook.url } onChange={ set( 'url' ) } __next40pxDefaultSize __nextHasNoMarginBottom />
      { EVENTS.map( ( event ) => (
        <CheckboxControl
          key={ event.id }
          label={ event.label }
          checked={ hook.events.includes( event.id ) }
          onChange={ ( on ) =>
            set( 'events' )(
              on ? [ ...hook.events, event.id ] : hook.events.filter( ( e ) => e !== event.id )
            )
          }
          __nextHasNoMarginBottom
        />
      ) ) }
      <ToggleControl label="Active" checked={ hook.active } onChange={ set( 'active' ) } __nextHasNoMarginBottom />
      <p>{ hook.secret ? <>Secret: <code>{ hook.secret }</code></> : 'Not saved yet: the server adds the id and secret.' }</p>
      <Button variant="tertiary" isDestructive onClick={ onRemove }>Remove</Button>
    </div>
  );
};

// Added so this runs on its own: the parts of app/admin/WebhooksSettings.js around the list.
const WebhooksSettings = () => {
  const [ form, setForm ] = useState( {
    webhooks: [ { id: 'wh_k3j9a1x2', url: 'https://hooks.example.com/forumwp', events: [ 'post.created' ], secret: 'q8w3e5r7t9y1u2i4o6p8a0s2d4f6g8h0', private: false, active: true } ],
  } );
  const set = ( key ) => ( value ) => setForm( ( f ) => ( { ...f, [ key ]: value } ) );
  const save = useMutation( {
    mutationFn: ( settings ) => apiFetch( { path: PATH, method: 'POST', data: settings } ),
    onSuccess: ( stored ) => setForm( stored ), // Show what the server stored.
  } );

  const hooks = form.webhooks ?? [];
  const update = set( 'webhooks' );

  return (
    <>
      { hooks.map( ( hook, i ) => (
        <WebhookRow
          key={ hook.id ?? `new-${ i }` }
          hook={ hook }
          // Change one: map, swapping in the new object at its index.
          onChange={ ( next ) => update( hooks.map( ( h, j ) => ( j === i ? next : h ) ) ) }
          // Remove one: filter out its index.
          onRemove={ () => update( hooks.filter( ( _, j ) => j !== i ) ) }
        />
      ) ) }
      <p>
        <Button
          variant="secondary"
          // Add one: spread the old ones, then the new one.
          onClick={ () => update( [ ...hooks, newHook() ] ) }
        >
          Add a webhook
        </Button>{ ' ' }
        <Button variant="primary" isBusy={ save.isPending } disabled={ save.isPending } onClick={ () => save.mutate( form ) }>Save</Button>
      </p>
      <pre style={ { whiteSpace: 'pre-wrap' } }>{ JSON.stringify( form, null, 1 ) }</pre>
    </>
  );
};

createRoot( document.getElementById( 'forumwp-root' ) ).render( // Added so this runs on its own
  <QueryClientProvider client={ new QueryClient() }><WebhooksSettings /></QueryClientProvider>
);
