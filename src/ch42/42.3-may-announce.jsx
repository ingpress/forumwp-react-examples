// @id 42.3
// @title Posts::may_announce(): who publishing a draft may email everyone, and when it counts
// @section 42.5
// @click Publish
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, CheckboxControl, SelectControl } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: three people and their community roles *now*.
const PEOPLE = { 1: 'Ada', 2: 'Mei', 7: 'Tunde' };
const PER_HOUR = 3; // forumwp_announcements_per_hour

// ForumWP, src/Posts/Posts.php: may_announce(). All four must hold.
const mayAnnounce = ( post, userId, roleOf ) =>
  !! post.meta.announce && !! userId && post.user_id === userId && roleOf( userId ) === 'admin';

const Demo = () => {
  const [ author, setAuthor ] = useState( '1' );
  const [ publisher, setPublisher ] = useState( '1' );
  const [ roles, setRoles ] = useState( { 1: 'admin', 2: 'moderator', 7: 'member' } );
  const [ asked, setAsked ] = useState( true );
  const [ wasAdmin, setWasAdmin ] = useState( true );
  const [ heldOnPublish, setHeld ] = useState( false );
  const [ emailOn, setEmailOn ] = useState( true );
  const [ used, setUsed ] = useState( 0 );
  const [ log, setLog ] = useState( [] );
  const roleOf = ( id ) => roles[ id ];

  const publish = () => {
    // Saving the draft: Posts::create() keeps "announce" only for a community admin's own draft.
    const post = { user_id: Number( author ), meta: asked && wasAdmin ? { announce: 1 } : {} };
    const user = Number( publisher );
    const announce = mayAnnounce( post, user, roleOf );
    const parts = [
      `asks: ${ !! post.meta.announce }`,
      `publisher is the author: ${ post.user_id === user }`,
      `publisher is a community admin now: ${ roleOf( user ) === 'admin' }`,
    ];
    let line;
    if ( announce && emailOn && used >= PER_HOUR ) {
      line = '429 forumwp_rate_limited: You have emailed everyone several times in the last hour. Please wait a while before publishing this. (Still a draft.)';
    } else {
      const status = heldOnPublish && post.user_id === user ? 'pending' : 'published';
      const sent = announce && emailOn && status === 'published';
      if ( sent ) {
        setUsed( ( n ) => n + 1 );
      }
      line = `${ status }; ${ sent ? 'everyone is emailed (counted: ' + ( used + 1 ) + ' of ' + PER_HOUR + ' this hour)' : announce && status === 'pending' ? 'held: nobody is emailed yet, and nothing is counted' : '"announce" removed from the meta: nobody is emailed' }`;
    }
    const full = `${ PEOPLE[ user ] } publishes ${ PEOPLE[ post.user_id ] }'s draft · may_announce() = ${ announce } (${ parts.join( ', ' ) }) → ${ line }`;
    console.log( full );
    setLog( ( l ) => [ full, ...l ].slice( 0, 8 ) );
  };

  const people = Object.entries( PEOPLE ).map( ( [ value, label ] ) => ( { value, label } ) );
  return (
    <div style={ { maxWidth: 760 } }>
      <div className="fwp-row">
        <SelectControl __nextHasNoMarginBottom label="The draft's author" value={ author } options={ people } onChange={ setAuthor } />
        <SelectControl __nextHasNoMarginBottom label="Who presses Publish" value={ publisher } options={ people } onChange={ setPublisher } />
      </div>
      <div className="fwp-row">
        { Object.keys( PEOPLE ).map( ( id ) => (
          <SelectControl
            __nextHasNoMarginBottom
            key={ id }
            label={ `${ PEOPLE[ id ] }'s role now` }
            value={ roles[ id ] }
            options={ [ 'admin', 'moderator', 'member' ].map( ( r ) => ( { value: r, label: r } ) ) }
            onChange={ ( r ) => setRoles( ( all ) => ( { ...all, [ id ]: r } ) ) }
          />
        ) ) }
      </div>
      <CheckboxControl __nextHasNoMarginBottom label='The author ticked "Also email this to everyone"' checked={ asked } onChange={ setAsked } />
      <CheckboxControl __nextHasNoMarginBottom label="The author was a community admin when they saved it (otherwise the tick isn't kept)" checked={ wasAdmin } onChange={ setWasAdmin } />
      <CheckboxControl __nextHasNoMarginBottom label="Publishing it, the author's own draft is held for review (a refused word)" checked={ heldOnPublish } onChange={ setHeld } />
      <CheckboxControl __nextHasNoMarginBottom label="Email notifications are on (Settings)" checked={ emailOn } onChange={ setEmailOn } />
      <p>
        <Button variant="primary" onClick={ publish }>Publish</Button>{ ' ' }
        <Button variant="tertiary" onClick={ () => setUsed( 0 ) }>An hour passes ({ used } of { PER_HOUR } used)</Button>
      </p>
      <ol className="fwp-log">{ log.map( ( l, i ) => <li key={ i }>{ l }</li> ) }</ol>
    </div>
  );
};

document.head.insertAdjacentHTML( 'beforeend', `<style>
  .fwp-row { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 12px; }
  .fwp-log li { word-break: break-word; margin-bottom: 4px; font-size: 13px; }
</style>` ); // Added so this runs on its own

createRoot( document.getElementById( 'forumwp-root' ) ).render( <Demo /> );
