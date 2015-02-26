/**
 * notLoggedIn
 *
 * @module      :: Policy
 * @description :: Simple policy to allow non-authenticated user
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
 module.exports = function(req, res, next) {

  // User is allowed, proceed to the next policy, 
  // or if this is the last policy, the controller
  if (req.user) {
  	return res.forbidden(Message.createError('You are not permitted to perform this action.'));
  }

  // User is not allowed
  // (default res.forbidden() behavior can be overridden in `config/403.js`)
  return next();		
  
};
