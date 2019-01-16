const jsonServer = require('json-server');
const server = jsonServer.create();
const middlewares = jsonServer.defaults();

const bodyParser = require('body-parser');

server.use(middlewares);
server.use(bodyParser.json({ type: 'application/ld+json' }));
// server.use(jsonServer.bodyParser);

const _ = require('lodash');

// Checks if Authorization Header has good Bearer
let isBearerOk = (req) => {
  return req.hasOwnProperty('authorization');
};

/* list of custom routes */
server.get('/__rules', function (req, res) {
  res.json({
    'GET /login': 'Log a user in',
    'GET /forget-password': 'Send mail to reset password',
    'PUT /reset-password/:id': 'Reset the user password',
    'GET /users': 'Get full user list',
    'GET /users/:userId': 'Get a specific user',
    'GET /me': 'Get the connected user data',
    'GET /dictionaries': 'Get dictionaries',
    'GET /rights': 'Get the list of rights per user roles',
    'GET /companies': 'Get all companies',
    'GET /companies/:companyId': 'Get a single company',
    'POST /companies': 'Add a new company',
    'PUT /companies/:companyId': 'Edit a company',
    'GET /leads': 'Get leads full list',
    'GET /leads/:id': 'Get a single lead',
    'GET /tarif-assurances/:tarifId': 'Retrieve an existing pricing associated to a Lead',
    'POST /tarif-assurances': 'Create a pricing for a given Lead',
    'PUT /tarif-assurances/:tarifId': 'Update the given pricing',
    'GET /critere-assurances/:critereId': 'Gets an existing insurance criteria',
    'PUT /critere-assurances/:critereId': 'Update an insurance criteria',
    'GET /adp-leads/:leadId/tarification/:partnerId': 'Retrieves partner data for a Lead (e.g.: Maif)',
  });
});

/**
 * User routes
 * */
server.get(['/users', '/users/:userId'], (req, res) => {
  if (isBearerOk(req.headers)) {
    let userFound = users.get.users(req.params.userId);
    if (_.isNil(userFound)) {
      userFound = companies.get.users(req.params.userId);
    }

    res.status(200).json(userFound);
  } else {
    res.status(401).json({ 'error': ['Il faut se connecter avec login: ' + user.myMail + ' et password: ' + user.myPassword] });
  }
});

server.post('/users', (req, res) => {
  if (isBearerOk(req.headers)) {
    res.status(201).json(companies.post.users(req.body));
  } else {
    res.status(401).json({ 'error': ['Il faut se connecter avec login: ' + user.myMail + ' et password: ' + user.myPassword] });
  }
});

server.put('/users/:userId', (req, res) => {
  if (isBearerOk(req.headers)) {
    res.status(201).json(companies.put.users(req.params.userId, req.body));
  } else {
    res.status(401).json({ 'error': ['Il faut se connecter avec login: ' + user.myMail + ' et password: ' + user.myPassword] });
  }
});

server.listen(1337, () => {
  console.log('JSON Server is running');
});
