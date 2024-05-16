const express = require('express');
const router = express.Router();
const serverPort = 8080;
const app = express();

const fetch = (...args) =>
	import('node-fetch').then(({default: fetch}) => fetch(...args));

const server = app.listen(serverPort, () => {
    console.log('App running on port '+serverPort);
});




app.get(`/`, async function (req, res) {
	const url =
    "https://env-9468449.appengine.flow.ch/items/Pages/";
	const options = {
		method: 'GET'
	};
	// promise syntax
	fetch(url, options)
		.then(res => res.json())
		.then(json => console.log(json))
		.catch(err => console.error('error:' + err));
	try {
		let response = await fetch(url, options);
		response = await response.json();
		res.status(200).json(response);
	} catch (err) {
		console.log(err);
		res.status(500).json({msg: `Internal Server Error.`});
	}
});
module.exports = router;


