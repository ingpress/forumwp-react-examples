// @id 40.4
// @title Loading in batches: "Replies and mentions" one by one, then with find_many()
// @section 40.4
// @click Build the section both ways
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: pretend tables, and a $wpdb that counts its queries.
// Kemi has 50 unread replies and mentions across 10 spaces. Space 10 is secret, and she
// isn't in it; comment 1007 was removed by a moderator.
const spaces = Array.from( { length: 10 }, ( _, i ) => ( { id: i + 1, title: `Space ${ i + 1 }`, secret: i === 9 } ) );
const posts = Array.from( { length: 30 }, ( _, i ) => ( { id: 200 + i, space_id: ( i % 10 ) + 1, title: `Post ${ 200 + i }`, status: 'published' } ) );
const comments = Array.from( { length: 40 }, ( _, i ) => ( { id: 1000 + i, post_id: 200 + ( i % 30 ), status: i === 7 ? 'removed' : 'published' } ) );
// Newest first: 40 about comments, 10 about posts.
const notifications = Array.from( { length: 50 }, ( _, i ) =>
  i % 5 === 4
    ? { id: 500 - i, object_type: 'post', object_id: 200 + ( i % 30 ), is_read: 0 }
    : { id: 500 - i, object_type: 'comment', object_id: 1000 + ( i % 40 ), is_read: 0 }
);

let queries = [];
const wpdb = {
  get_row: ( sql, find ) => {
    queries.push( sql );
    return find() ?? null;
  },
  get_results: ( sql, rows ) => {
    queries.push( sql );
    return rows;
  },
};
const byId = ( table, id ) => table.find( ( r ) => r.id === id );

// Posts::find(), Comments::find(), Spaces::find(): one row each.
const Posts = {
  find: ( id ) => wpdb.get_row( `SELECT * FROM wp_forumwp_posts WHERE id = ${ id }`, () => byId( posts, id ) ),
  // Posts::find_many(): several by id, in one query.
  find_many: ( ids ) => {
    ids = [ ...new Set( ids.map( Number ).filter( Boolean ) ) ];
    if ( ! ids.length ) {
      return {};
    }
    const rows = wpdb.get_results( `SELECT * FROM wp_forumwp_posts WHERE id IN (${ ids.join( ',' ) })`, posts.filter( ( p ) => ids.includes( p.id ) ) );
    return Object.fromEntries( rows.map( ( r ) => [ r.id, r ] ) ); // array_column( $rows, null, 'id' )
  },
};
const Comments = {
  find: ( id ) => wpdb.get_row( `SELECT * FROM wp_forumwp_comments WHERE id = ${ id }`, () => byId( comments, id ) ),
  find_many: ( ids ) => {
    ids = [ ...new Set( ids.map( Number ).filter( Boolean ) ) ];
    if ( ! ids.length ) {
      return {};
    }
    const rows = wpdb.get_results( `SELECT * FROM wp_forumwp_comments WHERE id IN (${ ids.join( ',' ) })`, comments.filter( ( c ) => ids.includes( c.id ) ) );
    return Object.fromEntries( rows.map( ( r ) => [ r.id, r ] ) );
  },
};
const Spaces = {
  find: ( id ) => wpdb.get_row( `SELECT * FROM wp_forumwp_spaces WHERE id = ${ id }`, () => byId( spaces, id ) ),
  all: () => wpdb.get_results( 'SELECT * FROM wp_forumwp_spaces ORDER BY position', spaces ),
};
// Policy::can_read_post() and Comments::can_see(): rules in PHP, no queries here.
const canRead = ( post, space ) => post.status === 'published' && ! space.secret;
const canSee = ( comment ) => comment.status === 'published';

// The first version: the post a reply or mention is about, if she may still read it.
const readableOne = ( row ) => {
  let comment = null;
  let post;
  if ( row.object_type === 'comment' ) {
    comment = Comments.find( row.object_id );
    post = comment ? Posts.find( comment.post_id ) : null;
  } else {
    post = Posts.find( row.object_id );
  }
  const space = post ? Spaces.find( post.space_id ) : null;
  if ( ! post || ! space || ! canRead( post, space ) ) {
    return null;
  }
  if ( comment && ! canSee( comment ) ) {
    return null;
  }
  return post;
};

