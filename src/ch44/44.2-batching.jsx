// @id 44.2
// @title Batching: block relations once both ways, and the conversation list with members_of() and the last messages in one query
// @section 44.4
// @click Build both ways
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, RangeControl } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: pretend tables and a counting $wpdb. Tunde is user 7.
// He blocked 12; 15 blocked him.
const blocks = [ { user_id: 7, blocked_id: 12 }, { user_id: 15, blocked_id: 7 }, { user_id: 30, blocked_id: 31 } ];
let queries = 0;
const q = ( result ) => {
  queries++;
  return result;
};

// 0.34.2: between() reads each side's list of people they blocked.
const oldBlocking = () => {
  const cache = {};
  const blockedBy = ( u ) => ( cache[ u ] ??= q( blocks.filter( ( b ) => b.user_id === u ).map( ( b ) => b.blocked_id ) ) );
  return { between: ( a, b ) => blockedBy( a ).includes( b ) || blockedBy( b ).includes( a ) };
};
// 0.34.3: relations() loads everyone a member has a block with, either way, as a set.
const newBlocking = () => {
  const relations = {};
  const load = ( u ) => {
    if ( ! relations[ u ] ) {
      relations[ u ] = new Set( q( blocks.filter( ( b ) => b.user_id === u || b.blocked_id === u ) ).map( ( b ) => ( b.user_id === u ? b.blocked_id : b.user_id ) ) );
    }
    return relations[ u ];
  };
  return {
    between( a, b ) {
      const known = relations[ b ] && ! relations[ a ] ? b : a;
      return load( known ).has( known === a ? b : a );
    },
  };
};

const conversationsOf = ( n ) => Array.from( { length: n }, ( _, i ) => ( { id: i + 1, last_message_id: 500 + i, members: [ 7, 20 + i ] } ) );
// 0.34.2: present() loads each conversation's members and last message itself.
const oldInbox = ( list ) => list.map( ( c ) => ( { members: q( c.members ), last: q( { id: c.last_message_id } ) } ) );
// 0.34.3: present_many(): members_of() and the last messages for the whole list.
const newInbox = ( list ) => {
  const members = q( Object.fromEntries( list.map( ( c ) => [ c.id, c.members ] ) ) ); // WHERE conversation_id IN (…)
  q( 'Members::prime()' ); // every person's profile at once
  const last = list.length ? q( Object.fromEntries( list.map( ( c ) => [ c.last_message_id, { id: c.last_message_id } ] ) ) ) : {}; // WHERE id IN (…)
  return list.map( ( c ) => ( { members: members[ c.id ], last: last[ c.last_message_id ] } ) );
};

const Demo = () => {
  const [ n, setN ] = useState( 20 );
  const [ out, setOut ] = useState( [] );
  const run = () => {
    const authors = Array.from( { length: 20 }, ( _, i ) => 10 + i ); // 20 different authors, 12 and 15 among them
    const lines = [];
    for ( const [ name, make ] of [ [ '0.34.2 between()', oldBlocking ], [ '0.34.3 relations()', newBlocking ] ] ) {
      queries = 0;
      const B = make();
      const hidden = authors.filter( ( a ) => B.between( 7, a ) );
      lines.push( `Feed of 20 authors, ${ name }: ${ queries } quer${ queries === 1 ? "y" : "ies" } on the blocks table; hidden: ${ hidden.join( ', ' ) }` );
    }
    for ( const [ name, build ] of [ [ '0.34.2 present() each', oldInbox ], [ '0.34.3 present_many()', newInbox ] ] ) {
      queries = 0;
      build( conversationsOf( n ) );
      lines.push( `Inbox of ${ n } conversations, ${ name }: ${ queries } queries` );
    }
    lines.forEach( ( l ) => console.log( l ) );
    setOut( lines );
  };
  return (
    <div style={ { maxWidth: 760 } }>
      <RangeControl __nextHasNoMarginBottom label="Conversations in Tunde's inbox" min={ 1 } max={ 30 } value={ n } onChange={ setN } />
      <p><Button variant="primary" onClick={ run }>Build both ways</Button></p>
      <ul>{ out.map( ( l, i ) => <li key={ i }>{ l }</li> ) }</ul>
    </div>
  );
};

createRoot( document.getElementById( 'forumwp-root' ) ).render( <Demo /> );
