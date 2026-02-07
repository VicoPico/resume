// CV site scaffold
document.addEventListener('DOMContentLoaded', async () => {
	await loadIncludes();

	// Wait one frame so injected partials are painted before attaching observers
	await new Promise((r) => requestAnimationFrame(r));

	initRevealOnScroll('.skills-list li', { stagger: 180, threshold: 0.2 });
	initChartObserver();
	initThemeToggle();
});

/* -------------------------------------------------- */
/*  LOAD HTML PARTIALS (GitHub Pages SAFE)            */
/* -------------------------------------------------- */

const loadIncludes = async () => {
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

			const url = new URL(source, document.baseURI).toString();

			try {
				const response = await fetch(url, { cache: 'no-cache' });
				if (!response.ok) {
					throw new Error(`Failed to load ${url} (${response.status})`);
				}

				const html = await response.text();
				target.innerHTML = html;
				target.removeAttribute('data-include');
			} catch (error) {
				console.error(error);
				target.innerHTML = '<p>Unable to load content.</p>';
				target.removeAttribute('data-include');
			}
		}
	}

	console.warn(
		`loadIncludes: reached MAX_PASSES=${MAX_PASSES}. Check for recursive includes.`,
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

	/* --------------------------------------------------
	   FIX: stagger restarts PER SKILLS LIST
	   Previously index was global → later sections delayed
	-------------------------------------------------- */

	targets.forEach((el) => {
		if (stagger <= 0) return;

		const parentList = el.closest('.skills-list');
		if (!parentList) return;

		const localIndex = Array.from(parentList.querySelectorAll('li')).indexOf(
			el,
		);
		el.style.setProperty('--reveal-delay', `${localIndex * stagger}ms`);
	});

	// Fallback if IntersectionObserver unsupported
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
