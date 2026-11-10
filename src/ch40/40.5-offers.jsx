// @id 40.5
// @title Offers: chosen on the server, hidden on the server, counted once a day, drawn into the rail slot
// @section 40.6
// @click Open the community
import { createPortal, createRoot, useEffect, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, RadioControl } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: a pretend server. Founders circle is a paid space; Ada bought
// it, Mei is a moderator, Kemi joined two days ago, Tunde has been here a year.
const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.parse( '2026-11-10T09:00:00Z' );
const members = {
  ada: { name: 'Ada', joined: NOW - 300 * DAY, spaces: [ 'founders' ] },
  tunde: { name: 'Tunde', joined: NOW - 365 * DAY, spaces: [] },
  kemi: { name: 'Kemi', joined: NOW - 2 * DAY, spaces: [] },
  mei: { name: 'Mei', joined: NOW - 500 * DAY, spaces: [], moderator: true },
};
const promos = [
  { id: 1, enabled: 1, headline: 'Join Founders circle', sells: 'founders', placements: [ 'sidebar', 'home' ], joined_days: 7, hide_days: 14, starts_at: null },
  { id: 2, enabled: 1, headline: 'Black Friday: the course bundle', sells: 'bundle', placements: [ 'sidebar' ], joined_days: 0, hide_days: 14, starts_at: Date.parse( '2026-11-28T00:00:00Z' ) },
];
const server = { hides: [], stats: {}, today: '2026-11-10' }; // promo_hides and promo_stats

// ForumWP Pro, src/Promotions/Promotions.php
const status = ( p ) => ( ! p.enabled ? 'off' : p.starts_at && p.starts_at > NOW ? 'scheduled' : 'live' );
const hasIt = ( p, m ) => !! m.moderator || m.spaces.includes( p.sells );
const hidden = ( p, userId ) => server.hides.some( ( h ) => h.promo_id === p.id && h.user_id === userId && ( h.hidden_until === null || h.hidden_until > NOW ) );
const showsTo = ( p, userId ) => {
  const m = members[ userId ];
  if ( status( p ) !== 'live' || ! m || ! p.placements.length ) {
    return false;
  }
  if ( hasIt( p, m ) || hidden( p, userId ) ) {
    return false;
  }
  if ( p.joined_days && m.joined > NOW - p.joined_days * DAY ) {
    return false;
  }
  return true;
};
// Tracking::bump(): INSERT … ON DUPLICATE KEY UPDATE, one row per promotion, member and day.
const bump = ( promoId, userId, column ) => {
  const key = `${ promoId }|${ userId }|${ server.today }`;
  server.stats[ key ] ??= { promo_id: promoId, user_id: userId, day: server.today, views: 0, dismissals: 0 };
  server.stats[ key ][ column ] += 1;
};
// The routes.
const api = {
  mine: ( userId ) => promos.filter( ( p ) => showsTo( p, userId ) ).map( ( p ) => ( { id: p.id, headline: p.headline, hideDays: p.hide_days } ) ),
  view: ( id, userId ) => {
    const p = promos.find( ( x ) => x.id === id );
    if ( showsTo( p, userId ) ) {
      bump( id, userId, 'views' );
    }
  },
  hide: ( id, userId ) => {
    server.hides = server.hides.filter( ( h ) => ! ( h.promo_id === id && h.user_id === userId ) ); // REPLACE INTO
    server.hides.push( { promo_id: id, user_id: userId, hidden_until: NOW + 14 * DAY } );
    bump( id, userId, 'dismissals' );
  },
};
// Tracking::results(): members per day, not page loads.
const results = () =>
  promos.map( ( p ) => {
    const rows = Object.values( server.stats ).filter( ( r ) => r.promo_id === p.id );
    return `${ p.headline }: ${ rows.filter( ( r ) => r.views > 0 ).length } views (from ${ rows.reduce( ( n, r ) => n + r.views, 0 ) } page loads), ${ rows.filter( ( r ) => r.dismissals > 0 ).length } hides`;
  } );

let hideOnServer = true;

