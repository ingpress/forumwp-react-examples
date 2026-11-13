// @id 45.1
// @title A skip link with a router, an inert closed drawer, and arrow keys in the account menu
// @section 45.4
// @click Menu
import { createRoot, useEffect, useRef, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, CheckboxControl, Dropdown, MenuGroup, MenuItem, NavigableMenu } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: shows which element has focus, as you press Tab.
const useFocusName = () => {
  const [ name, setName ] = useState( 'nothing yet' );
  useEffect( () => {
    const onFocus = ( e ) => setName( `${ e.target.tagName.toLowerCase() } "${ ( e.target.getAttribute( 'aria-label' ) || e.target.textContent || '' ).trim().slice( 0, 40 ) }"` );
    document.addEventListener( 'focusin', onFocus );
    return () => document.removeEventListener( 'focusin', onFocus );
  }, [] );
  return name;
};

// ForumWP, app/portal/components/AccountMenu.js, shortened: arrows move between the items.
const AccountMenu = () => (
  <Dropdown
    renderToggle={ ( { isOpen, onToggle } ) => <Button variant="secondary" aria-expanded={ isOpen } onClick={ onToggle }>Account</Button> }
    renderContent={ ( { onClose } ) => (
      <NavigableMenu orientation="vertical" cycle aria-label="Account menu">
        <MenuGroup label="Theme">
          <MenuItem onClick={ onClose }>Light</MenuItem>
          <MenuItem onClick={ onClose }>Dark</MenuItem>
        </MenuGroup>
        <MenuGroup>
          <MenuItem onClick={ onClose }>My profile</MenuItem>
          <MenuItem onClick={ onClose }>My drafts</MenuItem>
          <MenuItem onClick={ onClose }>Log out</MenuItem>
        </MenuGroup>
      </NavigableMenu>
    ) }
  />
);

const Demo = () => {
  const [ phone, setPhone ] = useState( true );
  const [ useInert, setUseInert ] = useState( true );
  const [ open, setOpen ] = useState( false );
  const main = useRef();
  const focused = useFocusName();
  // On phones the closed drawer is off screen: out of the tab order and away from screen readers.
  const hidden = phone && ! open && useInert;
  return (
    <div style={ { maxWidth: 760 } }>
      <CheckboxControl __nextHasNoMarginBottom label="Phone width (the sidebar is a drawer)" checked={ phone } onChange={ setPhone } />
      <CheckboxControl __nextHasNoMarginBottom label="inert and aria-hidden on the closed drawer" checked={ useInert } onChange={ setUseInert } />
      <p>Click in the box, then press Tab. Focus is on: <strong>{ focused }</strong></p>
      <div className={ `fwp-app ${ phone ? 'is-phone' : '' }` }>
        <a className="fwp-skip-link" href="#fwp-main" onClick={ ( e ) => { e.preventDefault(); main.current?.focus(); } }>Skip to content</a>
        <header className="fwp-topbar">
          { phone && <Button variant="secondary" aria-expanded={ open } onClick={ () => setOpen( ! open ) }>Menu</Button> }
          <strong>Maker Collective</strong>
          <AccountMenu />
        </header>
        <div className="fwp-body">
          <aside className={ `fwp-sidebar ${ open ? 'is-open' : '' }` } inert={ hidden ? '' : undefined } aria-hidden={ hidden ? 'true' : undefined }>
            { [ 'Home', 'General', 'Meetups', 'Show and tell', 'Questions', 'Ideas' ].map( ( s ) => <a key={ s } href="#s" onClick={ ( e ) => e.preventDefault() }>{ s }</a> ) }
          </aside>
          <main id="fwp-main" ref={ main } tabIndex={ -1 } className="fwp-main">
            <a href="#p" onClick={ ( e ) => e.preventDefault() }>Spring meetup: who's coming?</a>
          </main>
        </div>
      </div>
    </div>
  );
};

document.head.insertAdjacentHTML( 'beforeend', `<style>
  .fwp-app { position: relative; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
  .fwp-skip-link { position: absolute; top: 8px; left: 8px; z-index: 10; padding: 8px 16px; border-radius: 8px; background: #fff; box-shadow: 0 0 0 2px #3858e9; font-weight: 600; transform: translateY(-200%); }
  .fwp-skip-link:focus { outline: none; transform: none; }
  .fwp-topbar { display: flex; gap: 12px; align-items: center; justify-content: space-between; padding: 8px 12px; border-bottom: 1px solid #eee; }
  .fwp-body { display: flex; position: relative; min-height: 200px; }
  .fwp-sidebar { display: grid; align-content: start; gap: 6px; padding: 12px; width: 160px; background: #f6f7f7; }
  .is-phone .fwp-sidebar { position: absolute; top: 0; bottom: 0; transform: translateX(-105%); transition: transform 0.2s ease; z-index: 5; }
  .is-phone .fwp-sidebar.is-open { transform: none; }
  .fwp-main { padding: 12px; flex: 1; }
  .fwp-main:focus { outline: none; }
</style>` ); // Added so this runs on its own

createRoot( document.getElementById( 'forumwp-root' ) ).render( <Demo /> );
