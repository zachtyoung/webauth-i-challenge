function restricted(req,res,next){

  if(req && req.session && req.session.username){
    next()
  } else {
    res.status(401).json({ message: 'Invalid Credentials' });
  }
  }

  module.exports = restricted;