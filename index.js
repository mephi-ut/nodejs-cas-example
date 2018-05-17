var express = require('express');
var ConnectCas = require('connect-cas2');
var bodyParser = require('body-parser');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var MemoryStore = require('session-memory-store')(session);
 
var app = express();

var myURL = 'http://85.143.112.125:3000'
 
app.use(cookieParser());
app.use(session({
	name: 'NSESSIONID',
	secret: 'Hello I am a long long long secret',
	store: new MemoryStore()  // or other session store
}));
 
var casClient = new ConnectCas({
	debug: true,
	ignore: [
		/\/ignore/
	],
	match: [],
	servicePrefix: myURL,
	serverPath: 'https://login.mephi.ru',
	paths: {
		validate: '/validate',
		serviceValidate: '/serviceValidate',
		//proxy: '/proxy',
		login: '/login',
		logout: '/logout',
		proxyCallback: false, // to disable the proxy mode (it's not supported in our case)
		//proxyCallback: '/proxyCallback'
	},
	redirect: false,
	gateway: false,
	renew: false,
	slo: true,
	/*cache: {
		enable: false,
		ttl: 5 * 60 * 1000,
		filter: []
	},
	fromAjax: {
		header: 'x-client-ajax',
		status: 418
	},*/
});
 
app.use(casClient.core());
 
// NOTICE: If you want to enable single sign logout, you must use casClient middleware before bodyParser.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
 
app.get('/logout', casClient.logout());
 
// or do some logic yourself
app.get('/logout', function(req, res, next) {
	// Do whatever you like here, then call the logout middleware
	casClient.logout()(req, res, next);
});
app.get('/', function(req, res, next) {
	res.send(req.session.cas.user);
});

app.listen(3000, function () {
	console.log('Example app listening on port 3000! Try '+myURL);
});

