const http = require("http");

const server = http.createServer((req, res) => {
	console.log(`Request received:`);
	console.log(`URL: ${req.url}`);
	console.log(`Method: ${req.method}`);
	console.log(`Headers: `, req.headers);
	let body = "";
	req.on("data", (chunk) => {
		console.log("chunk", chunk.toString("ascii"));
		console.log("ondata", chunk.toString("ascii").split("\t"));
		body += chunk.toString();
	});
	req.on("end", () => {
		console.log(`Body: ${body}`);
		res.end("OK");
	});
});
// 123       2024-11-22 01:10:00     4       1       0       0       0       0       0       0
const port = 8081;
server.listen(port, () => {
	console.log("Server is listening on port " + port);
});
