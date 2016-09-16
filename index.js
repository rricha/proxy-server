var http = require('http')
var request = require('request')
var path = require('path')
var fs = require('fs')
var argv = require('yargs')
  .default('host', '127.0.0.1')
  .argv
var scheme = 'http://'
var port = argv.port || (argv.host === '127.0.0.1' ? 8000 : 80)

var destinationUrl = argv.url || scheme + argv.host + ':' + port
  // var logPath = argv.log && path.join(__dirname, argv.log)
var logPath = argv.log
var logStream = logPath ? fs.createWriteStream(logPath) : process.stdout

http.createServer((req, res) => {
  // Proxy code
  var options = {
    headers: req.headers,
    url: (req.headers['x-destination-url'] || destinationUrl) + req.url
  }
  options.method = req.method

  var downstreamResponse = req.pipe(request(options))
  logStream.write(JSON.stringify(downstreamResponse.headers))
  downstreamResponse.pipe(logStream, { end: false })
  downstreamResponse.pipe(res)
    //req.pipe(request(options)).pipe(res);
}).listen(8001)

http.createServer((req, res) => {
  console.log(`Request received at: ${req.url}`)
  for (var header in req.headers) {
    res.setHeader(header, req.headers[header])
  }
  process.stdout.write('\n\n\n' + JSON.stringify(req.headers))
  req.pipe(process.stdout)
  req.pipe(res)
}).listen(8000)
