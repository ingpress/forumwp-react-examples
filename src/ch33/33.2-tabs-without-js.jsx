// @id 33.2
// @title Tabs that are links first, and switch in place with a script
// @section 33.2
// No React here: the page around a block isn't a React app.

// Added so this runs on its own: the HTML render_topic_tabs() prints. Every list is in the page,
// all but one hidden, and each tab is a link that would reload on that list.
const id = 'fwp-topics-1';
const TABS = { latest: 'Latest', unanswered: 'Unanswered', solved: 'Solved' };
const LISTS = {
  latest: [ 'Webhooks fire twice', 'Dark mode colours', 'Importing from bbPress' ],
  unanswered: [ 'Dark mode colours' ],
  solved: [ 'Webhooks fire twice', 'Importing from bbPress' ],
};
const current = new URLSearchParams( window.location.search ).get( 'fwp_tab' ) ?? 'latest';
document.getElementById( 'forumwp-root' ).innerHTML = `
  <label><input type="checkbox" id="use-js" checked> Run view.js (untick, then click a tab, to see the links work without it)</label>
  <div class="fwp-block fwp-block-topics fwp-tabs" id="${ id }" style="margin-top:12px">
    <div class="fwp-tabs__list" role="tablist" aria-label="Topics" style="display:flex;gap:12px">
      ${ Object.entries( TABS ).map( ( [ tab, label ] ) => `<a role="tab" id="${ id }-tab-${ tab }" href="?fwp_tab=${ tab }#${ id }" aria-controls="${ id }-${ tab }" aria-selected="${ tab === current }" tabindex="${ tab === current ? 0 : -1 }">${ label }</a>` ).join( '' ) }
    </div>
    ${ Object.keys( TABS ).map( ( tab ) => `<div role="tabpanel" id="${ id }-${ tab }" aria-labelledby="${ id }-tab-${ tab }" tabindex="0"${ tab === current ? '' : ' hidden' }><ul>${ LISTS[ tab ].map( ( t ) => `<li>${ t }</li>` ).join( '' ) }</ul></div>` ).join( '' ) }
  </div>
  <style>[aria-selected="true"]{font-weight:bold;text-decoration:none}</style>`;

// blocks/topics/view.js, as ForumWP ships it (wrapped in a check of the box above).
const enhance = () =>
  document.querySelectorAll( '.fwp-tabs' ).forEach( ( root ) => {
    const tabs = [ ...root.querySelectorAll( '[role="tab"]' ) ];
    const select = ( tab ) => {
      tabs.forEach( ( t ) => {
        const on = t === tab;
        t.setAttribute( 'aria-selected', on ? 'true' : 'false' );
        t.tabIndex = on ? 0 : -1;
        root.querySelector( '#' + t.getAttribute( 'aria-controls' ) ).hidden = ! on;
      } );
      tab.focus();
    };
    root.addEventListener( 'click', ( e ) => {
      const tab = e.target.closest( '[role="tab"]' );
      if ( tab && document.getElementById( 'use-js' ).checked ) {
        e.preventDefault();
        select( tab );
        console.log( 'Switched in place to', tab.textContent );
      }
    } );
    root.addEventListener( 'keydown', ( e ) => {
      const i = tabs.indexOf( e.target );
      const to = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[ e.key ];
      if ( i < 0 || to === undefined ) {
        return;
      }
      e.preventDefault();
      select( tabs[ ( to + tabs.length ) % tabs.length ] );
    } );
  } );
enhance();
console.log( `Drawn by "PHP" with fwp_tab=${ current }. Click a tab, or focus one and use the arrow keys.` );
