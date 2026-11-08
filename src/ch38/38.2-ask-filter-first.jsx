// @id 38.2
// @title Ask: only posts the member can read are sent
// @section 38.3
// @click Ask
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, CheckboxControl } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: a pretend community. "Founders" is private and Kemi isn't in it;
// Kemi has blocked Tunde; post 4 is held for a moderator.
const spaces = { 1: { title: 'General', members: null }, 2: { title: 'Founders', members: [ 'Ada' ] } };
const blocks = [ [ 'Kemi', 'Tunde' ] ];
const posts = [
  { id: 1, space: 1, author: 'Ada', status: 'published', title: 'Changing your avatar', body: 'Open Edit profile and choose a photo.' },
  { id: 2, space: 2, author: 'Ada', status: 'published', title: 'Avatar for the founders page', body: 'Our launch date is 1 March; use your avatar from the press kit.' },
  { id: 3, space: 1, author: 'Tunde', status: 'published', title: 'Avatar sizes', body: 'Square photos of 400 px look best.' },
  { id: 4, space: 1, author: 'Spammer', status: 'held', title: 'Cheap avatars here', body: 'Buy avatars at example.com!' },
];

// Added so this runs on its own: the checks ForumWP makes (Policy::can_read_post, Blocking::between).
const canRead = ( post, viewer ) => {
  const members = spaces[ post.space ].members;
  return ! members || members.includes( viewer );
};
const blocked = ( a, b ) => blocks.some( ( [ x, y ] ) => ( x === a && y === b ) || ( x === b && y === a ) );

// Added so this runs on its own: ForumWP\Posts\Search::post_ids( $q, $viewer, 30, true ), shortened.
// It checks space access and status only, as the real one does.
const searchIds = ( q, viewer ) => {
  const words = q.toLowerCase().split( /[^a-z0-9]+/ ).filter( ( w ) => w.length >= 3 && ! [ 'how', 'the', 'can' ].includes( w ) );
  return posts
    .filter( ( p ) => p.status === 'published' && canRead( p, viewer ) )
    .filter( ( p ) => words.some( ( w ) => `${ p.title } ${ p.body }`.toLowerCase().includes( w ) ) )
    .map( ( p ) => p.id );
};

// ForumWPPro\Ai\Ask::candidates(), in JavaScript: every post found is checked again for this member.
const candidates = ( question, viewer, max = 8 ) => {
  const found = [];
  for ( const id of searchIds( question, viewer ) ) {
    const post = posts.find( ( p ) => p.id === id );
    if ( post.status !== 'published' || ! canRead( post, viewer ) || blocked( viewer, post.author ) ) {
      continue;
    }
    found.push( post );
    if ( found.length >= max ) {
      break;
    }
  }

  return found;
};

// Added so this runs on its own: the wrong way. Everything that matches goes to the AI,
// and the sources are filtered afterwards.
const everything = ( question ) => {
  const words = question.toLowerCase().split( /[^a-z0-9]+/ ).filter( ( w ) => w.length >= 3 );
  return posts.filter( ( p ) => words.some( ( w ) => `${ p.title } ${ p.body }`.toLowerCase().includes( w ) ) );
};

// The content Ask::answer() sends: each post between <source> tags, numbered from 1.
const sourcesText = ( list ) =>
  list.map( ( post, i ) => `<source n="${ i + 1 }">\nTitle: ${ post.title }\nBy ${ post.author } in ${ spaces[ post.space ].title }\n${ post.body }\n</source>` ).join( '\n' );

// Added so this runs on its own: a pretend AI that uses every source it is given.
const fakeAi = ( list ) => ( {
  found: list.length > 0,
  answer: list.map( ( post, i ) => `${ post.body } [${ i + 1 }]` ).join( ' ' ),
} );

const Demo = () => {
  const [ viewer, setViewer ] = useState( 'Kemi' );
  const [ first, setFirst ] = useState( true );
  const [ result, setResult ] = useState( null );
  const question = 'How do I change my avatar?';

  const ask = () => {
    const sent = first ? candidates( question, viewer ) : everything( question );
    const reply = fakeAi( sent );
    // Filtering afterwards drops the links, but not the words the AI already wrote.
    const shown = first ? sent : sent.filter( ( p ) => p.status === 'published' && canRead( p, viewer ) && ! blocked( viewer, p.author ) );
    console.log( `${ viewer }: ${ sent.length } posts sent to the AI (ids ${ sent.map( ( p ) => p.id ).join( ', ' ) || 'none' })` );
    setResult( { sent, reply, shown } );
  };

  return (
    <div className="fwp-card" style={ { maxWidth: 640 } }>
      <p>
        Signed in as{ ' ' }
        <select value={ viewer } onChange={ ( e ) => { setViewer( e.target.value ); setResult( null ); } }>
          <option>Kemi</option>
          <option>Ada</option>
        </select>{ ' ' }
        asking “{ question }”
      </p>
      <CheckboxControl
        label="Check each post before sending (Ask::candidates)"
        checked={ first }
        onChange={ ( v ) => { setFirst( v ); setResult( null ); } }
        __nextHasNoMarginBottom
      />
      <Button variant="primary" onClick={ ask }>Ask</Button>
      { result && (
        <>
          <h4>Sent to the AI</h4>
          <pre style={ { whiteSpace: 'pre-wrap', background: '#f6f7f7', padding: 8, fontSize: 12 } }>{ sourcesText( result.sent ) || '(nothing: no AI call, and it doesn’t count)' }</pre>
          <h4>The answer { viewer } sees</h4>
          <p>{ result.reply.found ? result.reply.answer : 'No answer found in posts you can see.' }</p>
          <p className="fwp-muted">Sources shown: { result.shown.map( ( p ) => p.title ).join( ', ' ) || 'none' }</p>
        </>
      ) }
    </div>
  );
};

createRoot( document.getElementById( 'forumwp-root' ) ).render( <Demo /> );