// The app. ForumWP Pro, app/portal/promotions/Offer.js, shortened: counts the view, × hides.
const CardOffer = ( { offer, userId, device, onHide, onView } ) => {
  useEffect( () => {
    api.view( offer.id, userId ); // POST /promotions/{id}/view
    onView(); // Added so this runs on its own: redraws the results below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ offer.id, userId ] );
  return (
    <aside className="fwpp-offer" aria-label="Offer">
      <Button className="fwpp-offer__close" size="small" label={ `Hide this offer: ${ offer.headline }` } onClick={ () => onHide( offer ) }>×</Button>
      <strong>{ offer.headline }</strong>
      <p>Seen on { device }</p>
    </aside>
  );
};

// ForumWP, app/portal/components/Layout.js: RailTop draws add-ons' cards into the slot
// the server printed (#forumwp-rail-top), with a portal.
const RailTop = ( { slotId, children } ) => {
  const slot = document.getElementById( slotId );
  if ( ! slot || ! children.length ) {
    return null;
  }
  return createPortal( children, slot );
};

// One device: its own page, its own memory. The server is shared.
// A new key is a reload: the page starts again from what the server (and localStorage) has.
const Device = ( { userId, device, onChange } ) => {
  const [ offers, setOffers ] = useState( [] );
  const [ hiddenHere, setHiddenHere ] = useState( () => {
    try {
      return new Set( JSON.parse( localStorage.getItem( `hidden-${ device }-${ userId }` ) ?? '[]' ) );
    } catch {
      return new Set();
    }
  } );
  useEffect( () => {
    setOffers( api.mine( userId ) ); // GET /promotions/mine
  }, [ userId ] );
  const onHide = ( offer ) => {
    if ( hideOnServer ) {
      api.hide( offer.id, userId ); // POST /promotions/{id}/hide
      setOffers( api.mine( userId ) );
      onChange();
    } else {
      const next = new Set( hiddenHere ).add( offer.id );
      try {
        localStorage.setItem( `hidden-${ device }-${ userId }`, JSON.stringify( [ ...next ] ) );
      } catch {}
      setHiddenHere( next );
    }
  };
  const shown = offers.filter( ( o ) => ! hiddenHere.has( o.id ) );
  const slotId = `rail-top-${ device }`;

  return (
    <div className="fwp-portal">
      <div className="fwp-body">
        <strong>{ device }</strong>
        <p>{ members[ userId ].name }'s feed…</p>
      </div>
      {/* templates/portal.php prints the rail and an empty slot at its top */}
      <aside className="fwp-rail">
        <div id={ slotId } className="fwp-rail__top"></div>
      </aside>
      <RailTop slotId={ slotId }>
        { shown.map( ( o ) => <CardOffer key={ o.id } offer={ o } userId={ userId } device={ device } onHide={ onHide } onView={ onChange } /> ) }
      </RailTop>
    </div>
  );
};

const Demo = () => {
  const [ userId, setUserId ] = useState( 'tunde' );
  const [ where, setWhere ] = useState( 'server' );
  const [ n, setN ] = useState( 0 );
  const [ open, setOpen ] = useState( false );
  const [ , setTick ] = useState( 0 );
  const onChange = () => setTick( ( t ) => t + 1 );
  hideOnServer = where === 'server';
  const reload = () => setN( ( x ) => x + 1 );

  return (
    <div style={ { maxWidth: 760 } }>
      <RadioControl label="Signed in as" selected={ userId } onChange={ setUserId } options={ [
        { label: 'Tunde (a member for a year, hasn’t bought it)', value: 'tunde' },
        { label: 'Ada (bought Founders circle)', value: 'ada' },
        { label: 'Kemi (joined two days ago)', value: 'kemi' },
        { label: 'Mei (a moderator)', value: 'mei' },
      ] } />
      <RadioControl label="Where × keeps the hide" selected={ where } onChange={ setWhere } options={ [
        { label: 'In this browser’s localStorage (the first idea)', value: 'browser' },
        { label: 'On the server, promo_hides (ForumWP Pro)', value: 'server' },
      ] } />
      <p>
        <Button variant="primary" onClick={ () => { setOpen( true ); reload(); } }>Open the community</Button>{ ' ' }
        <Button variant="secondary" onClick={ reload }>Reload both pages</Button>
      </p>
      { open && (
        <>
          <div className="fwp-devices">
            <Device key={ `laptop-${ userId }-${ n }` } userId={ userId } device="laptop" onChange={ onChange } />
            <Device key={ `phone-${ userId }-${ n }` } userId={ userId } device="phone" onChange={ onChange } />
          </div>
          <ul>{ results().map( ( line ) => <li key={ line }>{ line }</li> ) }</ul>
        </>
      ) }
    </div>
  );
};

document.head.insertAdjacentHTML( 'beforeend', `<style>
  .fwp-devices { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 12px; }
  .fwp-portal { display: grid; grid-template-columns: 1fr; gap: 8px; border: 1px solid #ddd; border-radius: 8px; padding: 8px; }
  .fwp-rail { display: none; }
  /* ForumWP, app/portal/styles/_rail.scss: the rail shows once something is in its slot */
  .fwp-portal:has(.fwp-rail__top:not(:empty)) { grid-template-columns: 1fr 160px; }
  .fwp-portal:has(.fwp-rail__top:not(:empty)) .fwp-rail { display: block; }
  .fwp-rail__top:empty { display: none; }
  .fwpp-offer { position: relative; border: 1px solid #c3c4f8; background: #f3f3ff; border-radius: 8px; padding: 8px; }
  .fwpp-offer__close { position: absolute; top: 2px; right: 2px; }
</style>` ); // Added so this runs on its own

createRoot( document.getElementById( 'forumwp-root' ) ).render( <Demo /> );
