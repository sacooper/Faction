/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	update: function(req, res){
		if (req.user == null || req.user == undefined){
			req.status(400).send("No user included")
		}

		var buildResponse = function(err, user){
			if (err){
				res.status(500).send(err);
				sails.log(err);
				return;
			}

			var factions 		 = user.pendingFactions || [];
			var new_friends		 = user.newFriends		|| [];
			var pending_requests = user.pendingFrom		|| [];
			var response 		 = [];

			factions 		 = factions.map(
								function(f){return f.id;});
			new_friends 	 = new_friends.map(
								function(f){return f.username;});
			pending_requests = pending_requests.map(
								function(f){return f.username;});

			user.pendingFactions 	= [];
			user.newFriends 		= [];
			user.save();

			res.status(200).send({
				factions 		 : factions,
				new_friends 	 : new_friends,
				pending_requests : pending_requests,
				response    	 : response
			});
			return;
		};

		var user = User.findOne()
					.where({id : req.user.id})
					.populate('pendingFactions')
					.populate('newFriends')
					.populate('pendingFrom')
					.exec(buildResponse);
	}
};

