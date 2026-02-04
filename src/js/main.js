// CV site scaffold
document.addEventListener('DOMContentLoaded', () => {
	const includeTargets = document.querySelectorAll('[data-include]');

	includeTargets.forEach(async (target) => {
		const source = target.getAttribute('data-include');
		if (!source) {
			return;
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
	});

	if (typeof window.initSoftSkillBubbles === 'function') {
		window.initSoftSkillBubbles();
	}

	initThemeToggle();
});

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
		window.updateChartsTheme();
	}
};

const updateThemeIcon = (theme, iconEl) => {
	iconEl.src =
		theme === 'dark'
			? 'src/assets/icons/brightness.svg'
			: 'src/assets/icons/moon.svg';
};
