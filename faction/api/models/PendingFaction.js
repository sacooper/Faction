/**
* PendingFaction.js
*
* @description :: This is the model that represents a pending faction and the status WRT the recipient
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
  	recipient : {
  		model: 'user'
  	},
  	faction: {
  		model: 'faction'
  	},
  	read: { // If the user has read the faction or not (if false, send in api/user/update)
  		type: 'boolean',
      defaultsTo: false
  	},
    answered: { // If the user answered the faction or not
      type: 'boolean',
      defaultsTo: false
    },
  	readAt: {
  		type: 'datetime',
      defaultsTo: 'Tue Feb 17 2015 14:44:44 GMT-0500 (EST)'
  	}
  }
};

