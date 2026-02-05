let bubbleCharts = [];
let hardCharts = [];

const getChartTheme = () => {
	const styles = getComputedStyle(document.documentElement);
	return {
		bubbleFill: styles.getPropertyValue('--chart-bubble-fill').trim(),
		bubbleStroke: styles.getPropertyValue('--chart-bubble-stroke').trim(),
		barFill: styles.getPropertyValue('--chart-bar-fill').trim(),
		barStroke: styles.getPropertyValue('--chart-bar-stroke').trim(),
		grid: styles.getPropertyValue('--chart-grid').trim(),
		tick: styles.getPropertyValue('--chart-tick').trim(),
	};
};

const updateChartsTheme = () => {
	const theme = getChartTheme();

	bubbleCharts.forEach((chart) => {
		if (!chart) return;
		const dataset = chart.data.datasets[0];
		dataset.backgroundColor = theme.bubbleFill;
		dataset.borderColor = theme.bubbleStroke;
		chart.update('none');
	});

	hardCharts.forEach((chart) => {
		if (!chart) return;
		const dataset = chart.data.datasets[0];
		dataset.backgroundColor = theme.bubbleFill;
		dataset.borderColor = theme.bubbleStroke;
		if (chart.options?.scales?.x?.ticks) {
			chart.options.scales.x.ticks.color = theme.tick;
		}
		if (chart.options?.scales?.y?.ticks) {
			chart.options.scales.y.ticks.color = theme.tick;
		}
		if (chart.options?.scales?.x?.grid) {
			chart.options.scales.x.grid.color = theme.grid;
		}
		chart.update();
	});
};

window.updateChartsTheme = updateChartsTheme;

const initSoftSkillBubbles = async () => {
	const chartOneCanvas = document.getElementById('softSkillsBubble1');
	const chartTwoCanvas = document.getElementById('softSkillsBubble2');

	if (!chartOneCanvas || !chartTwoCanvas || typeof Chart === 'undefined') {
		return;
	}

	try {
		const response = await fetch('src/data/soft-skills.json');
		if (!response.ok) {
			throw new Error('Failed to load soft skills data');
		}
		const softSkillBubbles = await response.json();

		const sharedOptions = {
			responsive: true,
			maintainAspectRatio: false,
			layout: {
				padding: 14,
			},
			plugins: {
				legend: {
					display: false,
				},
				tooltip: {
					enabled: false,
				},
			},
			scales: {
				x: {
					display: false,
					min: 0,
					max: 100,
				},
				y: {
					display: false,
					min: 0,
					max: 100,
				},
			},
		};

		const theme = getChartTheme();
		const buildDataset = (definition) => ({
			label: definition.label,
			data: definition.bubbles.map(({ x, y, r }) => ({ x, y, r })),
			backgroundColor: theme.bubbleFill,
			borderColor: theme.bubbleStroke,
			borderWidth: 1,
		});

		const chartOne = new Chart(chartOneCanvas, {
			type: 'bubble',
			data: {
				datasets: [buildDataset(softSkillBubbles.problemSolving)],
			},
			options: sharedOptions,
		});

		const chartTwo = new Chart(chartTwoCanvas, {
			type: 'bubble',
			data: {
				datasets: [buildDataset(softSkillBubbles.communication)],
			},
			options: sharedOptions,
		});

		bubbleCharts = [chartOne, chartTwo];

		initHardSkillCharts();

		renderBubbleAnnotations({
			chart: chartOne,
			wrapperEl: document.querySelector(
				'.bubble-chart[data-chart="problemSolving"]',
			),
			bubbles: softSkillBubbles.problemSolving.bubbles,
			annotations: softSkillBubbles.problemSolving.annotations,
		});

		setupBubbleCenterTitle({
			chart: chartOne,
			wrapperEl: document.querySelector(
				'.bubble-chart[data-chart="problemSolving"]',
			),
			definition: softSkillBubbles.problemSolving,
		});

		if (document.fonts && document.fonts.ready) {
			document.fonts.ready.then(() => {
				renderBubbleAnnotations({
					chart: chartOne,
					wrapperEl: document.querySelector(
						'.bubble-chart[data-chart="problemSolving"]',
					),
					bubbles: softSkillBubbles.problemSolving.bubbles,
					annotations: softSkillBubbles.problemSolving.annotations,
				});
				renderBubbleAnnotations({
					chart: chartTwo,
					wrapperEl: document.querySelector(
						'.bubble-chart[data-chart="communication"]',
					),
					bubbles: softSkillBubbles.communication.bubbles,
					annotations: softSkillBubbles.communication.annotations,
				});
				setupBubbleCenterTitle({
					chart: chartOne,
					wrapperEl: document.querySelector(
						'.bubble-chart[data-chart="problemSolving"]',
					),
					definition: softSkillBubbles.problemSolving,
				});
				setupBubbleCenterTitle({
					chart: chartTwo,
					wrapperEl: document.querySelector(
						'.bubble-chart[data-chart="communication"]',
					),
					definition: softSkillBubbles.communication,
				});
			});
		}

		renderBubbleAnnotations({
			chart: chartTwo,
			wrapperEl: document.querySelector(
				'.bubble-chart[data-chart="communication"]',
			),
			bubbles: softSkillBubbles.communication.bubbles,
			annotations: softSkillBubbles.communication.annotations,
		});

		setupBubbleCenterTitle({
			chart: chartTwo,
			wrapperEl: document.querySelector(
				'.bubble-chart[data-chart="communication"]',
			),
			definition: softSkillBubbles.communication,
		});
	} catch (error) {
		console.error(error);
	}
};

