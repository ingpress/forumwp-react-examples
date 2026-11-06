// @id 32.4
// @title Failing open and failing closed
// @section 32.4
import { createRoot } from '@wordpress/element'; // Added so this runs on its own

// Added so this runs on its own: both versions of the check, written in JavaScript.
// A request is what the server sees: the browser's headers, and the form's fields.
const HOME = 'https://community.example';
const host = ( url ) => {
  try {
    return new URL( url ).host;
  } catch {
    return '';
  }
};

// The first version: the form field first, and only refused when it knew the origin was wrong.
const firstVersion = ( request ) => {
  const origin = host( request.fields._wp_http_referer ? new URL( request.fields._wp_http_referer, HOME ).href : request.headers.origin ?? '' );
  return ! ( origin && host( HOME ) !== origin );
};

// The fix: the headers themselves; neither, or "null", is refused.
const fromThisSite = ( request ) => {
  const from = request.headers.origin ?? request.headers.referer ?? '';
  return host( HOME ) === host( from );
};

const requests = [
  { label: 'The form on the site’s own page', headers: { origin: HOME, referer: HOME + '/join' }, fields: {} },
  { label: 'A form on another site', headers: { origin: 'https://evil.test' }, fields: {} },
  { label: 'Another site’s form that sets _wp_http_referer', headers: { origin: 'https://evil.test' }, fields: { _wp_http_referer: '/join' } },
  { label: 'A script that sends no Origin or Referer', headers: {}, fields: {} },
  { label: 'A sandboxed page (Origin: null)', headers: { origin: 'null' }, fields: {} },
  { label: 'A look-alike host', headers: { origin: 'https://community.example.evil.test' }, fields: {} },
];

const verdict = ( ok ) => ( ok ? 'let in' : 'refused' );

createRoot( document.getElementById( 'forumwp-root' ) ).render(
  <table className="widefat" style={ { borderCollapse: 'collapse' } }>
    <thead>
      <tr>
        <th style={ { textAlign: 'left' } }>Request</th>
        <th>First version</th>
        <th>from_this_site()</th>
      </tr>
    </thead>
    <tbody>
      { requests.map( ( r ) => (
        <tr key={ r.label }>
          <td>{ r.label }</td>
          <td style={ { textAlign: 'center' } }>{ verdict( firstVersion( r ) ) }</td>
          <td style={ { textAlign: 'center' } }>{ verdict( fromThisSite( r ) ) }</td>
        </tr>
      ) ) }
    </tbody>
  </table>
);
