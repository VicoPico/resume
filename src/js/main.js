// CV site scaffold
document.addEventListener('DOMContentLoaded', async () => {
	await loadIncludes();
	initChartObserver();
	initThemeToggle();
});

const loadIncludes = async () => {
	const targets = Array.from(document.querySelectorAll('[data-include]'));
	if (targets.length === 0) {
		return;
	}

	for (const target of targets) {
		const source = target.getAttribute('data-include');
		if (!source) {
			continue;
		}

		try {
			const response = await fetch(source);
			if (!response.ok) {
				throw new Error(`Failed to load ${source}`);
			}
			const html = await response.text();
			target.innerHTML = html;
		} catch (error) {
			console.error(error);
			target.innerHTML = '<p>Unable to load content.</p>';
		}
	}

	if (document.querySelector('[data-include]')) {
		await loadIncludes();
	}
};

const initChartObserver = () => {
	const targets = document.querySelectorAll(
		'.chart-container, .hard-chart-container',
	);
	if (!targets.length) {
		return;
	}

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
		{
			threshold: 0.2,
		},
	);

	targets.forEach((target) => observer.observe(target));
};

const initThemeToggle = () => {
	const toggleButton = document.getElementById('themeToggle');
	const toggleIcon = document.getElementById('themeIcon');
	if (!toggleButton || !toggleIcon) {
		return;
	}

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
