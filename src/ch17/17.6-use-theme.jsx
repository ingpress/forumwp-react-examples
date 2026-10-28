// @id 17.6
// @title The real ForumWP's useTheme hook
// @section 17.7
// app/portal/hooks/useTheme.js
import { useState, useEffect } from '@wordpress/element';

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

const useTheme = ( { default: siteDefault, allowSwitch } ) => {
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

// Added so this runs on its own: the settings PHP would print, a little CSS for
// data-theme="dark", and a switcher that uses the hook (17.5's array form).
import { createRoot } from '@wordpress/element';
import { Button } from '@wordpress/components';

document.head.insertAdjacentHTML('beforeend', `<style>
  body[data-theme="dark"] { background: #1e1e1e; color: #f0f0f0; }
</style>`);

const themeSettings = { default: 'auto', allowSwitch: true };

const ThemeSwitcher = () => {
const [mode, setMode] = useTheme(themeSettings);   // same hook, names of your choosing
  return (
    <p>
      Theme: <strong>{mode}</strong> (body has data-theme="{resolve(mode)}"){' '}
      {['light', 'dark', 'auto'].map((value) => (
        <Button key={value} variant="secondary" isPressed={mode === value} onClick={() => setMode(value)}>
          {value}
        </Button>
      ))}
    </p>
  );
};

createRoot(document.getElementById('forumwp-root')).render(<ThemeSwitcher />);
