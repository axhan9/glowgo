/**
 * Glam & Go – navigáció és interakciók. Függőségmentes, ~2 KB.
 * - jobbról beúszó mobilmenü (overlay, X, Escape, fókuszcsapda, fókusz-visszaadás, scroll-zár)
 * - vissza az oldal tetejére gomb
 */
( function () {
	'use strict';

	var drawer = document.getElementById( 'gg-drawer' );
	var burger = document.querySelector( '.gg-burger' );
	var reduce = window.matchMedia( '(prefers-reduced-motion: reduce)' );

	if ( drawer && burger ) {
		var panel = drawer.querySelector( '.gg-drawer__panel' );
		var focusable = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
		var setInert = function ( on ) {
			if ( 'inert' in drawer ) { drawer.inert = on; }
		};
		setInert( true );

		var open = function () {
			drawer.classList.add( 'is-open' );
			drawer.setAttribute( 'aria-hidden', 'false' );
			setInert( false );
			burger.setAttribute( 'aria-expanded', 'true' );
			document.body.classList.add( 'gg-lock' );
			var first = panel.querySelector( focusable );
			( first || panel ).focus();
		};
		var close = function ( returnFocus ) {
			if ( ! drawer.classList.contains( 'is-open' ) ) { return; }
			drawer.classList.remove( 'is-open' );
			drawer.setAttribute( 'aria-hidden', 'true' );
			setInert( true );
			burger.setAttribute( 'aria-expanded', 'false' );
			document.body.classList.remove( 'gg-lock' );
			if ( returnFocus !== false ) { burger.focus(); }
		};

		burger.addEventListener( 'click', open );
		drawer.addEventListener( 'click', function ( e ) {
			if ( e.target.closest( '[data-gg-close]' ) ) { close(); }
			else if ( e.target.closest( 'a[href]' ) ) { close( false ); }
		} );
		document.addEventListener( 'keydown', function ( e ) {
			if ( ! drawer.classList.contains( 'is-open' ) ) { return; }
			if ( e.key === 'Escape' ) { close(); return; }
			if ( e.key === 'Tab' ) {
				var items = panel.querySelectorAll( focusable );
				if ( ! items.length ) { return; }
				var first = items[ 0 ], last = items[ items.length - 1 ];
				if ( e.shiftKey && document.activeElement === first ) { e.preventDefault(); last.focus(); }
				else if ( ! e.shiftKey && document.activeElement === last ) { e.preventDefault(); first.focus(); }
			}
		} );
		// Ha asztali szélességre váltunk, a menü záródjon.
		window.matchMedia( '(min-width: 960px)' ).addEventListener( 'change', function ( m ) {
			if ( m.matches ) { close( false ); }
		} );
	}

	var totop = document.querySelector( '.gg-totop' );
	if ( totop ) {
		var ticking = false;
		var update = function () {
			var show = window.scrollY > 600;
			if ( show && totop.hidden ) {
				totop.hidden = false;
				window.requestAnimationFrame( function () { totop.classList.add( 'is-visible' ); } );
			} else if ( ! show && ! totop.hidden ) {
				totop.classList.remove( 'is-visible' );
				totop.hidden = true;
			}
			ticking = false;
		};
		window.addEventListener( 'scroll', function () {
			if ( ! ticking ) { ticking = true; window.requestAnimationFrame( update ); }
		}, { passive: true } );
		totop.addEventListener( 'click', function () {
			window.scrollTo( { top: 0, behavior: reduce.matches ? 'auto' : 'smooth' } );
		} );
		update();
	}

	// Harmonika: egyszerre egy nyitott sor (a natív name="" csoportot nem tudó böngészőkben is).
	document.querySelectorAll( '[data-gg-acc], .gg-faq' ).forEach( function ( box ) {
		box.addEventListener( 'toggle', function ( e ) {
			if ( ! e.target.open ) { return; }
			box.querySelectorAll( 'details[open]' ).forEach( function ( d ) { if ( d !== e.target ) { d.open = false; } } );
		}, true );
	} );

	// Galéria nagyítás (natív <dialog>: Escape zár, fókusz visszaadva).
	var zooms = Array.prototype.slice.call( document.querySelectorAll( '[data-gg-zoom]' ) );
	if ( zooms.length && typeof HTMLDialogElement === 'function' ) {
		var dlg, imgEl, idx = 0;
		var show = function ( i ) {
			idx = ( i + zooms.length ) % zooms.length;
			var src = zooms[ idx ].querySelector( 'img' );
			var best = src.src, bw = 0;
			( src.getAttribute( 'srcset' ) || '' ).split( ',' ).forEach( function ( part ) {
				var p = part.trim().split( /\s+/ ), w = parseInt( p[ 1 ], 10 ) || 0;
				if ( p[ 0 ] && w > bw ) { bw = w; best = p[ 0 ]; }
			} );
			imgEl.src = best;
			imgEl.alt = src.alt;
		};
		var build = function () {
			dlg = document.createElement( 'dialog' );
			dlg.className = 'gg-lightbox';
			dlg.setAttribute( 'aria-label', 'Képnézegető' );
			dlg.innerHTML = '<div class="gg-lightbox__inner"><img alt=""><button type="button" class="gg-lightbox__close" aria-label="Bezárás">&times;</button><button type="button" class="gg-lightbox__prev" aria-label="Előző kép">&lsaquo;</button><button type="button" class="gg-lightbox__next" aria-label="Következő kép">&rsaquo;</button></div>';
			document.body.appendChild( dlg );
			imgEl = dlg.querySelector( 'img' );
			dlg.addEventListener( 'click', function ( e ) {
				if ( e.target.closest( '.gg-lightbox__close' ) || e.target === dlg || e.target.classList.contains( 'gg-lightbox__inner' ) ) { dlg.close(); }
				else if ( e.target.closest( '.gg-lightbox__prev' ) ) { show( idx - 1 ); }
				else if ( e.target.closest( '.gg-lightbox__next' ) ) { show( idx + 1 ); }
			} );
			dlg.addEventListener( 'keydown', function ( e ) {
				if ( e.key === 'ArrowLeft' ) { show( idx - 1 ); } else if ( e.key === 'ArrowRight' ) { show( idx + 1 ); }
			} );
		};
		zooms.forEach( function ( b, i ) {
			b.addEventListener( 'click', function () {
				if ( ! dlg ) { build(); }
				show( i );
				dlg.showModal();
			} );
		} );
	}
}() );
