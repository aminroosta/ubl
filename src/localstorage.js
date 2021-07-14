const fs = require('fs');
const path = require('path');
const os = require('os');
const Cryptr = require('cryptr');

const { username } = os.userInfo();
const cryptr = new Cryptr(`encryption for ${username} ^^`);

function getItem(key) {
	const file_path = path.join(__dirname, `${key}.crypt`);
	if(fs.existsSync(file_path)) {
		const encrypted_json = fs.readFileSync(file_path, 'utf8');
		const json = cryptr.decrypt(encrypted_json);
		return JSON.parse(json);
	}
	return null;
};

function setItem(key, object) {
	const file_path = path.join(__dirname, `${key}.crypt`);
	const json = JSON.stringify(object, null, 2);
	const encrypted_json = cryptr.encrypt(json);
	fs.writeFileSync(file_path, encrypted_json, 'utf8');
};
function deleteItem(key) {
	const file_path = path.join(__dirname, `${key}.crypt`);
	if(fs.existsSync(file_path)) {
		fs.unlinkSync(file_path);
	}
};

module.exports = {
	getItem,
	setItem,
	deleteItem,
};