// ForumWP, src/Home/Home.php: readable(), loading everything together.
const readableAll = ( rows ) => {
  const of = ( type ) => rows.filter( ( r ) => r.object_type === type ).map( ( r ) => r.object_id );
  const foundComments = Comments.find_many( of( 'comment' ) );
  const foundPosts = Posts.find_many( [ ...of( 'post' ), ...Object.values( foundComments ).map( ( c ) => c.post_id ) ] );
  const allSpaces = Object.fromEntries( Spaces.all().map( ( s ) => [ s.id, s ] ) );
  const out = {};
  for ( const row of rows ) {
    const comment = row.object_type === 'comment' ? foundComments[ row.object_id ] ?? null : null;
    if ( row.object_type === 'comment' && ! comment ) {
      continue;
    }
    const post = foundPosts[ comment ? comment.post_id : row.object_id ] ?? null;
    const space = post ? allSpaces[ post.space_id ] ?? null : null;
    if ( ! post || ! space || ! canRead( post, space ) || ( comment && ! canSee( comment ) ) ) {
      continue;
    }
    out[ row.id ] = post;
  }
  return out;
};

// Home::replies(): the latest 3 she can read, and how many unread she can read.
const COUNT = 3;
const replies = ( batched ) => {
  queries = [];
  const rows = wpdb.get_results( `SELECT * FROM wp_forumwp_notifications WHERE user_id = 7 … LIMIT ${ COUNT * 3 }`, notifications.slice( 0, COUNT * 3 ) );
  const unread = wpdb.get_results( 'SELECT id, object_type, object_id FROM wp_forumwp_notifications WHERE user_id = 7 AND is_read = 0 … LIMIT 50', notifications );
  let items;
  let readableCount;
  if ( batched ) {
    const found = readableAll( [ ...rows, ...unread ] );
    items = rows.filter( ( r ) => found[ r.id ] ).slice( 0, COUNT ).map( ( r ) => found[ r.id ].title );
    readableCount = unread.filter( ( r ) => found[ r.id ] ).length;
  } else {
    items = [];
    for ( const row of rows ) {
      const post = readableOne( row );
      if ( post ) {
        items.push( post.title );
      }
      if ( items.length >= COUNT ) {
        break;
      }
    }
    readableCount = unread.filter( ( r ) => readableOne( r ) !== null ).length;
  }
  return { items, unread: readableCount, queries: [ ...queries ] };
};

const Demo = () => {
  const [ result, setResult ] = useState( null );
  const run = () => {
    const one = replies( false );
    const many = replies( true );
    console.log( `one by one: ${ one.queries.length } queries; together: ${ many.queries.length } queries` );
    console.log( `same answer: ${ JSON.stringify( one.items ) === JSON.stringify( many.items ) && one.unread === many.unread }` );
    setResult( { one, many } );
  };
  const Column = ( { title, r } ) => (
    <div className="fwp-card">
      <strong>{ title }: { r.queries.length } queries</strong>
      <p>Shows { r.items.join( ', ' ) }; { r.unread } unread she can read (of 50).</p>
      <details>
        <summary>The queries</summary>
        <ol className="fwp-sql">{ r.queries.map( ( q, i ) => <li key={ i }>{ q }</li> ) }</ol>
      </details>
    </div>
  );

  return (
    <div style={ { maxWidth: 720 } }>
      <p><Button variant="primary" onClick={ run }>Build the section both ways</Button></p>
      { result && (
        <div className="fwp-cols">
          <Column title="One by one (the first version)" r={ result.one } />
          <Column title="With find_many()" r={ result.many } />
        </div>
      ) }
    </div>
  );
};

document.head.insertAdjacentHTML( 'beforeend', `<style>
  .fwp-cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; }
  .fwp-sql { font: 11px/1.4 ui-monospace, Menlo, monospace; max-height: 240px; overflow: auto; }
</style>` ); // Added so this runs on its own

createRoot( document.getElementById( 'forumwp-root' ) ).render( <Demo /> );
