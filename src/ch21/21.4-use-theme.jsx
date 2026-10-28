// @id 21.4
// @title The useTheme hook: light, dark or match device
// @section 21.7
// @click Dark
// app/portal/hooks/useTheme.js
import { useState, useEffect } from '@wordpress/element';
// Added so this runs on its own: the other imports.
import { createRoot } from '@wordpress/element';
import { Button } from '@wordpress/components';

const KEY = 'forumwp-theme';

const read = () => {
  try {
    return window.localStorage.getItem( KEY );
  } catch {
    return null;
  }
};

const resolve = ( theme ) => {
  if ( theme !== 'auto' ) {
    return theme;
  }
  return window.matchMedia( '(prefers-color-scheme: dark)' ).matches
    ? 'dark'
    : 'light';
};

export const useTheme = ( { default: siteDefault, allowSwitch } ) => {
  const [ theme, setTheme ] = useState( () =>
    allowSwitch ? read() || siteDefault : siteDefault
  );

  useEffect( () => {
    document.body.dataset.theme = resolve( theme );
    try {
      window.localStorage.setItem( KEY, theme );
    } catch {}
  }, [ theme ] );

  return [ theme, setTheme ];
};

// Added so this runs on its own: the tokens (Example 21.2), a theme menu with three buttons instead of
// MenuItemsChoice, and a Layout that calls useTheme with the settings PHP would print.
document.head.insertAdjacentHTML('beforeend', `<style>
  .forumwp-portal { --fwp-bg: #f6f7f9; --fwp-surface: #fff; --fwp-border: #e4e6eb; --fwp-text: #111318; background: var(--fwp-bg); color: var(--fwp-text); }
  .forumwp-portal[data-theme="dark"] { --fwp-bg: #0e1014; --fwp-surface: #161920; --fwp-border: #2a2f39; --fwp-text: #eceef2; }
  .forumwp-portal .fwp-post { background: var(--fwp-surface); border-color: var(--fwp-border); }
  .forumwp-portal #console { color: inherit; }
</style>`);
document.body.classList.add('forumwp-portal');

const ThemeMenu = ( { theme, onSelect } ) => (
  <p>
    { [ [ 'light', 'Light' ], [ 'dark', 'Dark' ], [ 'auto', 'Match device' ] ].map( ( [ value, label ] ) => (
      <Button key={ value } variant={ theme === value ? 'primary' : 'secondary' } onClick={ () => onSelect( value ) }>
        { label }
      </Button>
    ) ) }
  </p>
);

const Layout = () => {
  const [ theme, setTheme ] = useTheme( { default: 'auto', allowSwitch: true } );
  console.log( 'Choice:', theme, '| mode on <body> (the effect sets it after this render):', document.body.dataset.theme ?? '(not set yet)', '| device prefers dark:', window.matchMedia( '(prefers-color-scheme: dark)' ).matches );
  return (
    <>
      <ThemeMenu theme={ theme } onSelect={ setTheme } />
      <article className="fwp-post"><h3>Welcome to the community</h3><p>Reload the page: your choice is remembered.</p></article>
    </>
  );
};

createRoot( document.getElementById( 'forumwp-root' ) ).render( <Layout /> );
