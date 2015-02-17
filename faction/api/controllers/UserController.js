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
			.populate("pendingReceivedRequests")
			.populate("newFriends")
			.populate("factionsReceived")
			.populate("factionsSent")
			.populate("pendingFactions")
			.then(function(me) {

				// Ids of pending friend request users
				var pendingReceivedRequestsIds = me.pendingReceivedRequests.map(function(f) {return f.recipient; });

				// Ids of the new friends recently made
				var newFriendsIds = me.newFriends.map(function(f){ return f.newFriend; });

				// Ids of the factions Received
				var factionReceivedIds = me.factionsReceived.map(function(f){ return f.id; });
			
				// Ids of the factions Sent
				var factionSentIds = me.factionsSent.map(function(f){ return f.id; });
				
				// Ids of the pending factions
				var factionIds = me.pendingFactions.map(function(f){ return f.faction; });

				// Array of friend username
				var friends = _.pluck(me.friends, 'username');

				var pendingUsers = User.find({
						id: pendingReceivedRequestsIds
					}).then(function(pendingFriend) {
						return pendingFriend;
					});

				var newFriends = User.find({
						id: newFriendsIds
					}).then(function(newFriends) {
						return newFriends;
					});

				var factionsReceived = Faction.find({
						id: factionReceivedIds
					})
					.populate('sender')
					.then(function(factionsReceived) {
						return factionsReceived;
					});

				var factionsSent = Faction.find({
						id: factionSentIds
					})
					.populate('sender')
					.then(function(factionsSent) {
						return factionsSent;
					});

				var pendingFactions = Faction.find({
						id: factionIds
					})
					.populate('sender')
					.then(function(pendingFactions) {
						return pendingFactions;
					});

				// TODO:
				var responses = [];

				// FIXME: toString? defaultsTo in model?
				var updateTimestamp = me.lastUpdate;

				return [friends, pendingUsers, newFriends, 
							factionsReceived, factionsSent, pendingFactions,
							responses, updateTimestamp];

			})
			.spread(function(friends, pendingUsers, newFriends, 
								factionsReceived, factionsSent, pendingFactions,
								responses, updateTimestamp) {

				console.log(friends);
				console.log(pendingUsers);
				console.log(newFriends);
				console.log(factionsReceived);
				console.log(factionsSent);
				console.log(pendingFactions);
				console.log(responses);
				console.log(updateTimestamp);
				res.status(200).send("got here");
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
			.populate("factionsSent")
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

		User.findFriends(req.user, cb);
	},

	search: function(req, res){
		var str = req.param('search') || "";

		var next = function(err, users){
			if (err) {
				sails.log(err);
				res.status(500).send(err);
			} else {
				res.status(200).send(users
					.filter(function(u) { return !_.isUndefined(u.username); })
					.map(function(u) { return u.username; }));
			}
		};

		User.search(str, next);
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

		// Get all friend information
		// Spread
		// Get all my information
		// Spread
		// Save appropriate models accordingly

		User.findOne()
			.where({username: friendUsername})
			.populate('pendingReceivedRequests')
			.populate('pendingSentRequests')
			.populate('friends')
			.populate('newFriends')
			.then(function(friend) {

				// Get all friend information and spread it

				var friendReceivedFromUsers = User.find({
					id: _.pluck(friend.pendingReceivedRequests, 'sender')
				}).then(function(users){
					return users;
				});

				var friendSentToUsers = User.find({
					id: _.pluck(friend.pendingSentRequests, 'recipient')
				}).then(function(users){
					return users;
				})

				return [friend, friendReceivedFromUsers, friendSentToUsers];

			})
			.spread(function(friend, friendReceivedFromUsers, friendSentToUsers) {
				User.findOne()
					.where({id: myId})
					.populate('pendingReceivedRequests')
					.populate('pendingSentRequests')
					.populate('friends')
					.populate('newFriends')
					.then(function(me) {

						// Get all my information and spread it

						var meReceivedFromUsers = User.find({
							id: _.pluck(me.pendingReceivedRequests, 'sender')
						}).then(function(users){
							return users;
						});

						var meSentToUsers = User.find({
							id: _.pluck(me.pendingSentRequests, 'recipient')
						}).then(function(users){
							return users;
						})

						return [friend, friendReceivedFromUsers, friendSentToUsers,
								me, meReceivedFromUsers, meSentToUsers];

					})
					.spread(function(friend, friendReceivedFromUsers, friendSentToUsers,
								me, meReceivedFromUsers, meSentToUsers) {
							
							console.log(friend);
							console.log(friendReceivedFromUsers);
							console.log(friendSentToUsers);
							console.log(me);
							console.log(meReceivedFromUsers);
							console.log(meSentToUsers);
							res.status(200).send('got here');

							if(me.id === friend.id) {
								res.status(200).send({error: 'You cannot add yourself.'});
							}
						// logic happens here

					}).catch(requestError);
			}).catch(requestError);

		User.findOne()
			.where({username: friendUsername})
			.populate('pendingReceivedRequests')
			.populate('pendingSentRequests')
			.populate('friends')
			.populate('newFriends')
			.then(function(friend) {

				User.findOne()
					.where({id: myId})
					.populate('pendingReceivedRequests')
					.populate('pendingSentRequests')
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

