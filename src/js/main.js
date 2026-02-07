// CV site scaffold
document.addEventListener('DOMContentLoaded', async () => {
	await loadIncludes();

	// Ensure injected DOM is painted before we attach reveal logic
	await new Promise((r) => requestAnimationFrame(r));

	initRevealOnScroll('.skills-list li', { stagger: 180, threshold: 0.2 });
	initChartObserver();
	initThemeToggle();
});

/* -------------------------------------------------- */
/*  LOAD HTML PARTIALS (GitHub Pages SAFE)            */
/* -------------------------------------------------- */

const loadIncludes = async () => {
	// Safety to avoid infinite loops if a partial accidentally re-inserts data-include forever
	const MAX_PASSES = 10;

	for (let pass = 0; pass < MAX_PASSES; pass++) {
		const targets = Array.from(document.querySelectorAll('[data-include]'));
		if (targets.length === 0) return;

		for (const target of targets) {
			const source = target.getAttribute('data-include');
			if (!source) {
				target.removeAttribute('data-include');
				continue;
			}

			// ✅ GitHub Pages-safe: resolves /resume/ base correctly
			const url = new URL(source, document.baseURI).toString();

			try {
				const response = await fetch(url, { cache: 'no-cache' });
				if (!response.ok) {
					throw new Error(`Failed to load ${url} (${response.status})`);
				}

				const html = await response.text();
				target.innerHTML = html;

				// ✅ Important: remove attribute so we don’t re-fetch the same node forever
				target.removeAttribute('data-include');
			} catch (error) {
				console.error(error);
				target.innerHTML = '<p>Unable to load content.</p>';
				target.removeAttribute('data-include');
			}
		}
	}

	console.warn(
		`loadIncludes: reached MAX_PASSES=${MAX_PASSES}. Check for includes that re-insert [data-include] endlessly.`,
	);
};

/* -------------------------------------------------- */
/*  LAZY INITIALIZE CHARTS WHEN VISIBLE               */
/* -------------------------------------------------- */

const initChartObserver = () => {
	const targets = document.querySelectorAll(
		'.chart-container, .hard-chart-container',
	);
	if (!targets.length) return;

	let chartsInitialized = false;

	const revealTarget = (target) => {
		target.classList.add('is-visible');

		if (
			!chartsInitialized &&
			typeof window.initSoftSkillBubbles === 'function'
		) {
			chartsInitialized = true;
			window.initSoftSkillBubbles();
		}
	};

	// Fallback if IntersectionObserver unsupported
	if (!('IntersectionObserver' in window)) {
		targets.forEach((target) => revealTarget(target));
		return;
	}

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					revealTarget(entry.target);
					observer.unobserve(entry.target);
				}
			});
		},
		{ threshold: 0.2 },
	);

	targets.forEach((target) => observer.observe(target));
};

/* -------------------------------------------------- */
/*  GENERIC REVEAL ON SCROLL                          */
/* -------------------------------------------------- */

const initRevealOnScroll = (
	selector,
	{
		threshold = 0.2,
		rootMargin = '0px 0px -5% 0px',
		stagger = 0,
		once = true,
	} = {},
) => {
	const targets = Array.from(document.querySelectorAll(selector));
	if (targets.length === 0) return;

	// Apply stagger delay (works whether or not IntersectionObserver is used)
	targets.forEach((el, index) => {
		if (stagger > 0)
			el.style.setProperty('--reveal-delay', `${index * stagger}ms`);
	});

	// If IntersectionObserver isn't supported, reveal immediately (still staggered)
	if (!('IntersectionObserver' in window)) {
		requestAnimationFrame(() => {
			targets.forEach((el) => el.classList.add('is-visible'));
		});
		return;
	}

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (!entry.isIntersecting) return;

				// Reveal on next frame so transitions run
				requestAnimationFrame(() => {
					entry.target.classList.add('is-visible');
				});

				if (once) observer.unobserve(entry.target);
			});
		},
		{ threshold, rootMargin },
	);

	targets.forEach((el) => observer.observe(el));
};

/* -------------------------------------------------- */
/*  THEME TOGGLE (LIGHT / DARK MODE)                 */
/* -------------------------------------------------- */

const initThemeToggle = () => {
	const toggleButton = document.getElementById('themeToggle');
	const toggleIcon = document.getElementById('themeIcon');
	if (!toggleButton || !toggleIcon) return;

	const storedTheme = localStorage.getItem('theme');
	const systemPrefersDark = window.matchMedia(
		'(prefers-color-scheme: dark)',
	).matches;

	const initialTheme = storedTheme || (systemPrefersDark ? 'dark' : 'light');

	applyTheme(initialTheme);
	updateThemeIcon(initialTheme, toggleIcon);

	// Follow system theme only if user hasn't chosen manually
	if (!storedTheme) {
		const media = window.matchMedia('(prefers-color-scheme: dark)');
		media.addEventListener('change', (event) => {
			const newTheme = event.matches ? 'dark' : 'light';
			applyTheme(newTheme);
			updateThemeIcon(newTheme, toggleIcon);
		});
	}

	toggleButton.addEventListener('click', () => {
		const currentTheme =
			document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';

		const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';

		localStorage.setItem('theme', nextTheme);
		applyTheme(nextTheme);
		updateThemeIcon(nextTheme, toggleIcon);
	});
};

const applyTheme = (theme) => {
	document.documentElement.dataset.theme = theme;

	// Update charts when theme changes
	if (typeof window.updateChartsTheme === 'function') {
		requestAnimationFrame(() => {
			window.updateChartsTheme();
		});
	}
};

const updateThemeIcon = (theme, iconEl) => {
	iconEl.src =
		theme === 'dark'
			? 'src/assets/icons/brightness.svg'
			: 'src/assets/icons/moon.svg';
};
