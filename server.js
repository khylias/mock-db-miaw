const fs = require('fs')
const bodyParser = require('body-parser')
const jsonServer = require('json-server')
const jwt = require('jsonwebtoken')
const jwtDecode = require('jwt-decode')

const server = jsonServer.create()
const router = jsonServer.router('./dev.json')
const userdb = JSON.parse(fs.readFileSync('./users.json', 'UTF-8'))

server.use(jsonServer.defaults());
server.use(bodyParser.urlencoded({ extended: true }))
server.use(bodyParser.json())

const SECRET_KEY = '123456789'

const expiresIn = '6h'

// Create a token from a payload 
function createToken(payload) {
    return jwt.sign(payload, SECRET_KEY, { expiresIn })
}

// Verify the token 
function verifyToken(token) {
    return jwt.verify(token, SECRET_KEY, (err, decode) => decode !== undefined ? decode : err)
}

// Check if the user exists in database
function isAuthenticated({ email, password }) {
    return userdb.users.findIndex(user => user.email === email && user.password === password) !== -1
}


server.post('/login', (req, res) => {
    const { email, password } = req.body
    if (isAuthenticated({ email, password }) === false) {
        const status = 401
        const message = 'Incorrect email or password'
        res.status(status).json({ status, message })
        return
    }
    const userID = userdb.users.find(u => u.email === email).id;
    const access_token = createToken({ email, password, userID })
    res.status(200).json({ access_token })
})

server.get('/bikes', (req, res, next) => {
    next()
})

server.get('/dictionnaries', (req, res, next) => {
    next()
})

server.post('/bikes', (req, res, next) => {
    if (req.headers.authorization === undefined || req.headers.authorization.split(' ')[0] !== 'Bearer') {
        const status = 401
        const message = 'Error in authorization format'
        res.status(status).json({ status, message })
        return
    }

    const decoded = jwtDecode(req.headers.authorization.split(' ')[1]);
    // test if user is admin
    if(decoded.userID !== 1) {
        const status = 403
        const message = 'Forbidden access'
        res.status(status).json({ status, message })
        return
    }

    next()
})

server.patch('/bikes', (req, res, next) => {
    if (req.headers.authorization === undefined || req.headers.authorization.split(' ')[0] !== 'Bearer') {
        const status = 401
        const message = 'Error in authorization format'
        res.status(status).json({ status, message })
        return
    }

    const decoded = jwtDecode(req.headers.authorization.split(' ')[1]);
    // test if requested clientID is the same with JWT
    console.log(decoded.userID);
    if(decoded.userID !== 1) {
        const status = 403
        const message = 'Forbidden access'
        res.status(status).json({ status, message })
        return
    }

    next()
})
server.get('/orders', (req, res, next) => {
    if (req.headers.authorization === undefined || req.headers.authorization.split(' ')[0] !== 'Bearer') {
        const status = 401
        const message = 'Error in authorization format'
        res.status(status).json({ status, message })
        return
    }
    const decoded = jwtDecode(req.headers.authorization.split(' ')[1]);
    // test if requested clientID is the same with JWT
    if(decoded.userID !== +req.query.clientID) {
        const status = 403
        const message = 'Forbidden access'
        res.status(status).json({ status, message })
        return
    }

    // IF admin is logged then return all orders
    if(+req.query.clientID === 1){
        delete req.query.clientID;
    }
    try {
        verifyToken(req.headers.authorization.split(' ')[1])
        next()
    } catch (err) {
        const status = 401
        const message = 'Error access_token is revoked'
        res.status(status).json({ status, message })
    }
})

server.get('/users', (req, res, next) => {
    next()
})
server.get('/users/:id', (req, res, next) => {
    if (req.headers.authorization === undefined || req.headers.authorization.split(' ')[0] !== 'Bearer') {
        const status = 401
        const message = 'Error in authorization format'
        res.status(status).json({ status, message })
        return
    }
    
    const decoded = jwtDecode(req.headers.authorization.split(' ')[1]);
    if(decoded.userID !== +req.params.id) {
        const status = 403
        const message = 'Forbidden access'
        res.status(status).json({ status, message })
        return
    }
    try {
        verifyToken(req.headers.authorization.split(' ')[1])
        next()
    } catch (err) {
        const status = 401
        const message = 'Error access_token is revoked'
        res.status(status).json({ status, message })
    }
})

server.use(router)

server.listen(3000, () => {
    console.log('Run Auth API Server on localhost:3000')
})