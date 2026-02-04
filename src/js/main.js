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
});
