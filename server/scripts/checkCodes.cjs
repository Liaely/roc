// @ts-check

const fs = require("fs");
const path = require("path");

const simulations = {};

for (const item of fs.readdirSync(`${__dirname}/../simulations`)) {
	if (path.extname(item) !== ".json") {
		console.error(`Skipping unexpected ${item}`);
		continue;
	}
	simulations[path.basename(item, ".json")] = require(`${__dirname}/../simulations/${item}`);
}

const seenCodes = new Map();
const panels = [];
for (const [id, sim] of Object.entries(simulations)) {
	for (const panel of sim.panels) {
		const panelData = { sim: sim.name, id, name: panel.name, code: panel.code ?? "" };
		panels.push(panelData);

		if (!panel.code) continue;
		const existing = seenCodes.get(panel.code);
		if (existing) {
			console.error(`Duplicated code for ${id}.${panel.name}: already used by ${existing.id}.${existing.name}`);
		} else {
			seenCodes.set(panel.code, panelData);
		}
	}
}

let output = [
	`# Panel codes to panel name and sim`,
	"",
	"Sim names ~~struck through~~ indicate a simulation that does not exist in SimSig loader format.",
	"The list is sorted alphabetically by sim name, then panel code.",
	"",
	"| Code | Panel Name | Sim Name |",
	"| -- | ---------- | --- |",
];
let lastSim;
for (const panel of panels
	.sort((a, b) => a.sim.localeCompare(b.sim))
	.sort((a, b) => (a.sim !== b.sim ? 0 : a.code.localeCompare(b.code)))) {
	output.push(`| ${panel.code} | ${panel.name} | ${panel.sim !== lastSim ? panel.sim : ""} |`);
	lastSim = panel.sim;
}

console.log(output.join("\n"));
