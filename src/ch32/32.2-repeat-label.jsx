// @id 32.2
// @title A monthly event on the second Thursday, in your time zone
// @section 32.2
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { SelectControl } from '@wordpress/components'; // Added so this runs on its own
import { __, sprintf } from '@wordpress/i18n'; // Added so this runs on its own

const repeatLabel = ( repeats, start ) => {
  const date = new Date( start );
  const day = new Intl.DateTimeFormat( undefined, { weekday: 'long' } ).format( date );
  switch ( repeats ) {
    case 'week':
      /* translators: %s: weekday name */
      return sprintf( __( 'Every %s', 'forumwp' ), day );
    case '2weeks':
      /* translators: %s: weekday name */
      return sprintf( __( 'Every other %s', 'forumwp' ), day );
    case 'month':
      return [
        sprintf( __( 'Monthly on the first %s', 'forumwp' ), day ),
        sprintf( __( 'Monthly on the second %s', 'forumwp' ), day ),
        sprintf( __( 'Monthly on the third %s', 'forumwp' ), day ),
        sprintf( __( 'Monthly on the fourth %s', 'forumwp' ), day ),
        sprintf( __( 'Monthly on the last %s', 'forumwp' ), day ),
      ][ Math.floor( ( date.getDate() - 1 ) / 7 ) ];
  }

  return '';
};

// Added so this runs on its own: Events::slots() written in JavaScript, in the browser's own time
// zone (the real one runs in PHP, in the organiser's zone). It adds days or months to a local date,
// never seconds, so 7 PM stays 7 PM when the clocks change.
const slots = ( start, repeats, count ) => {
  const first = new Date( start );
  const nth = Math.floor( ( first.getDate() - 1 ) / 7 ); // 0 = first … 4 = last
  const out = [];
  for ( let i = 0; out.length < count; i++ ) {
    let date;
    if ( repeats === 'month' ) {
      const isLast = nth === 4;
      // The 1st of the month (or the last day, for "last"), then move to the right weekday.
      date = new Date( first.getFullYear(), first.getMonth() + i + ( isLast ? 1 : 0 ), isLast ? 0 : 1, first.getHours(), first.getMinutes() );
      const gap = ( date.getDay() - first.getDay() + 7 ) % 7;
      date.setDate( date.getDate() + ( isLast ? -gap : ( ( 7 - gap ) % 7 ) + 7 * nth ) );
    } else {
      date = new Date( first );
      date.setDate( first.getDate() + ( repeats === '2weeks' ? 14 : 7 ) * i );
    }
    out.push( date );
    if ( ! repeats ) {
      break;
    }
  }
  return out;
};

const App = () => {
  const [ start, setStart ] = useState( '2026-11-12T19:00' );
  const [ repeats, setRepeats ] = useState( 'month' );
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const when = new Intl.DateTimeFormat( undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' } );

  return (
    <div style={ { display: 'grid', gap: 12, maxWidth: 480 } }>
      <label>
        First date and time{ ' ' }
        <input type="datetime-local" value={ start } onChange={ ( e ) => setStart( e.target.value ) } />
      </label>
      <SelectControl
        __next40pxDefaultSize
        __nextHasNoMarginBottom
        label="Repeats"
        value={ repeats }
        options={ [
          { value: '', label: "Doesn't repeat" },
          { value: 'week', label: 'Every week' },
          { value: '2weeks', label: 'Every 2 weeks' },
          { value: 'month', label: 'Every month' },
        ] }
        onChange={ setRepeats }
      />
      <p>
        <strong>{ repeatLabel( repeats, start ) || 'Once' }</strong>. Sent to the server with <code>timezone: '{ zone }'</code>.
      </p>
      <ol>
        { slots( start, repeats, 6 ).map( ( d ) => (
          <li key={ d.getTime() }>
            { when.format( d ) } <span className="fwp-muted">({ d.toISOString().slice( 11, 16 ) } UTC)</span>
          </li>
        ) ) }
      </ol>
      <p className="fwp-muted">Try 2026-03-12T19:00, weekly, with your computer set to London: the UTC time moves, 7 PM doesn't.</p>
    </div>
  );
};

createRoot( document.getElementById( 'forumwp-root' ) ).render( <App /> );
