// @id 38.3
// @title A summary kept with a fingerprint, thrown away when its replies change
// @section 38.4
// @click Summarize the replies
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: a pretend database. In ForumWP Pro the summary is a row in the
// ai_summaries table; here it's one variable.
const db = {
  post: { id: 42, title: 'Best way to price a course?', body: 'I am launching my first course. What did you charge?' },
  replies: [
    { id: 11, user: 'Ada', status: 'published', isPrivate: false, body: 'I charged $49 and it sold well.' },
    { id: 12, user: 'Tunde', status: 'published', isPrivate: false, body: 'Start at $99, discount later. Call me on 0803 000 0000.' },
    { id: 13, user: 'Kemi', status: 'published', isPrivate: false, body: 'A free first module helped me.' },
  ],
  summary: null,
  nextId: 14,
  aiCalls: 0,
};

// Added so this runs on its own: md5() stand-in (FNV-1a). Any hash that changes with its input will do.
const hash = ( text ) => {
  let h = 0x811c9dc5;
  for ( let i = 0; i < text.length; i++ ) {
    h = Math.imul( h ^ text.charCodeAt( i ), 16777619 ) >>> 0;
  }
  return h.toString( 16 );
};

// Summaries::replies(): published, not private, oldest first, up to an id.
const replies = ( upto = Infinity ) =>
  db.replies.filter( ( r ) => r.status === 'published' && ! r.isPrivate && r.body && r.id <= upto );

// Summaries::source(): "last reply id:hash" of the post and the replies sent.
const source = ( post, sent ) => {
  const last = sent.length ? sent[ sent.length - 1 ].id : 0;
  return `${ last }:${ hash( JSON.stringify( [ post.title, post.body, sent.map( ( r ) => [ r.id, r.user, hash( r.body ) ] ) ] ) ) }`;
};

// Summaries::current(): the summary, if what it was made from is unchanged; else it's deleted.
const current = () => {
  const row = db.summary;
  if ( ! row ) {
    return null;
  }
  const last = Number( row.source.split( ':' )[ 0 ] );
  if ( row.source === source( db.post, replies( last ) ) ) {
    return row;
  }
  console.log( `summary thrown away: ${ row.source } no longer matches ${ source( db.post, replies( last ) ) }` );
  db.summary = null;

  return null;
};

// Summaries::generate(), shortened: no new replies, no AI call.
const generate = () => {
  const row = current();
  const count = replies().length;
  if ( row && row.replyCount >= count ) {
    console.log( 'nothing new: the summary there is, no AI call' );
    return;
  }
  db.aiCalls++;
  const sent = replies();
  // Added so this runs on its own: what a pretend AI makes of the replies sent.
  const points = sent.map( ( r ) => ( { text: `${ r.user }: ${ r.body }`, replies: [ r.id ] } ) );
  db.summary = { points, replyCount: count, source: source( db.post, sent ) };
  console.log( `AI call ${ db.aiCalls }: summary of ${ sent.length } replies, source ${ db.summary.source }` );
};

const Demo = () => {
  const [ , redraw ] = useState( 0 );
  const act = ( fn ) => () => {
    fn();
    redraw( ( n ) => n + 1 );
  };
  const summary = current();
  const count = replies().length;
  const newReplies = summary ? Math.max( 0, count - summary.replyCount ) : 0;

  return (
    <div style={ { maxWidth: 640 } }>
      <div className="fwp-card">
        <strong>{ summary ? `Summary of ${ summary.replyCount } replies` : 'Summary' }</strong>
        { summary ? (
          <ol>
            { summary.points.map( ( p, i ) => <li key={ i }>{ p.text } <a href={ `#comment-${ p.replies[ 0 ] }` }>reply { p.replies[ 0 ] }</a></li> ) }
          </ol>
        ) : (
          <p>{ count } replies so far.</p>
        ) }
        { summary && newReplies > 0 && <p>{ newReplies } new { newReplies === 1 ? 'reply' : 'replies' } since</p> }
        <Button variant="secondary" onClick={ act( generate ) }>{ summary ? 'Refresh' : 'Summarize the replies' }</Button>
      </div>
      <p>
        <Button variant="tertiary" onClick={ act( () => { db.replies.push( { id: db.nextId++, user: 'Mei', status: 'published', isPrivate: false, body: 'Bundles worked for me.' } ); } ) }>Mei adds a reply</Button>
        <Button variant="tertiary" onClick={ act( () => { db.replies[ 1 ].body = 'Start at $99, discount later.'; } ) }>Tunde edits out his number</Button>
        <Button variant="tertiary" onClick={ act( () => { db.replies[ 2 ].status = 'held'; } ) }>A moderator holds Kemi’s reply</Button>
        <Button variant="tertiary" onClick={ act( () => { db.post.title = 'How to price a first course?'; } ) }>The author edits the title</Button>
      </p>
      <p className="fwp-muted">AI calls so far: { db.aiCalls }</p>
    </div>
  );
};

createRoot( document.getElementById( 'forumwp-root' ) ).render( <Demo /> );
