// @id 26.2
// @title Letting add-ons change your screens with applyFilters and addFilter
// @section 26.2
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button } from '@wordpress/components'; // Added so this runs on its own
import { sprintf, _n } from '@wordpress/i18n'; // Added so this runs on its own
import { removeFilter } from '@wordpress/hooks'; // Added so this runs on its own

// app/portal/components/ModerationLog.js (ForumWP)
import { applyFilters } from '@wordpress/hooks';

// Added so this runs on its own: the function around the book's return. The real one first
// handles ForumWP's own actions; here only "removed_post".
const logText = ( item ) => {
  const who = item.actor.name;
  if ( item.action === 'removed_post' ) {
    return sprintf( '%1$s removed a post by %2$s', who, item.subject.name );
  }

  return applyFilters(
    'forumwp.moderationLogText',
    `${ who }: ${ item.action }`,   // the fallback
    item
  );
};

// app/portal/index.js (ForumWP Pro)
import { addFilter } from '@wordpress/hooks';

addFilter( 'forumwp.moderationLogText', 'forumwp-pro', ( text, item ) => {
  if ( item.action !== 'auto_hidden' ) {
    return text;   // not ours: pass it on unchanged
  }
  return sprintf( _n( 'A post by %1$s was hidden after %2$d report', 'A post by %1$s was hidden after %2$d reports', item.data.reports, 'forumwp-pro' ), item.subject.name, item.data.reports );
} );

// Added so this runs on its own: four log entries, and a button that removes Pro's filter by its
// namespace, so you can see the fallback text.
const ENTRIES = [
  { id: 1, action: 'removed_post', actor: { name: 'Ada' }, subject: { name: 'Tunde' }, data: {} },
  { id: 2, action: 'auto_hidden', actor: { name: 'ForumWP' }, subject: { name: 'Grace' }, data: { reports: 1 } },
  { id: 3, action: 'auto_hidden', actor: { name: 'ForumWP' }, subject: { name: 'Tunde' }, data: { reports: 3 } },
  { id: 4, action: 'pinned_post', actor: { name: 'Ada' }, subject: { name: 'Grace' }, data: {} },
];
const ModerationLog = () => {
  const [ , setVersion ] = useState( 0 );
  return (
    <>
      <ul>{ ENTRIES.map( ( item ) => <li key={ item.id }>{ logText( item ) }</li> ) }</ul>
      <Button variant="secondary" onClick={ () => { removeFilter( 'forumwp.moderationLogText', 'forumwp-pro' ); setVersion( ( v ) => v + 1 ); } }>
        Deactivate ForumWP Pro (remove its filter)
      </Button>
    </>
  );
};

createRoot( document.getElementById( 'forumwp-root' ) ).render( <ModerationLog /> ); // Added so this runs on its own
