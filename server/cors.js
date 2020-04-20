// middleware for setting CORS headers

/*
cors parameters
@accessControl:object
{ 
  @origin: string
  @credentials: boolean
  @methods: array
  @headers: array
}
*/
const cors = accessControls => {
  const defaults = {
    origin: '*',
    credentials: 'false',
    methods: ['*'],
    headers: ['*'],
  };

  const { origin, credentials, methods, headers } = {
    ...defaults,
    ...accessControls,
  };

  return (req, res, next) => {
    res.header('Access-Control-Allow-Origin', origin);
    res.header(
      'Access-Control-Allow-Credentials',
      credentials ? 'true' : 'false'
    );
    res.header('Access-Control-Allow-Methods', methods.join());
    res.header('Access-Control-Allow-Headers', headers.join());
    next();
  };
};

module.exports = { cors };
