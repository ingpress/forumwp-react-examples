// @id 27.3
// @title Drafts in storage, and a fresh composer per space with key
// @section 27.3
// @api fake
import { createRoot, useState, useEffect } from '@wordpress/element'; // Added so this runs on its own
import apiFetch from '@wordpress/api-fetch'; // Added so this runs on its own
import { Button, MenuGroup, MenuItem, Notice, Spinner, TextControl, TextareaControl } from '@wordpress/components'; // Added so this runs on its own
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; // Added so this runs on its own

// Added so this runs on its own: a short version of app/portal/utils/drafts.js.
const PREFIX = 'fwp-draft:';
const storage = () => {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const site = () => window.forumwpData?.basePath ?? '';

export const draftKey = ( userId, spaceId ) =>
  `${ PREFIX }${ site() }:${ userId }:${ spaceId ?? 'home' }`;

// Added so this runs on its own: the rest of drafts.js. loadDraft checks the shape before using it.
const loadDraft = ( key ) => {
  try {
    const d = JSON.parse( storage()?.getItem( key ) ?? 'null' );
    return d && typeof d.title === 'string' && typeof d.body === 'string' ? { title: d.title, body: d.body, spaceId: d.spaceId } : null;
  } catch {
    return null;
  }
};
const saveDraft = ( key, draft ) => {
  try {
    storage()?.setItem( key, JSON.stringify( draft ) );
  } catch {}
};
const clearDraft = ( key ) => {
  try {
    storage()?.removeItem( key );
  } catch {}
};
const ourKeys = () => Object.keys( storage() ?? {} ).filter( ( k ) => k.startsWith( `${ PREFIX }${ site() }:` ) );
const clearAllDrafts = () => ourKeys().forEach( clearDraft );
const forgetOtherDrafts = ( userId ) =>
  ourKeys().filter( ( k ) => k.slice( `${ PREFIX }${ site() }:`.length ).split( ':' )[ 0 ] !== String( userId ) ).forEach( clearDraft );
const EMPTY = { title: '', body: '', extra: {} };
const hasContent = ( form ) => !! ( form.title.trim() || form.body.trim() );

// Added so this runs on its own: creating a post (Chapter 18), refreshing the feed when it works.
const useCreatePost = () => {
  const queryClient = useQueryClient();
  return useMutation( {
    mutationFn: ( { spaceId, ...data } ) => apiFetch( { path: `/forumwp/v1/spaces/${ spaceId }/posts`, method: 'POST', data } ),
    onSuccess: () => queryClient.invalidateQueries( { queryKey: [ 'feed' ] } ),
  } );
};

// Added so this runs on its own: the parts of ComposerBox around the draft.
const ComposerBox = ( { space, initial } ) => {
  const storageKey = draftKey( window.forumwpData.currentUser.id, space?.id );
  const spaceId = space?.id;
  const create = useCreatePost();
  const [ open, setOpen ] = useState( true );

  const [ saved ] = useState( () => ( storageKey ? loadDraft( storageKey ) : null ) );
  const [ form, setForm ] = useState( () => {
    if ( initial ) {
      return { ...EMPTY, ...initial };
    }
    return saved ? { ...EMPTY, ...saved, extra: {} } : EMPTY;
  } );

  useEffect( () => {
    if ( ! storageKey ) {
      return;
    }
    if ( hasContent( form ) ) {
      // Add-on fields aren't kept: they may not make sense later.
      saveDraft( storageKey, {
        ...form,
        extra: undefined,
        // Before the spaces have loaded, keep the one the draft was for.
        spaceId: spaceId ?? saved?.spaceId,
      } );
    } else {
      clearDraft( storageKey );
    }
  }, [ storageKey, form, spaceId, saved ] );

  const submit = ( event ) => { // Added so this runs on its own
    event.preventDefault();
    create
      .mutateAsync( { spaceId, title: form.title, body: form.body /* … */ } )
      .then( ( created ) => {
        clearDraft( storageKey );
        setForm( EMPTY );
        setOpen( false );
      } )
      // The error shows from create.error.
      .catch( () => {} );
  };

  // Added so this runs on its own
  if ( ! open ) {
    return <Button variant="secondary" onClick={ () => setOpen( true ) }>Write a post in { space.name }</Button>;
  }
  return (
    <form className="fwp-card" onSubmit={ submit }>
      <TextControl label={ `Title (a post in ${ space.name })` } value={ form.title } onChange={ ( title ) => setForm( { ...form, title } ) } __next40pxDefaultSize __nextHasNoMarginBottom />
      <TextareaControl label="Post" value={ form.body } onChange={ ( body ) => setForm( { ...form, body } ) } __nextHasNoMarginBottom />
      { create.error && <Notice status="error" isDismissible={ false }>{ create.error.message }</Notice> }
      <Button variant="primary" type="submit" isBusy={ create.isPending } disabled={ create.isPending }>Post</Button>
    </form>
  );
};

// A fresh box (and its draft) for each space, even when the screen stays mounted.
const Composer = ( props ) => (
  <ComposerBox key={ props.space?.id ?? 'home' } { ...props } />
);

// Added so this runs on its own: a space screen that stays mounted while the space changes, a list
// of the drafts in storage, and the user menu's Log out item.
const SPACES = [ { id: 1, name: 'General' }, { id: 2, name: 'Help' } ];
const logoutUrl = '#logged-out'; // In ForumWP, wp_logout_url() from the server.
const Latest = ( { spaceId } ) => {
  const { data, isPending } = useQuery( { queryKey: [ 'feed', spaceId ], queryFn: () => apiFetch( { path: `/forumwp/v1/spaces/${ spaceId }/posts?per_page=3` } ) } );
  return isPending ? <Spinner /> : <p>Latest: { data.items.map( ( p ) => p.title ).join( ' · ' ) }</p>;
};
const DraftsInStorage = () => {
  const [ keys, setKeys ] = useState( [] );
  useEffect( () => {
    const id = setInterval( () => setKeys( ourKeys().map( ( k ) => `${ k } = ${ storage().getItem( k ) }` ) ), 500 );
    return () => clearInterval( id );
  }, [] );
  return <pre style={ { whiteSpace: 'pre-wrap' } }>Drafts in storage:{ '\n' }{ keys.join( '\n' ) || '(none)' }</pre>;
};
const SpaceScreen = () => {
  const [ space, setSpace ] = useState( SPACES[ 0 ] );
  return (
    <>
      <p>
        { SPACES.map( ( s ) => (
          <Button key={ s.id } variant={ s === space ? 'primary' : 'secondary' } onClick={ () => setSpace( s ) } style={ { marginRight: 8 } }>{ s.name }</Button>
        ) ) }
      </p>
      <Composer space={ space } />
      <Latest spaceId={ space.id } />
      <DraftsInStorage />
      <MenuGroup label="Ada">
        <MenuItem href={ logoutUrl } onClick={ clearAllDrafts } isDestructive>
          Log out
        </MenuItem>
      </MenuGroup>
    </>
  );
};

// app/portal/index.js, before the app renders
forgetOtherDrafts( window.forumwpData.currentUser?.id ?? 0 );

createRoot( document.getElementById( 'forumwp-root' ) ).render( // Added so this runs on its own
  <QueryClientProvider client={ new QueryClient() }><SpaceScreen /></QueryClientProvider>
);
