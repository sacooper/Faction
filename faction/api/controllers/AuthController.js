var bcrypt = require('bcryptjs');

/**
 * Authentication Controller
 *
 * This is merely meant as an example of how your Authentication controller
 * should look. It currently includes the minimum amount of functionality for
 * the basics of Passport.js to work.
 */
var AuthController = {
  /**
   * Render the login page
   *
   * The login form itself is just a simple HTML form:
   *
      <form role="form" action="/auth/local" method="post">
        <input type="text" name="identifier" placeholder="Username or Email">
        <input type="password" name="password" placeholder="Password">
        <button type="submit">Sign in</button>
      </form>
   *
   * You could optionally add CSRF-protection as outlined in the documentation:
   * http://sailsjs.org/#!documentation/config.csrf
   *
   * A simple example of automatically listing all available providers in a
   * Handlebars template would look like this:
   *
      {{#each providers}}
        <a href="/auth/{{slug}}" role="button">{{name}}</a>
      {{/each}}
   *
   * @param {Object} req
   * @param {Object} res
   */
  login: function (req, res) {
    var strategies = sails.config.passport
      , providers  = {};

    // Get a list of available providers for use in your templates.
    Object.keys(strategies).forEach(function (key) {
      if (key === 'local') {
        return;
      }

      providers[key] = {
        name: strategies[key].name
      , slug: key
      };
    });

    // Render the `auth/login.ext` view
    res.view({
      providers : providers
    , errors    : req.flash('error')
    });
  },

  /**
   * Log out a user and return them to the homepage
   *
   * Passport exposes a logout() function on req (also aliased as logOut()) that
   * can be called from any route handler which needs to terminate a login
   * session. Invoking logout() will remove the req.user property and clear the
   * login session (if any).
   *
   * For more information on logging out users in Passport.js, check out:
   * http://passportjs.org/guide/logout/
   *
   * @param {Object} req
   * @param {Object} res
   */
  logout: function (req, res) {
    req.session.destroy(function(err){
      if (err) {
        sails.log(err);}

      req.logout();
      res.clearCookie('sails.sid', {path : '/'});
      res.status(401).send();
    });
  },

  /**
   * Render the registration page
   *
   * Just like the login form, the registration form is just simple HTML:
   *
      <form role="form" action="/auth/local/register" method="post">
        <input type="text" name="username" placeholder="Username">
        <input type="text" name="email" placeholder="Email">
        <input type="password" name="password" placeholder="Password">
        <button type="submit">Sign up</button>
      </form>
   *
   * @param {Object} req
   * @param {Object} res
   */
  register: function (req, res) {
    res.view({
      errors: req.flash('error')
    });
  },


  updatePassword: function (req, res){
    var userId = req.user.id;
    var oldPwd = req.param('old');
    var newPwd = req.param('new');

    var afterUpdate = function(err, updates) {
      if(err) {
        res.status(500).send(err);
      }
      if(updates.length == 0) {
        res.status(200).json({message: "No updates"});
        return;
      }
      res.status(200).json({message: "Update successful"})
      return;
    };

    var update = function(err, valid){
      if (!err){
        if (valid){
          Passport.update({
              user : userId, protocol:'local'
            },{
              password : newPwd
            })
          .exec(afterUpdate);
        } else {
          res.status(403).send("Invalid old password");
          return;
        }
      } else {
        res.status(500).send(err);
        sails.log(err);
        return;
      }
    };

    if(req.user.id === undefined) {
      res.status(403).send('');
      return;
    }

    Passport.findOne()
      .where({user:req.user.id, protocol: 'local'})
      .then(function(passport){
        passport.validatePassword(oldPwd, update)})

  },

  /**
   * Create a third-party authentication endpoint
   *
   * @param {Object} req
   * @param {Object} res
   */
  provider: function (req, res) {
    passport.endpoint(req, res);
  },

  /**
   * Create a authentication callback endpoint
   *
   * This endpoint handles everything related to creating and verifying Pass-
   * ports and users, both locally and from third-party providers.
   *
   * Passport exposes a login() function on req (also aliased as logIn()) that
   * can be used to establish a login session. When the login operation
   * completes, user will be assigned to req.user.
   *
   * For more information on logging in users in Passport.js, check out:
   * http://passportjs.org/guide/login/
   *
   * @param {Object} req
   * @param {Object} res
   */
  callback: function (req, res) {
    function tryAgain (err) {

      // Only certain error messages are returned via req.flash('error', someError)
      // because we shouldn't expose internal authorization errors to the user.
      // We do return a generic error and the original request body.
      var flashError = req.flash('error')[0];

      if (err && !flashError ) {
        req.flash('error', 'Error.Passport.Generic');
      } else if (flashError) {
        req.flash('error', flashError);
      }
      req.flash('form', req.body);

      // If an error was thrown, redirect the user to the
      // login, register or disconnect action initiator view.
      // These views should take care of rendering the error messages.
      var action = req.param('action');

      switch (action) {
        case 'register':
          res.json({error: 'Error registering'});
          // res.redirect('/register');
          break;
        case 'disconnect':
          res.json({error: 'Error disconnecting'});
          // res.redirect('back');
          break;
        default:
          res.json({error: 'Error logging in'});
          // res.redirect('/login');
      }
    }

    passport.callback(req, res, function (err, user) {
      if (err) {
        return tryAgain();
      }

      req.login(user, function (err) {
        if (err) {
          return tryAgain();
        }

        res.redirect('/');
      });
    });
  },

  /**
   * Disconnect a passport from a user
   *
   * @param {Object} req
   * @param {Object} res
   */
  disconnect: function (req, res) {
    passport.disconnect(req, res);
  }
};

module.exports = AuthController;