window.initSoftSkillBubbles = initSoftSkillBubbles;

const initHardSkillCharts = async () => {
	const proficiencyCanvas = document.getElementById('hardSkillsProficiency');
	const experienceCanvas = document.getElementById('hardSkillsExperience');
	if (!proficiencyCanvas || !experienceCanvas || typeof Chart === 'undefined') {
		return;
	}

	let labels = [];
	let proficiencyData = [];
	let experienceData = [];

	try {
		const response = await fetch('src/data/hard-skills.json');
		if (!response.ok) {
			throw new Error('Failed to load hard skills data');
		}
		const hardSkills = await response.json();
		labels = hardSkills.labels || [];
		proficiencyData = hardSkills.proficiency || [];
		experienceData = hardSkills.experienceYears || [];
	} catch (error) {
		console.error(error);
		return;
	}

	const fontFamily =
		getComputedStyle(document.body).getPropertyValue('font-family').trim() ||
		'Quicksand, sans-serif';
	const theme = getChartTheme();

	const sharedOptions = {
		responsive: true,
		maintainAspectRatio: false,
		indexAxis: 'y',
		layout: {
			padding: {
				left: 8,
				right: 12,
				top: 4,
				bottom: 4,
			},
		},
		plugins: {
			legend: {
				display: false,
			},
		},
		scales: {
			x: {
				min: 0,
				max: 10,
				ticks: {
					stepSize: 5,
					color: theme.tick,
					font: {
						family: fontFamily,
						size: 12,
					},
				},
				grid: {
					color: theme.grid,
				},
			},
			y: {
				ticks: {
					color: theme.tick,
					padding: 6,
					font: {
						family: fontFamily,
						size: 12,
					},
				},
				grid: {
					display: false,
				},
			},
		},
	};

	const buildBarDataset = (data) => ({
		data,
		backgroundColor: theme.bubbleFill,
		borderColor: theme.bubbleStroke,
		borderWidth: 1,
		borderRadius: 2,
		barThickness: 12,
	});

	const proficiencyChart = new Chart(proficiencyCanvas, {
		type: 'bar',
		data: {
			labels,
			datasets: [buildBarDataset(proficiencyData)],
		},
		options: sharedOptions,
	});

	const experienceChart = new Chart(experienceCanvas, {
		type: 'bar',
		data: {
			labels,
			datasets: [buildBarDataset(experienceData)],
		},
		options: sharedOptions,
	});

	hardCharts = [proficiencyChart, experienceChart];
};

