/**
 * GroupController
 *
 * @description :: Server-side logic for managing groups
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	create: function(req, res){
		var name = req.param('name'); 			// Name of group
		var friendUsernames = req.param('friends') || []; 	// OPTIONAL: friends also in group

		if (!name){
			res.status(400).send(Message.createError('No group name included'));
		} else {
			Group.count({creator: req.user.id, name: name})
				.then(function(cnt){
					if (cnt === 0){
						User.findOne({id: req.user.id})
							.populate('friends')
							.then(function(me){
								return [me, me.friends]})
							.spread(function(me, friends){
								var friendsInGroup = friendUsernames.map(function(username){
										var friend = _.find(friends, function(f){
											return f.username == username;
										});
										if (friend)
											return friend.id;
									}).filter(function(f) { return typeof f !== 'undefined'; });
								Group.create({
									creator: me.id,
									name: name,
									friendsInGroup: friendsInGroup
								}).then(function(group){
									res.status(200).send(
										Message.createSuccess("Successfully created group" + name, {groupId: group.id}));
								}).catch(function(err){
									res.status(500).send(Message.createError(err));
								});
							}).catch(function(err){
								res.status(500).send(err);
							});
					} else {
						res.status(400).send(Message.createError('A group with this name alread exists'));
					}
				}).catch(function(err){
					res.status(500).send(err);
				})
		}

	},

	addFriend: function(req, res){

	},

	removeGroup: function(req, res){

	},

	removeFriendFromGroup: function(req, res){
		
	}
};

