const fs = require('fs');
const path = require('path');

function getItem(key) {
	const file_path = path.join(__dirname, `${key}.crypt`);
	if(fs.existsSync(file_path)) {
		const json = fs.readFileSync(file_path, 'utf8');
		return JSON.parse(json);
	}
	return null;
};

function setItem(key, object) {
	const file_path = path.join(__dirname, `${key}.crypt`);
	const json = JSON.stringify(object, null, 2);
	fs.writeFileSync(file_path, json, 'utf8');
};

module.exports = {
	getItem,
	setItem
};