const renderBubbleAnnotations = ({
	chart,
	wrapperEl,
	bubbles,
	annotations,
}) => {
	if (!chart || !wrapperEl || !Array.isArray(bubbles)) {
		return;
	}

	if (!Array.isArray(annotations) || annotations.length === 0) {
		return;
	}

	const overlay = wrapperEl.querySelector('.bubble-overlay');
	const labelsContainer = wrapperEl.querySelector('.bubble-labels');
	if (!overlay || !labelsContainer) {
		return;
	}

	overlay.innerHTML = '';
	labelsContainer.innerHTML = '';

	const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
	const markerId = `arrowhead-${wrapperEl.dataset.chart || 'default'}`;
	const marker = document.createElementNS(
		'http://www.w3.org/2000/svg',
		'marker',
	);
	marker.setAttribute('id', markerId);
	marker.setAttribute('markerWidth', '8');
	marker.setAttribute('markerHeight', '8');
	marker.setAttribute('refX', '6');
	marker.setAttribute('refY', '3');
	marker.setAttribute('orient', 'auto');

	const arrowPath = document.createElementNS(
		'http://www.w3.org/2000/svg',
		'path',
	);
	arrowPath.setAttribute('d', 'M0,0 L6,3 L0,6 Z');
	arrowPath.setAttribute('fill', 'var(--icon)');
	marker.appendChild(arrowPath);
	defs.appendChild(marker);
	overlay.appendChild(defs);

	const wrapperRect = wrapperEl.getBoundingClientRect();

	annotations.forEach((annotation) => {
		const bubble = bubbles[annotation.targetIndex];
		if (!bubble || !annotation.labelPos) {
			return;
		}

		const bubbleX = chart.scales.x.getPixelForValue(bubble.x);
		const bubbleY = chart.scales.y.getPixelForValue(bubble.y);
		const labelX = (annotation.labelPos.x / 100) * wrapperRect.width;
		const labelY = (annotation.labelPos.y / 100) * wrapperRect.height;

		const label = document.createElement('div');
		label.classList.add('bubble-label');
		label.textContent = bubble.label;
		label.style.left = `${labelX}px`;
		label.style.top = `${labelY}px`;
		label.style.transform = 'translate(-50%, -50%)';
		labelsContainer.appendChild(label);

		const labelRect = label.getBoundingClientRect();
		const labelLeft = labelRect.left - wrapperRect.left;
		const labelTop = labelRect.top - wrapperRect.top;
		const labelRight = labelLeft + labelRect.width;
		const labelBottom = labelTop + labelRect.height;

		let startX = labelX;
		let startY = labelY;
		switch (annotation.anchor) {
			case 'left':
				startX = labelLeft;
				startY = labelTop + labelRect.height / 2;
				break;
			case 'right':
				startX = labelRight;
				startY = labelTop + labelRect.height / 2;
				break;
			case 'top':
				startX = labelLeft + labelRect.width / 2;
				startY = labelTop;
				break;
			case 'bottom':
				startX = labelLeft + labelRect.width / 2;
				startY = labelBottom;
				break;
			default:
				startX = labelX;
				startY = labelY;
				break;
		}

		const controlX = (startX + bubbleX) / 2 + (bubbleX - startX) * 0.1;
		const controlY = (startY + bubbleY) / 2 - 12;

		const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		path.setAttribute(
			'd',
			`M ${startX} ${startY} Q ${controlX} ${controlY} ${bubbleX} ${bubbleY}`,
		);
		path.setAttribute('fill', 'none');
		path.setAttribute('stroke', 'var(--icon)');
		path.setAttribute('stroke-width', '1.5');
		path.setAttribute('marker-end', `url(#${markerId})`);
		overlay.appendChild(path);
	});

	if (!wrapperEl.__bubbleObserver) {
		const observer = new ResizeObserver(() => {
			renderBubbleAnnotations({ chart, wrapperEl, bubbles, annotations });
		});
		observer.observe(wrapperEl);
		wrapperEl.__bubbleObserver = observer;
	}
};

function setupBubbleCenterTitle({ chart, wrapperEl, definition }) {
	if (!chart || !wrapperEl || !definition) {
		return;
	}

	const titleEl = wrapperEl.querySelector('.bubble-center-title');
	if (!titleEl) {
		return;
	}

	const positionTitle = () => {
		if (!chart.scales?.x || !chart.scales?.y) {
			return;
		}

		const bubbles = definition.bubbles || [];
		if (bubbles.length === 0) {
			return;
		}

		let sumWeight = 0;
		let sumX = 0;
		let sumY = 0;

		bubbles.forEach((bubble) => {
			const weight = bubble.r || 1;
			const bubbleX = chart.scales.x.getPixelForValue(bubble.x);
			const bubbleY = chart.scales.y.getPixelForValue(bubble.y);
			sumWeight += weight;
			sumX += bubbleX * weight;
			sumY += bubbleY * weight;
		});

		const cx = sumX / sumWeight;
		const cy = sumY / sumWeight;

		titleEl.textContent = definition.label || '';
		titleEl.style.left = `${cx}px`;
		titleEl.style.top = `${cy}px`;
	};

	requestAnimationFrame(positionTitle);

	if (!wrapperEl.__centerTitleObserver) {
		const observer = new ResizeObserver(() => {
			requestAnimationFrame(positionTitle);
		});
		observer.observe(wrapperEl);
		wrapperEl.__centerTitleObserver = observer;
	}
}
