/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

	getAllInfo: function(req, res) {
		var userId = req.user.id;

		User.findOne()
			.where({id: req.user.id})
			.populate("friends")
			.populate("factionsReceived")
			.populate("factions")
			.then(function(me) {

				var senderIds = me.factionsReceived.map(function(f){ return f.sender; });

				User.find({id: senderIds})
					.exec(function(err, users) {
						if(err) {
							sails.log(err);
							res.status(500).send(err);
						} else {
							users.forEach(function(user) {
								me.factionsReceived.forEach(function(faction) {
									if(user.id === faction.sender) {
										faction.sender = user.username;
									}
								})
							});
							res.status(200).send(
								{
									username: me.username,
									factionsSent: me.factions.map(function(faction) {
										return {
											sender: faction.sender,
											story: faction.story,
											fact: faction.fact,
											id: faction.id
										}
									}),
									factionsReceived: me.factionsReceived.map(function(faction) {
										return {
											sender: faction.sender,
											story: faction.story,
											fact: faction.fact,
											id: faction.id
										}
									}),
									friends: me.friends.map(function(user){return user.username;})
								}
							);
						}
					});

			})
			.catch(function(err){
				sails.log(err);
				res.status(500).send(err);
			});
	},

	factions: function(req, res) {
		var userId = req.user.id;

		User.findOne()
			.where({id: req.user.id})
			.populate("factionsReceived")
			.populate("factions")
			.then(function(me) {

				var senderIds = me.factionsReceived.map(function(f){ return f.sender; });

				User.find({id: senderIds})
					.exec(function(err, users) {
						if(err) {
							sails.log(err);
							res.status(500).send(err);
						} else {
							users.forEach(function(user) {
								me.factionsReceived.forEach(function(faction) {
									if(user.id === faction.sender) {
										faction.sender = user.username;
									}
								})
							});
				
							res.status(200).send(
								{
									sent: me.factions.map(function(faction) {
										return {
											sender: faction.sender,
											story: faction.story,
											fact: faction.fact,
											id: faction.id
										}
									}),
									received: me.factionsReceived.map(function(faction) {
										return {
											sender: faction.sender,
											story: faction.story,
											fact: faction.fact,
											id: faction.id
										}
									})
								}
							);
						}
					});
			})
			.catch(function(err){
				sails.log(err);
				res.status(500).send(err);
			});
	},

	friends: function(req, res){
		var cb = function(err, user){
			if (err){
				sails.log(err);
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

				// Get initial values
				var pending_factions = user.pendingFactions || [];
				var new_friends = user.newFriends || [];
				var pending_requests = user.pendingFrom || [];
				var response = [];

				// Map only important attributes
				pending_factions = pending_factions.map(function(f){ 
											return {
												faction_id : f.id, 
												sender : f.sender,
												story  : f.story,
												fact : f.fact
											}
										});

				// Map only the username
				new_friends = new_friends.map(function(f){ return f.username; });
				pending_requests = pending_requests.map(function(f){ return f.username; });

				// Delete pendingFactions (the ones that weren't seen before)
				user.pendingFactions.forEach(function(pendingFaction) {
					user.pendingFactions.remove(pendingFaction.id);
				});

				// Delete "newFriends", now that we've noticed the user he's now friends with him
				user.newFriends.forEach(function(newFriend) {
					user.newFriends.remove(newFriend.id);
				});

				// TODO SPRINT 2: RESPONSE

				user.save(function(err, user) {
					if(err) {
						sails.log(err);
						res.status(500).send(err);
					} else {
						res.status(200).send({
							factions 		 : pending_factions,
							new_friends 	 : new_friends,
							pending_requests : pending_requests,
							response    	 : response
						});
					}
				});
			};

			User.findOne()
				.where({id : req.user.id})
				.populate('pendingFactions')
				.populate('newFriends')
				.populate('pendingFrom')
				.then(buildResponse)
				.catch(function(err) { 
					sails.log(err);
					res.status(500).send(err); });
		}
	},


	acceptFriendRequest: function(req, res) {

		var friendUsername = req.param('username');
		var accepted = req.param('accepted');
		var myId = req.user.id;

		var addFriendError = function(err) {
			sails.log(err);
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

							friend.pendingTo.remove(myId);
							me.pendingFrom.remove(friend.id);

							if(accepted === "true") {
								me.newFriends.add(friend.id);
								me.friends.add(friend.id);

								friend.newFriends.add(myId);
								friend.friends.add(myId);
								me.save(function(err, user) {
									if(err) {
										sails.log(err);
										res.status(500).send(err);
									} else {
										friend.save(function(err, user) {
											if(err) {
												sails.log(err);
												res.status(500).send(err);
											} else {
												res.status(200).send({message: 'Successfully added ' + friend.username + ' to your friends!'});	
											}
										});
									}
								});
							} else {
								me.save(function(err, user) {
									if(err) {
										sails.log(err);
										res.status(500).send(err);
									} else {
										friend.save(function(err, user) {
											if(err) {
												sails.log(err);
												res.status(500).send(err);
											} else {
												res.status(200).send({message: 'Successfully removed friend request from ' + friend.username});	
											}
										});
									}
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
			sails.log(err);
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
			friend.save(function(err, user){
				if(err) {
					sails.log(err);
					res.status(500).send(err);
				} else {
					me.save(function(err) {
						if(err) {
							sails.log(err);
							res.status(500).send(err);
						} else {
							res.status(200).send({message: friend.username + ' already added you, therefore you are now friends'});
						}
					});
				}
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
										sails.log(err);
										res.status(500).send(err);
									} else {
										me.save(function(err) {
											if(err) {
												sails.log(err);
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

