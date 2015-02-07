/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	friends: function(req, res){
		var cb = function(err, user){
			if (err){
				res.status(500).send(err);
			} else {
				var friends = user.friends.map(function(f){return f.username;});
				res.status(200).send({friends: friends});
			}
		}

		var user = User.findOne()
			.where({id : req.user.id})
			.populate('friends')
			.exec(cb);

	},

	search: function(req, res){
		var str = req.param('search');

		if (str) {
			// If string is defined, find usernames that contain that string
			User.find({username : {'contains' : str}}).exec(function(err, users){
				if (err) {
					sails.log(err);
					res.status(500).send(err);
				} else {
					res.status(200).send(users
						.filter(function(u) { return !_.isUndefined(u.username); })
						.map(function(u) { return u.username; }));
				}
			});
		} else {
			// Otherwise return all usernames
			User.find().exec(function (err, users) {
				if (err) {
					sails.log(err);
					res.status(500).send(err);
				} else {
					res.status(200).send(users
						.filter(function(u){ return !_.isUndefined(u.username); })
						.map(function(u){ return u.username;}));
				}
			});
		}
	},

	update: function(req, res){
		if (req.user == null || typeof req.user === undefined){
			res.status(400).send({error: "No user included"});
		}
		else {
			var buildResponse = function(user){

				var factions = user.pendingFactions || [];
				var new_friends = user.newFriends || [];
				var pending_requests = user.pendingFrom || [];
				var response = [];

				factions = factions.map(function(f){ 
											return {
												faction_id : f.id, 
												sender : f.sender,
												story  : f.story,
												fact : f.fact
											}
										});

				new_friends = new_friends.map(function(f){ return f.username; });
				pending_requests = pending_requests.map(function(f){ return f.username; });

				user.pendingFactions.forEach(function(pendingFaction) {
					user.pendingFactions.delete(pendingFaction.id);
				});

				user.newFriends.forEach(function(newFriend) {
					user.newFriends.delete(newFriend.id);
				});

				user.pendingFactions = [];
				user.newFriends = [];
				user.save();

				res.status(200).send({
					factions 		 : factions,
					new_friends 	 : new_friends,
					pending_requests : pending_requests,
					response    	 : response
				});
			};

			User.findOne()
				.where({id : req.user.id})
				.populate('pendingFactions')
				.populate('newFriends')
				.populate('pendingFrom')
				.then(buildResponse)
				.catch(function(err) { res.status(500).send(err) });
		}
	},


	acceptFriendRequest: function(req, res) {

		var friendUsername = req.param('username');
		var accepted = req.param('accepted');
		var myId = req.user.id;

		var addFriendError = function(err) {
			return res.status(500).send(err);
		};

		User.findOne()
			.where({username: friendUsername})
			.populate('friends')
			.populate('newFriends')
			.populate('pendingFrom')
			.populate('pendingTo')
			.then(function(friend) {
				User.findOne()
					.where({id: myId})
					.populate('friends')
					.populate('newFriends')
					.populate('pendingFrom')
					.populate('pendingTo')
					.then(function(me) {

						// Check if user tried adding himself
						if(me.id === friend.id) {
							res.status(200).send({error: 'You cannot add yourself.'});
						}

						// Check if you are already friends with the user
						else if(_.some(me.friends, function(f){return f.id === friend.id})
							&& _.some(friend.friends, function(f){return f.id === me.id})) {
							res.status(200).send({error: 'You are already friends with ' + friend.username})
						}

						// Otherwise proceed and add him to friends
						else {

							me.pendingTo.remove(friend.id);
							friend.pendingFrom.remove(myId);

							if(accepted) {
								me.newFriends.add(friend.id);
								me.friends.add(friend.id);

								friend.newFriends.add(myId);
								friend.friends.add(myId);
								me.save(function(err) {
									friend.save(function(err) {
										res.status(200).send({message: 'Successfully added ' + friend.username + ' to your friends!'});	
									});
								});
							} else {
								me.save(function(err) {
									friend.save(function(err) {
										res.status(200).send({message: 'Successfully removed friend request from ' + friend.username});	
									});
								});
							}
						}
					}).catch(addFriendError);
			}).catch(addFriendError);
	},

	addFriend: function(req, res) {

		var friendUsername = req.param('username');
		var myId = req.user.id;

		var requestError = function(err) {
			res.status(500).send(err);
		};

		var reverseRequest = function(me, friend) {
				
			// Remove pending requests
			friend.pendingTo.remove(me.id);
			me.pendingFrom.remove(friend.id);
			
			// Add ME to friend's friendlist
			friend.friends.add(me.id);
			friend.newFriends.add(myId);

			// Add FRIEND to my friendlist
			me.friends.add(friend.id);
			me.newFriends.add(friend.id);

			// Save changes to database
			friend.save(function(err){
				me.save(function(err) {
					res.status(200).send({message: friend.username + ' already added you, therefore you are now friends'})
				});
			});
		};

		User.findOne()
			.where({username: friendUsername})
			.populate('pendingFrom')
			.populate('pendingTo')
			.populate('friends')
			.populate('newFriends')
			.then(function(friend) {

				User.findOne()
					.where({id: myId})
					.populate('pendingFrom')
					.populate('pendingTo')
					.populate('friends')
					.populate('newFriends')
					.then(function(me) {

						if(me.id === friend.id) {
							res.status(200).send({error: 'You cannot add yourself.'});
						} else {

	 						// Already did a friend request
							if(_.some(friend.pendingFrom, function(f){return f.id === me.id;}) 
								&& _.some(me.pendingTo, function(f){return f.id === friend.id;})) {
								res.status(200).send({error: 'Already posted a request'});
							}

							// Check if both users are already friends
							else if(_.some(friend.friends, function(f){return f.id === me.id;}) 
								&& _.some(me.friends, function(f){return f.id === friend.id;})) {
								res.status(200).send({error: 'You are already friends with ' + friend.username + '!'});
							}

							// Check if a friend request already happened before from the friend
							else if(_.some(friend.pendingTo, function(f){return f.id === me.id;})) {
								reverseRequest(me, friend)
							}
						
							else {
								friend.pendingFrom.add(myId);
								me.pendingTo.add(friend.id);

								friend.save(function(err) {
									if(err) {
										res.status(500).send(err);
									} else {
										me.save(function(err) {
											if(err) {
												res.status(500).send(err);
											} else {
												res.status(200).send({message: "Successfully posted a friend request"});
											}
										});
									}
								});
							}
						}

					}).catch(requestError);

			}).catch(requestError);
	}
};

