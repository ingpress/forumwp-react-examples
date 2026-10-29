// @id 29.2
// @title Fields from an add-on, saved with the rest of the form
// @section 29.2
// @click Save
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, RadioControl, TextControl, ToggleControl } from '@wordpress/components'; // Added so this runs on its own
import { addFilter, applyFilters } from '@wordpress/hooks'; // Added so this runs on its own

// Added so this runs on its own: the add-on (ForumWP Pro) registers its starting values and its fields.
addFilter( 'forumwp.spaceForm', 'forumwp-pro', ( form, space ) => ( {
  ...form,
  reply_votes: !! space?.replyVotes,
} ) );
const ProSettings = ( { form, setForm } ) => {
  const set = ( key ) => ( value ) => setForm( ( f ) => ( { ...f, [ key ]: value } ) );
  if ( form.layout === 'forum' ) {
    return (
      <ToggleControl
        __nextHasNoMarginBottom
        label="Members can vote on replies"
        checked={ form.reply_votes }
        onChange={ set( 'reply_votes' ) }
      />
    );
  }
  return form.layout === 'ideas' ? <p>Statuses: Under review, Planned, Done</p> : null;
};
addFilter( 'forumwp.spaceSettings', 'forumwp-pro', ( fields ) => [ ...fields, ProSettings ] );

const SpaceEditor = ( { space } ) => {
  const [ form, setForm ] = useState( {
    title: space?.title ?? '',
    layout: space?.layout ?? 'feed',
    // The add-on's own settings, sent with the rest.
    ...applyFilters( 'forumwp.spaceForm', {}, space ),
  } );
  const set = ( key ) => ( value ) => setForm( ( current ) => ( { ...current, [ key ]: value } ) );
  const extraSettings = applyFilters( 'forumwp.spaceSettings', [] );

  return (
    <form
      className="fwp-stack"
      onSubmit={ ( event ) => {
        event.preventDefault();
        console.log( 'Saving', form );
      } }
    >
      <TextControl __next40pxDefaultSize __nextHasNoMarginBottom label="Name" value={ form.title } onChange={ set( 'title' ) } />
      <RadioControl
        label="Layout"
        selected={ form.layout }
        options={ [
          { value: 'feed', label: 'Feed' },
          { value: 'forum', label: 'Forum' },
          { value: 'ideas', label: 'Ideas' },
        ] }
        onChange={ set( 'layout' ) }
      />
      { extraSettings.map( ( Extra, i ) => (
        <Extra key={ i } form={ form } setForm={ setForm } space={ space } />
      ) ) }
      <Button variant="primary" type="submit">
        Save
      </Button>
    </form>
  );
};

createRoot( document.getElementById( 'forumwp-root' ) ).render(
  <SpaceEditor space={ { title: 'Help desk', layout: 'forum', replyVotes: true } } />
);
