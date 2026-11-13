// @id 42.4
// @title The React side: Save as draft, My drafts, publishing with a held notice, and a 409 shown in the composer
// @section 42.6
// @click Save as draft
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, Card, CardBody, CheckboxControl, Notice, TextareaControl } from '@wordpress/components'; // Added so this runs on its own
import { __, _n, sprintf } from '@wordpress/i18n'; // Added so this runs on its own
import { QueryClient, QueryClientProvider, useMutation, useMutationState, useQuery, useQueryClient } from '@tanstack/react-query'; // Added so this runs on its own

// Added so this runs on its own: a pretend ForumWP server for Tunde (user 7) in Meetups (space 4).
const SPACE = { id: 4, title: 'Meetups' };
const settings = { tundeIsNew: false, meiRaces: false };
const server = {
  posts: [ { id: 40, space: SPACE, author: { id: 7 }, body: 'Venue ideas: the library, the hub', status: 'draft' } ],
  next: 41,
};
const wait = ( ms = 300 ) => new Promise( ( r ) => setTimeout( r, ms ) );
const fail = ( code, message, status ) => Promise.reject( { code, message, data: { status } } );
const present = ( p ) => ( { ...p, can: { publish: p.status === 'draft', edit: true, delete: true } } );
const api = {
  // GET /drafts and GET /spaces/4/drafts (Tunde is a member: his own only, with a total).
  myDrafts: async () => { await wait(); return { items: server.posts.filter( ( p ) => p.status === 'draft' ).map( present ) }; },
  spaceDrafts: async () => { await wait(); const items = server.posts.filter( ( p ) => p.status === 'draft' && p.space.id === 4 ).map( present ); return { items, total: items.length }; },
  feed: async () => { await wait(); return { items: server.posts.filter( ( p ) => p.status === 'published' ).map( present ) }; },
  // POST /spaces/4/posts, with draft: true or without.
  create: async ( { draft, ...data } ) => {
    await wait();
    const status = draft ? 'draft' : settings.tundeIsNew ? 'pending' : 'published';
    const post = { id: server.next++, space: SPACE, author: { id: 7 }, body: data.body, status };
    server.posts.unshift( post );
    return present( post );
  },
  // POST /posts/{id}: reads $is_draft, then writes WHERE id = … AND status = 'draft'.
  update: async ( { id, body } ) => {
    const post = server.posts.find( ( p ) => p.id === id );
    const isDraft = post.status === 'draft';
    await wait( 150 );
    if ( settings.meiRaces && isDraft ) {
      post.status = 'published'; // Mei's publish lands between the read and the write
      console.log( 'Server: Mei published post', id, 'while the save was on its way' );
    }
    await wait( 150 );
    if ( isDraft && post.status !== 'draft' ) {
      return fail( 'forumwp_not_draft', 'This draft was published while you were editing it. Open the post to edit it.', 409 );
    }
    post.body = body;
    return present( post );
  },
  // POST /posts/{id}/publish: screened like a new post when its author publishes it.
  publish: async ( id ) => {
    await wait();
    const post = server.posts.find( ( p ) => p.id === id );
    if ( post.status !== 'draft' ) {
      return fail( 'forumwp_not_draft', 'Only a draft’s host and the space’s moderators can publish it.', 403 );
    }
    post.status = settings.tundeIsNew ? 'pending' : 'published';
    return present( post );
  },
};

// ForumWP, app/portal/api/posts.js and spaces.js, shortened: every drafts list starts with 'drafts'.
const useMyDrafts = () => useQuery( { queryKey: [ 'drafts', 'mine' ], queryFn: api.myDrafts } );
const useSpaceDrafts = ( spaceId ) => useQuery( { queryKey: [ 'drafts', spaceId ], queryFn: api.spaceDrafts } );
const refresh = ( queryClient ) => {
  queryClient.invalidateQueries( { queryKey: [ 'drafts' ] } );
  queryClient.invalidateQueries( { queryKey: [ 'feed' ] } );
};
const useCreatePost = () => {
  const queryClient = useQueryClient();
  return useMutation( { mutationFn: api.create, onSuccess: () => refresh( queryClient ) } );
};
const useUpdatePost = () => {
  const queryClient = useQueryClient();
  return useMutation( { mutationFn: api.update, onSettled: () => refresh( queryClient ) } );
};
const usePublishDraft = () => {
  const queryClient = useQueryClient();
  return useMutation( { mutationKey: [ 'publishDraft' ], mutationFn: api.publish, onSuccess: () => refresh( queryClient ) } );
};

// ForumWP, app/portal/components/Drafts.js: useHeldNotice().
const useHeldNotice = ( spaceId ) => {
  const held = useMutationState( {
    filters: { mutationKey: [ 'publishDraft' ], status: 'success' },
    select: ( mutation ) => mutation.state.data?.status === 'pending' && ( ! spaceId || mutation.state.data?.space?.id === spaceId ),
  } ).some( Boolean );
  return held ? <Notice status="info" isDismissible={ false }>{ __( 'Thanks! Your post will appear once a moderator has looked at it.', 'forumwp' ) }</Notice> : null;
};

