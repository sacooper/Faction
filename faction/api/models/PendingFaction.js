/**
* PendingFaction.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
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
  	unread: {
  		type: 'boolean'
  	},
  	readAt: {
  		type: 'datetime'
  	}
  }
};

