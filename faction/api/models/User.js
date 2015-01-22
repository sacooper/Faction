var User = {
  // Enforce model schema in the case of schemaless databases
  schema: true,

  attributes: {
    username  : { type: 'string', unique: true },
    email     : { type: 'email',  unique: true },
    factions  : {
    	collection: 'faction',
        via: 'sender'
    },
    pendingFactions : {
        collection: 'faction'
    },
    pendingTo : {
    	collection: 'user'
    },
    pendingFrom : {
    	collection: 'user'
    },
    friends : {
    	collection: 'user'
    },
    passports : { collection: 'Passport', via: 'user' }
  }
};

module.exports = User;
