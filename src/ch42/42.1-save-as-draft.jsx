// @id 42.1
// @title Save as draft: one route, a draft flag, a cap of 100 and 30 an hour
// @section 42.1
// @click Save as draft
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, CheckboxControl, RadioControl } from '@wordpress/components'; // Added so this runs on its own
import { _n, sprintf } from '@wordpress/i18n'; // Added so this runs on its own

// Added so this runs on its own: a pretend server with ForumWP's posts table and Spam's
// hourly counters. Kemi already has 97 drafts of her own, and 40 copies "Duplicate space…"
// made for her (copied_from), which don't count.
const MAX_DRAFTS = 100; // forumwp_max_drafts
const PER_HOUR = 30; // forumwp_drafts_per_hour
const db = { posts: [], hour: {} };
const seed = () => {
  db.posts = [
    ...Array.from( { length: 97 }, ( _, i ) => ( { id: i + 1, user_id: 8, status: 'draft', meta: {} } ) ),
    ...Array.from( { length: 40 }, ( _, i ) => ( { id: 200 + i, user_id: 8, status: 'draft', meta: { copied_from: 50 + i } } ) ),
  ];
  db.hour = {};
};
seed();
const error = ( code, message, status ) => ( { code, message, data: { status } } );

// Posts::count_drafts(): copies made by "Duplicate space…" left out.
const countDrafts = ( user ) => db.posts.filter( ( p ) => p.user_id === user && p.status === 'draft' && ! p.meta.copied_from ).length;
// Spam::limited() and Spam::record(): a transient per action and user, for an hour.
const limited = ( action, user, limit ) => limit > 0 && ( db.hour[ `${ action }:${ user }` ] ?? 0 ) >= limit;
const record = ( action, user ) => ( db.hour[ `${ action }:${ user }` ] = ( db.hour[ `${ action }:${ user }` ] ?? 0 ) + 1 );

// PostsController::create(), the parts this example is about.
const create = ( params, { user, isModerator, forum } ) => {
  const data = { ...params };
  const draft = !! data.draft;
  delete data.draft; // never passed on as a field
  // is_empty() for a draft; missing() (the space's own rules) for a post.
  if ( draft ) {
    if ( ! ( data.title ?? '' ).trim() && ! ( data.body ?? '' ).trim() ) {
      return error( 'forumwp_empty_post', 'Write something before posting.', 400 );
    }
  } else if ( forum && ! ( data.title ?? '' ).trim() ) {
    return error( 'forumwp_topic_title', 'Give the topic a title.', 400 );
  }
  if ( draft ) {
    if ( countDrafts( user ) >= MAX_DRAFTS ) {
      return error( 'forumwp_too_many_drafts', sprintf( _n( 'You have %d draft. Publish or delete it before saving another.', 'You have %d drafts. Publish or delete some before saving another.', MAX_DRAFTS, 'forumwp' ), MAX_DRAFTS ), 400 );
    }
    if ( ! isModerator && limited( 'draft', user, PER_HOUR ) ) {
      return error( 'forumwp_rate_limited', 'You have saved a lot of drafts in the last hour. Please wait a while before saving another.', 429 );
    }
    record( 'draft', user );
    delete data.publish_at; // a draft goes out when it is published
  }
  const post = { id: 1000 + db.posts.length, user_id: user, status: draft ? 'draft' : 'published', meta: {}, ...data };
  db.posts.push( post );
  return { id: post.id, status: post.status, title: post.title ?? '', body: post.body ?? '' };
};

const Demo = () => {
  const [ who, setWho ] = useState( 'member' );
  const [ forum, setForum ] = useState( true );
  const [ log, setLog ] = useState( [] );
  const [ , redraw ] = useState( 0 );
  const ctx = { user: 8, isModerator: who === 'moderator', forum };
  const send = ( label, params ) => {
    const r = create( params, ctx );
    const line = `${ label } → ${ r.code ? `${ r.data.status } ${ r.code }: ${ r.message }` : `200 { id: ${ r.id }, status: '${ r.status }' }` }`;
    console.log( line );
    setLog( ( l ) => [ line, ...l ].slice( 0, 12 ) );
  };
  return (
    <div style={ { maxWidth: 720 } }>
      <RadioControl
        label="Kemi is"
        selected={ who }
        options={ [ { label: 'a member', value: 'member' }, { label: 'a community moderator (no hourly limit)', value: 'moderator' } ] }
        onChange={ setWho }
      />
      <CheckboxControl __nextHasNoMarginBottom label="The space is a forum (a new post needs a title)" checked={ forum } onChange={ setForum } />
      <p>
        <Button variant="primary" onClick={ () => send( 'Save as draft (no title)', { body: 'Ideas for the spring meetup', draft: true } ) }>Save as draft</Button>{ ' ' }
        <Button variant="secondary" onClick={ () => send( 'Post (no title)', { body: 'Ideas for the spring meetup' } ) }>Post</Button>{ ' ' }
        <Button variant="secondary" onClick={ () => send( 'Save as draft (empty)', { draft: true } ) }>Save an empty draft</Button>
      </p>
      <p>
        <Button variant="secondary" onClick={ () => { for ( let i = 0; i < 31; i++ ) { send( `Draft ${ i + 1 } of 31`, { body: `Note ${ i + 1 }`, draft: true } ); db.posts = db.posts.filter( ( p ) => p.id < 1000 ); } } }>Save 31 drafts, deleting each</Button>{ ' ' }
        <Button variant="secondary" onClick={ () => { const i = db.posts.findIndex( ( p ) => p.user_id === 8 && p.status === 'draft' && ! p.meta.copied_from ); if ( i >= 0 ) { db.posts.splice( i, 1 ); } redraw( ( n ) => n + 1 ); } }>Delete one of her drafts</Button>{ ' ' }
        <Button variant="tertiary" onClick={ () => { db.hour = {}; redraw( ( n ) => n + 1 ); } }>An hour passes</Button>{ ' ' }
        <Button variant="tertiary" onClick={ () => { seed(); setLog( [] ); } }>Start again</Button>
      </p>
      <p className="fwp-muted">
        Her drafts (counted): { countDrafts( 8 ) } of { MAX_DRAFTS } · copies from "Duplicate space…" (not counted): { db.posts.filter( ( p ) => p.meta.copied_from ).length } · saved this hour: { db.hour[ 'draft:8' ] ?? 0 } of { PER_HOUR }
      </p>
      <ol className="fwp-log">{ log.map( ( line, i ) => <li key={ i }>{ line }</li> ) }</ol>
    </div>
  );
};

document.head.insertAdjacentHTML( 'beforeend', `<style>
  .fwp-log li { word-break: break-word; margin-bottom: 4px; font-size: 13px; }
  .fwp-muted { color: #757575; }
</style>` ); // Added so this runs on its own

createRoot( document.getElementById( 'forumwp-root' ) ).render( <Demo /> );
