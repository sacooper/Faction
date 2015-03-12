/**
* Faction.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
	sender   : {
        model: 'user'
    },
    recipients: {
    	collection: 'user',
        via: 'factionsReceived',
        dominant: true
    },
    status: {
        collection: 'pendingFaction',
        via: 'faction'
    }, 
    comments : {
    	collection: 'comment',
    	via: 'faction'
    },
    trueResponses : {
    	type: 'integer'
    },
    falseResponses : {
    	type: 'integer'
    },
    story    : { type: 'string' },
    fact     : { type: 'boolean' },
    commentsEnabled: { 
        type: 'boolean',
        defaultsTo: true
    },
    deletedBy: {
        collection: 'user',
        via: 'deletedFactions',
        dominant: true
    }
  },
};

