/**
* PendingFriendRequest.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
  	sender: {	// Person who initiated friend request
  		model: 'user'
  	},
  	recipient: { // Person who should receive friend request
  		model: 'user'
  	}
  }
};

