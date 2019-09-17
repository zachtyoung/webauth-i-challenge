const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const session = require('express-session');
const knexSessionStore = require('connect-session-knex')(session)
const db = require('./database/dbConfig.js');
const Users = require('./users/users-model.js');
const bcrypt = require('bcryptjs')
const restricted = require('./auth/restricted-middleware')
const knexConnection = require('./database/dbConfig')
const server = express();

const sessionOptions ={
  name: 'thisSession',
  secret: process.env.COOKIE_SECRET || 'this is my secret',
  cookie:{
    secure : process.env.COOKIE_SECURE || false,
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true,
  },
  resave : false,
  saveUninitialized: true,
  store: new knexSessionStore({
    knex: knexConnection,
    createtable:true,
    clearInterval: 1000 * 60 * 60,
  })
}
server.use(helmet());
server.use(express.json());
server.use(cors());
server.use(session(sessionOptions))

server.get('/', (req, res) => {
  res.json({session: req.session})
});

server.post('/api/register', (req, res) => {
  let user = req.body;

  const hash = bcrypt.hashSync(user.password)
  user.password = hash;

  Users.add(user)
    .then(saved => {
      res.status(201).json(saved);
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

server.post('/api/login',  (req, res) => {
  let { username, password } = req.body;
const isValid = bcrypt.compare(password, ).then((res) =>{})

  Users.findBy({ username })
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(password, user.password )) {
        req.session.username = user.username;

        res.status(200).json({ message: `Welcome ${user.username}!` });
      } else {
        res.status(401).json({ message: 'You are not logged in' });
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

server.get('/api/users', restricted,(req, res) => {
  Users.find()
    .then(users => {
      res.json(users);
    })
    .catch(err => res.send(err));
});

server.get('/logout'),(req, res)=>{
  req.session.destroy(function(err){
    res.status(200).json({message: 'Sucessfully logged out'})
  })
}

const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`\n** Running on port ${port} **\n`));