// The post box: "Save as draft" and "Post" share one mutation.
const Composer = () => {
  const create = useCreatePost();
  const [ body, setBody ] = useState( 'Ideas for the spring meetup' );
  const [ notice, setNotice ] = useState( null );
  const canKeep = !! body.trim();
  const send = ( asDraft ) =>
    create
      .mutateAsync( { body, ...( asDraft ? { draft: true } : {} ) } )
      .then( ( created ) => {
        setBody( '' );
        setNotice( asDraft ? __( 'Saved as a draft. Only you and the space’s moderators can see it.', 'forumwp' ) : created.status === 'pending' ? __( 'Thanks! Your post will appear once a moderator has looked at it.', 'forumwp' ) : null );
      } )
      .catch( () => {} );
  return (
    <Card><CardBody>
      <TextareaControl __nextHasNoMarginBottom label="New post in Meetups" value={ body } onChange={ setBody } />
      <p>
        <Button variant="secondary" disabled={ ! canKeep || create.isPending } onClick={ () => send( true ) }>Save as draft</Button>{ ' ' }
        <Button variant="primary" disabled={ ! canKeep || create.isPending } onClick={ () => send( false ) }>Post</Button>
      </p>
      { notice && <Notice status="success" onRemove={ () => setNotice( null ) }>{ notice }</Notice> }
    </CardBody></Card>
  );
};

// Editing a saved draft: save, or save and then publish.
const DraftEditor = ( { draft, onDone } ) => {
  const update = useUpdatePost();
  const publish = usePublishDraft();
  const [ body, setBody ] = useState( draft.body );
  const resave = ( andPublish ) => {
    update.reset();
    publish.reset();
    update
      .mutateAsync( { id: draft.id, body } )
      .then( () => andPublish && publish.mutateAsync( draft.id ) )
      .then( () => onDone() )
      .catch( () => {} ); // the error shows below
  };
  const error = update.error ?? publish.error;
  return (
    <div className="fwp-editor">
      <TextareaControl __nextHasNoMarginBottom label="Edit draft" value={ body } onChange={ setBody } />
      <p>
        <Button variant="tertiary" onClick={ onDone }>Cancel</Button>{ ' ' }
        <Button variant="secondary" isBusy={ update.isPending } onClick={ () => resave( false ) }>Save draft</Button>{ ' ' }
        <Button variant="primary" isBusy={ publish.isPending } disabled={ ! draft.can.publish } onClick={ () => resave( true ) }>Publish</Button>
      </p>
      { error && <Notice status="error" isDismissible={ false }>{ error.message } ({ error.data?.status })</Notice> }
    </div>
  );
};

const MyDrafts = () => {
  const { data, isPending } = useMyDrafts();
  const heldNotice = useHeldNotice();
  // The draft being edited is kept here, so the editor (and a 409 in it) stays open
  // even when the list refetches and the draft is no longer in it.
  const [ editing, setEditing ] = useState( null );
  return (
    <section>
      <h3>My drafts</h3>
      { heldNotice }
      { editing && <DraftEditor key={ editing.id } draft={ editing } onDone={ () => setEditing( null ) } /> }
      { isPending && <p>Loading…</p> }
      { data?.items.length === 0 && <p className="fwp-muted">No drafts. Use “Save as draft” in the post box to keep a post here until it’s ready.</p> }
      { data?.items.map( ( d ) => (
        <div key={ d.id } className="fwp-card">
          <span className="fwp-badge">Draft</span> { d.body }{ ' ' }
          <Button variant="link" onClick={ () => setEditing( d ) }>Edit</Button>
        </div>
      ) ) }
    </section>
  );
};

const SpacePanel = () => {
  const { data } = useSpaceDrafts( SPACE.id );
  const feed = useQuery( { queryKey: [ 'feed' ], queryFn: api.feed } );
  const heldNotice = useHeldNotice( SPACE.id );
  const total = data?.total ?? 0;
  return (
    <section>
      <h3>Meetups</h3>
      { heldNotice }
      { total > 0 && <p><strong>{ sprintf( /* translators: %d: number of drafts */ _n( '%d draft', '%d drafts', total, 'forumwp' ), total ) }</strong> <span className="fwp-muted">Only you and the space’s moderators see these until they’re published.</span></p> }
      { feed.data?.items.map( ( p ) => <div key={ p.id } className="fwp-card">{ p.body }</div> ) }
      { feed.data?.items.length === 0 && <p className="fwp-muted">No posts yet.</p> }
    </section>
  );
};

const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );

const Demo = () => {
  const [ opts, setOpts ] = useState( settings );
  const set = ( key ) => ( value ) => { settings[ key ] = value; setOpts( { ...settings } ); };
  return (
    <QueryClientProvider client={ queryClient }>
      <div style={ { maxWidth: 760 } }>
        <CheckboxControl __nextHasNoMarginBottom label="Tunde joined two days ago: his posts, and drafts he publishes, are held for a moderator" checked={ opts.tundeIsNew } onChange={ set( 'tundeIsNew' ) } />
        <CheckboxControl __nextHasNoMarginBottom label="Mei, a moderator, publishes the draft while Tunde's save is on its way" checked={ opts.meiRaces } onChange={ set( 'meiRaces' ) } />
        <Composer />
        <div className="fwp-cols"><MyDrafts /><SpacePanel /></div>
      </div>
    </QueryClientProvider>
  );
};

document.head.insertAdjacentHTML( 'beforeend', `<style>
  .fwp-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 16px; }
  .fwp-muted { color: #757575; font-size: 13px; }
  .fwp-editor { display: grid; gap: 4px; }
</style>` ); // Added so this runs on its own

createRoot( document.getElementById( 'forumwp-root' ) ).render( <Demo /> );
