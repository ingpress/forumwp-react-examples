// @id 26.4
// @title Translations with numbered placeholders
// @section 26.4
// @click pretend German
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button } from '@wordpress/components'; // Added so this runs on its own
import { __, sprintf, setLocaleData, resetLocaleData } from '@wordpress/i18n'; // Added so this runs on its own

// Added so this runs on its own: a small roleOf (the real one is in ModerationLog.js).
const roleOf = ( role ) =>
  ( {
    moderator: __( 'a moderator', 'forumwp' ),
    admin: __( 'an admin', 'forumwp' ),
  } )[ role ] ?? __( 'a member', 'forumwp' );

// Added so this runs on its own: the function around the book's return.
const roleText = ( item ) => {
  const who = item.actor.name;
  const whom = item.subject.name;

  return sprintf(
    /* translators: 1: moderator, 2: member, 3: a role, e.g. "a moderator" */
    __( '%1$s made %2$s %3$s', 'forumwp' ),
    who,
    whom,
    roleOf( item.data.role )
  );
};

// Added so this runs on its own: a pretend German translation that moves the placeholders around,
// which only works because they are numbered.
const GERMAN = {
  '': { domain: 'forumwp', lang: 'de' },
  '%1$s made %2$s %3$s': [ '%2$s ist jetzt %3$s (ernannt von %1$s)' ],
  'a moderator': [ 'Moderator' ],
  'an admin': [ 'Admin' ],
  'a member': [ 'Mitglied' ],
};
const ENTRIES = [
  { id: 1, actor: { name: 'Ada' }, subject: { name: 'Tunde' }, data: { role: 'moderator' } },
  { id: 2, actor: { name: 'Ada' }, subject: { name: 'Grace' }, data: { role: 'admin' } },
];
const Log = () => {
  const [ german, setGerman ] = useState( false );
  const toggle = () => {
    if ( german ) {
      resetLocaleData( undefined, 'forumwp' );
    } else {
      setLocaleData( GERMAN, 'forumwp' );
    }
    setGerman( ! german );
  };
  return (
    <>
      <ul>{ ENTRIES.map( ( item ) => <li key={ item.id }>{ roleText( item ) }</li> ) }</ul>
      <Button variant="secondary" onClick={ toggle }>{ german ? 'Back to English' : 'Show in pretend German' }</Button>
    </>
  );
};

createRoot( document.getElementById( 'forumwp-root' ) ).render( <Log /> ); // Added so this runs on its own
