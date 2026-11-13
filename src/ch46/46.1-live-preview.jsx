// @id 46.1
// @title A live preview the server draws, after a pause in typing
// @section 46.3
import { createRoot, useEffect, useState } from '@wordpress/element'; // Added so this runs on its own
import { TextControl, TextareaControl, SelectControl } from '@wordpress/components'; // Added so this runs on its own
import { QueryClient, QueryClientProvider, useQuery, keepPreviousData } from '@tanstack/react-query'; // Added so this runs on its own

// Added so this runs on its own: a pretend POST /forumwp/v1/broadcasts/preview. Like
// Email::build(), it fills in merge tags for the member, escapes them, formats **bold**,
// and draws the one fixed layout. It takes 300 ms, like a real request.
const members = { 0: { name: 'Kemi', first: 'Kemi' }, 7: { name: 'Ada Obi', first: 'Ada' }, 9: { name: 'tunde_88', first: '' } };
const requests = [];
const escape = ( s ) => s.replace( /[&<>"]/g, ( c ) => ( { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ c ] ) );
const merge = ( text, member ) => text.replace( /\{first_name(?:\|([^}]*))?\}/g, ( _, fallback = '' ) => escape( member.first || fallback ) ).replace( /\{community_name\}/g, 'Plugin Builders' );
const preview = ( { subject, body, as } ) =>
  new Promise( ( resolve ) => {
    requests.push( subject );
    const member = members[ as ];
    const html = escape( body ).replace( /\*\*(.+?)\*\*/g, '<strong>$1</strong>' ).split( /\n{2,}/ ).map( ( p ) => `<p>${ p.replace( /\n/g, '<br>' ) }</p>` ).join( '' );
    setTimeout( () => resolve( {
      subject: merge( subject, member ).replace( /&amp;/g, '&' ),
      html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#fff">
        <div style="background:#4F46E5;color:#fff;padding:12px 16px;border-radius:8px;font-weight:600">Plugin Builders</div>
        <div style="padding:16px 0">${ merge( html, member ) }</div>
        <p style="color:#6b7280;font-size:12px">You're getting this because you're a member of Plugin Builders. <a href="#">Unsubscribe</a></p></div>`,
    } ), 300 );
  } );

// ForumWP, app/portal/broadcasts/api.js
const useDebounced = ( value, delay = 400 ) => {
  const [ settled, setSettled ] = useState( value );
  useEffect( () => {
    const timer = window.setTimeout( () => setSettled( value ), delay );

    return () => window.clearTimeout( timer );
  }, [ value, delay ] );

  return settled;
};

const usePreview = ( fields, as ) => {
  const settled = useDebounced( JSON.stringify( { ...fields, as } ), 500 );

  return useQuery( {
    queryKey: [ 'broadcasts', 'preview', settled ],
    queryFn: () => preview( JSON.parse( settled ) ),
    placeholderData: keepPreviousData,
  } );
};

const Composer = () => {
  const [ form, setForm ] = useState( { subject: 'Hi {first_name|there}', body: 'Demo night is on the **19th**.\n\nBring something you shipped.' } );
  const [ as, setAs ] = useState( '7' );
  const result = usePreview( form, Number( as ) );
  const set = ( key ) => ( value ) => setForm( ( f ) => ( { ...f, [ key ]: value } ) );

  return (
    <div style={ { display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 24 } }>
      <div>
        <TextControl __nextHasNoMarginBottom __next40pxDefaultSize label="Subject" value={ form.subject } onChange={ set( 'subject' ) } />
        <TextareaControl __nextHasNoMarginBottom label="Message" rows={ 6 } value={ form.body } onChange={ set( 'body' ) } />
        <SelectControl __nextHasNoMarginBottom __next40pxDefaultSize label="Preview as" value={ as } onChange={ setAs } options={ [ { label: 'Ada Obi', value: '7' }, { label: 'tunde_88 (no first name)', value: '9' }, { label: 'Yourself', value: '0' } ] } />
        <p className="fwp-muted">Requests sent to the server: { requests.length } { result.isFetching ? '· updating…' : '' }</p>
      </div>
      <div>
        <p><strong>Subject:</strong> { result.data?.subject }</p>
        <iframe
          title="Live preview of the email"
          sandbox="allow-same-origin"
          srcDoc={ result.data?.html ?? '' }
          style={ { width: '100%', height: 320, border: '1px solid #ddd', borderRadius: 8, background: '#f4f4f7' } }
        />
      </div>
    </div>
  );
};

const queryClient = new QueryClient(); // Added so this runs on its own
document.head.insertAdjacentHTML( 'beforeend', '<style>.fwp-muted{color:#757575}</style>' ); // Added so this runs on its own
createRoot( document.getElementById( 'forumwp-root' ) ).render(
  <QueryClientProvider client={ queryClient }>
    <Composer />
  </QueryClientProvider>
);
