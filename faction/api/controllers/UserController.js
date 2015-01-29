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
								function(f){
									return {
										faction_id : f.id, 
										sender : f.sender,
										story  : f.}});
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
					.exec(buildResponse)
	},


	acceptFriendRequest: function(req, res) {

		var friendUsername = req.param('username');
		var accepted = req.param('accepted');
		var myId = req.user.id;

		var addFriendError = function(err) {
			sails.log(err);
			res.json({error: 'Could not add new friend'})
		};

		User.findOne()
			.where({username: friendUsername})
			.populate('friends')
			.populate('newFriends')
			.populate('pendingFrom')
			.then(function(friend) {
				User.findOne()
					.where({id: myId})
					.populate('friends')
					.populate('newFriends')
					.populate('pendingTo')
					.then(function(me) {

						if(me.id === friend.id) {
							res.json({error: 'You cannot add yourself.'})
						}

						if(_.some(me.friends, function(f){return f.id === friend.id})
							&& _.some(friend.friends, function(f){return f.id === me.id})) {
							res.json({error: 'You are already friends with ' + friend.username})
						}

						me.pendingTo.remove(friend.id);
						friend.pendingFrom.remove(myId);

						if(accepted) {
							me.newFriends.add(friend.id);
							me.friends.add(friend.id);

							friend.newFriends.add(myId);
							friend.friends.add(myId);
							me.save(function(err) {
								friend.save(function(err) {
									res.json({message: 'Successfully added ' + friend.username});	
								});
							});
						} else {
							me.save(function(err) {
								friend.save(function(err) {
									res.json({message: 'Successfully removed request from ' + friend.username});	
								});
							});
						}
					}).catch(addFriendError);
			}).catch(addFriendError);

	},

	addFriend: function(req, res) {

		var requestError = function(err) {
			sails.log(err);
			res.json({error: "Error in posting the request."});
		};

		var alreadyRequested = function(me, friend) {
			if(_.some(friend.pendingFrom, function(f){return f.id === me.id;}) 
				&& _.some(me.pendingTo, function(f){return f.id == friend.id;})) {
				res.json({error: 'Already posted a request'})
			}
		};

		var alreadyFriends = function(me, friend) {
			if(_.some(friend.friends, function(f){return f.id === me.id;}) 
				&& _.some(me.friends, function(f){return f.id === friend.id;})) {
				res.json({error: 'Already friends with' + friend.username})
			}
		};

		var reverseRequest = function(me, friend) {
			if(_.some(friend.pendingTo, function(f){return f.id === me.id;})
				&& _.some(me.pendingFrom, function(f){return f.id === friend.id;})) {
				// Add them as friends
				friend.pendingTo.remove(me.id);
				me.pendingFrom.remove(friend.id);
				
				friend.friends.add(me.id);
				friend.newFriends.add(myId);

				me.friends.add(friend.id);
				me.newFriends.add(friend.id);

				friend.save(function(err){
					me.save(function(err) {
						res.json({message: friend.username + 'already added you, therefore you are now friends'})
					});
				});
			}
		};

		var friendUsername = req.param('username');
		var myId = req.user.id;

		sails.log(myId);

		User.findOne()
			.where({username: friendUsername})
			.populate('pendingFrom')
			.populate('friends')
			.populate('newFriends')
			.then(function(friend) {

				User.findOne()
					.where({id: myId})
					.populate('pendingTo')
					.populate('friends')
					.populate('newFriends')
					.then(function(me) {

						if(me.id === friend.id) {
							res.json({error: 'You cannot add yourself.'})
						}
 
 						// Already did a friend request
						alreadyRequested(me, friend);

						// Check if both users are already friends
						alreadyFriends(me, friend);

						// Check if a reverse request already happened before
						reverseRequest(me, friend)

						friend.pendingFrom.add(myId);
						me.pendingTo.add(friend.id);

						friend.save(function(err) {
							me.save(function(err) {
								// TODO: check for err
								res.json({message: "Successfully posted a friend request"});
							});
						});

					}).catch(requestError);

			}).catch(requestError);
	}
};

