// var User = {
module.exports = {
  // Enforce model schema in the case of schemaless databases
  schema: true,

  attributes: {
    username  : { 
    	type: 'string', 
    	unique: true 
    },
    email     : { 
    	type: 'email',  
    	unique: true 
    },
    factions  : {
    	collection: 'faction',
      via: 'sender'
    },
    factionsReciever : {
      collection: 'faction'
    },
    pendingFactions : {
      collection: 'faction'
    },
    new_friends : {
    	collection: 'user'
    },
    pending_to  : {
      collection: 'user'
    },
    pendingFrom : {
    	collection: 'user'
    },
    friends : {
    	collection: 'user'
    },
    passports : { collection: 'Passport', via: 'user' }
  },

  /**
   * Callback to be run before creating a User. Enforces uniqueness
   * of username and email.
   *
   * @param {Object}   user The soon-to-be-created User
   * @param {Function} next
   */
  beforeCreate: function (user, next) {
  	User.find()
  		.where({username: user.username})
  		.exec(function(err, users) {
  			// Check if username is unique
	  		if(users === undefined || users.length == 0) {
	  			User.find()
	  				.where({email: user.email})
	  				.exec(function(err, users) {
	  					// Check if email is unique
				  		if(users === undefined || users.length == 0) {
				  			next(null, user);
				  		} else {
				  			var err = {};
			  				err.invalidAttributes = {};
							err.code = 'E_VALIDATION';
							err.invalidAttributes.email = true;
				  			next(err);
				  		}
			  	});
	  		} else {
	  			var err = {};
  				err.invalidAttributes = {};
				err.code = 'E_VALIDATION';
				err.invalidAttributes.username = true;
	  			next(err);
	  		}
	  	});
  	}
};

// module.exports = User;
