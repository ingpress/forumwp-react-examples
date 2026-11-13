// @id 42.2
// @title A conditional write: an edit that saves only while it's still a draft, and 409 when it isn't
// @section 42.3
// @click Play the race
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, RadioControl } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: a pretend database. $wpdb->update() and $wpdb->query()
// return how many rows they changed, as the real ones do.
let row;
let options;
let votes;
let notified;
const reset = () => {
  row = { id: 41, status: 'draft', body: 'Where should we meet?' };
  options = [ 'A', 'B' ];
  votes = [];
  notified = 0;
};
reset();
let log = [];
const sql = ( text, changed ) => {
  log.push( `${ text } → ${ changed } row${ changed === 1 ? '' : 's' } changed` );
  return changed;
};
// UPDATE wp_forumwp_posts SET … WHERE id = 41 [AND status = 'draft']
const updatePost = ( cols, where ) => {
  const matches = Object.entries( where ).every( ( [ k, v ] ) => row[ k ] === v );
  if ( matches ) {
    Object.assign( row, cols );
  }
  const cond = Object.entries( where ).map( ( [ k, v ] ) => `${ k } = ${ JSON.stringify( v ) }` ).join( ' AND ' );
  return sql( `UPDATE posts SET ${ Object.keys( cols ).join( ', ' ) } WHERE ${ cond }`, matches ? 1 : 0 );
};
// DELETE FROM poll_options WHERE post_id = 41 [AND EXISTS ( … status = 'draft' )], then insert.
const replaceOptions = ( next, conditional ) => {
  const ok = ! conditional || row.status === 'draft';
  const cleared = sql( `DELETE FROM poll_options WHERE post_id = 41${ conditional ? " AND EXISTS ( SELECT 1 FROM posts WHERE id = 41 AND status = 'draft' )" : '' }`, ok ? options.length : 0 );
  if ( cleared ) {
    options = next;
    votes = []; // votes pointed at the old options' rows
    log.push( `INSERT INTO poll_options … ${ next.join( ', ' ) }` );
  }
};

// Posts::publish_draft(): only the request that changed the row announces it.
const publishDraft = ( conditional ) => {
  const done = updatePost( { status: 'published' }, conditional ? { id: 41, status: 'draft' } : { id: 41 } );
  if ( conditional ? done === 1 : true ) {
    notified += 3; // forumwp_post_published: three followers hear about it
    log.push( 'forumwp_post_published fired: 3 followers notified' );
  }
};

// PostsController::update() for Tunde's draft. "read" happens when the request starts;
// "write" a few milliseconds later.
const tundeRead = () => {
  const isDraft = row.status === 'draft';
  log.push( `Tunde's POST /posts/41 reads the post: status ${ row.status } → $is_draft = ${ isDraft } (so it isn't screened)` );
  return isDraft;
};
const tundeWrite = ( isDraft, conditional ) => {
  const edit = { body: 'Vote here: https://cheap-pills.example' };
  if ( isDraft ) {
    replaceOptions( [ 'X', 'Y' ], conditional );
  }
  updatePost( edit, conditional && isDraft ? { id: 41, status: 'draft' } : { id: 41 } );
  if ( conditional && isDraft && row.status !== 'draft' ) {
    log.push( '409 forumwp_not_draft: This draft was published while you were editing it. Open the post to edit it.' );
  } else {
    log.push( '200: the edit was saved, unscreened' );
  }
};

const Demo = () => {
  const [ how, setHow ] = useState( 'conditional' );
  const [ lines, setLines ] = useState( [] );
  const conditional = how === 'conditional';
  const run = ( steps ) => {
    reset();
    log = [];
    steps();
    log.push( `Now: status ${ row.status }, body "${ row.body }", options ${ options.join( ' / ' ) }, votes ${ votes.length ? votes.join( ', ' ) : 'none' }, notifications ${ notified }` );
    log.forEach( ( l ) => console.log( l ) );
    setLines( log );
  };
  return (
    <div style={ { maxWidth: 760 } }>
      <RadioControl
        label="How the writes are made"
        selected={ how }
        options={ [
          { label: "ForumWP: WHERE id = 41 AND status = 'draft' (and AND EXISTS for the options)", value: 'conditional' },
          { label: 'The first version: WHERE id = 41', value: 'plain' },
        ] }
        onChange={ setHow }
      />
      <p>
        <Button
          variant="primary"
          onClick={ () => run( () => {
            const isDraft = tundeRead(); // 10:00:04.990
            log.push( 'Mei presses Publish:' ); // 10:00:05.000
            publishDraft( conditional );
            votes.push( 'Ade → B' );
            log.push( 'Ade votes for B' );
            log.push( "Tunde's request reaches its writes:" ); // 10:00:05.010
            tundeWrite( isDraft, conditional );
          } ) }
        >
          Play the race
        </Button>{ ' ' }
        <Button variant="secondary" onClick={ () => run( () => { log.push( 'Two Publish clicks arrive together:' ); publishDraft( conditional ); publishDraft( conditional ); } ) }>
          Double-click Publish
        </Button>
      </p>
      <ol className="fwp-log">{ lines.map( ( l, i ) => <li key={ i }>{ l }</li> ) }</ol>
    </div>
  );
};

document.head.insertAdjacentHTML( 'beforeend', `<style>
  .fwp-log li { word-break: break-word; margin-bottom: 4px; font-size: 13px; }
</style>` ); // Added so this runs on its own

createRoot( document.getElementById( 'forumwp-root' ) ).render( <Demo /> );
