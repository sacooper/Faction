/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `config/404.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {

  /** AUTH **/

  'get    /api/user/login'               : 'AuthController.login',
  'get    /api/user/logout'              : 'AuthController.logout',
  'post   /api/user/logout'              : 'AuthController.logout',
  'post   /api/user/login'               : 'AuthController.callback',
  'get    /api/user/new'                 : 'AuthController.register',
  'post   /api/user/new'                 : 'AuthController.callback',
    
  'put    /api/user/update-password'     : 'AuthController.updatePassword',
  
  'post   /api/auth/local'               : 'AuthController.callback',
  'post   /api/auth/local/:action'       : 'AuthController.callback',
  
  'get    /api/auth/:provider'           : 'AuthController.provider',
  'get    /api/auth/:provider/:action'   : 'AuthController.callback',
  'get    /api/auth/:provider/callback'  : 'AuthController.callback',
  
  /** Faction related routes **/  
  'post   /api/factions/send'            : 'FactionController.create',
  'post   /api/factions/respond'         : 'FactionController.respond',
  'post   /api/factions/delete'          : 'FactionController.deleteFaction',

  /** Comment related routes **/
  'post   /api/factions/add-comment'     : 'CommentController.addComment',
  'put    /api/factions/enable-comment'  : 'CommentController.enableComment',
 
  /** User info flow and update control  routes **/
  'get    /api/user/info'                : 'UserController.getAllInfo',
  'post   /api/user/update'              : 'UserController.update',
 
  /** Frient request routes **/
  'post   /api/user/request-friend'      : 'UserController.addFriend',
  'post   /api/user/accept-friend'       : 'UserController.acceptFriendRequest',
  'delete /api/user/delete-friend'       : 'UserController.deleteFriend',
  
  /** User utilities **/  
  'get    /api/user/search'              : 'UserController.search',
  'get    /api/user/friends'             : 'UserController.friends', 
  'get    /api/user/factions'            : 'UserController.factions',
  
  /** Group related routes **/  
  'post   /api/group/create'             : 'GroupController.create',
  'post   /api/group/add-friend'         : 'GroupController.addFriend',
  'delete /api/group/remove'             : 'GroupController.removeGroup',
  'delete /api/group/remove-friend'      : 'GroupController.removeFriendFromGroup',

  /** Top three friends **/
  'get /api/user/top-three'         : 'UserController.topThree',

  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, *
  * etc. depending on your default view engine) your home page.              *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/

  '/': {
    view: 'homepage'
  },



  /***************************************************************************
  *                                                                          *
  * Custom routes here...                                                    *
  *                                                                          *
  *  If a request to a URL doesn't match any of the custom routes above, it  *
  * is matched against Sails route blueprints. See `config/blueprints.js`    *
  * for configuration options and examples.                                  *
  *                                                                          *
  ***************************************************************************/

};
