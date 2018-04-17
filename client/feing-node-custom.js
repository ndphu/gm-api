const Args = require('args-js');
const _ = require('lodash');
const http = require('http');
const URL = require('url');
const cookieService = require('../services/CookieService');


function FeignNodeClient() {
  var args = Args([
    {defaults: Args.OBJECT | Args.Optional, _default: {}},
  ], arguments);


  this.defaults = args.defaults;


}

FeignNodeClient.prototype.request = function (request) {
  const options = this._createHttpOptions(request.baseUrl, request.options, request.parameters);

  return new Promise(function (resolve, reject) {
    const _option = _.cloneDeep(options);
    if (!_option.headers) {
      _option.headers = {}
    }
    _option.headers = Object.assign(_option.headers,
      request.options.headers ? request.options.headers : {},
      {'Cookie': cookieService.getCookieHeader()});
    console.log('Sending request with cookie: ' + _option.headers.Cookie);
    const req = http.request(_option, function (res) {

      let body = '';
      res.on('data', function (chunk) {
        body += chunk;
      });
      res.on('end', function () {
        if (res.statusCode >= 400)
          return reject({status: res.statusCode, message: {}});

        return resolve({raw: res, body: body});
      });

    });

    req.on('error', function (e) {
      return reject({status: 0, message: e});
    });

    if (_option.method !== 'GET' && request.parameters) {
      console.log(request.parameters);
      req.write(request.parameters);
    }

    req.end();

  });
};

FeignNodeClient.prototype._createHttpOptions = function (baseUrl, requestOptions, parameters) {
  var options = Args([
    {method: Args.STRING | Args.Optional, _default: 'GET'},
    {uri: Args.STRING | Args.Required}
  ], [requestOptions]);

  var url = URL.parse(baseUrl + options.uri, true);
  if (options.method === 'GET') {
    url.query = _.defaults(parameters, url.query);
  }
  url = URL.parse(URL.format(url));
  return _.defaults({
    hostname: url.hostname,
    port: url.port,
    method: options.method,
    path: url.path
  }, this.defaults);
};


module.exports = FeignNodeClient;