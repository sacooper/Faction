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
      defaultsTo: '2015-02-17T19:44:44.000Z'
  	},
    answeredAt: {
      type: 'datetime',
      defaultsTo: '2015-02-17T19:44:44.000Z'
    },
    response: {type: 'boolean'}
  }
};

