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

		};

		var user = User.findOne()
					.where({id : req.user.id})
					.populate('pendingFactions')
					.populate('pendingFrom')
					.exec(buildResponse)

	},


	acceptFriendRequest: function(req, res) {

		var friendUsername = req.param('username');
		var accepted = req.param('accepted');
		var myId = req.user.id;

		var addFriendError = function(err) {
			res.json({error: 'Could not add new friend'})
		};

		User.findOne()
			.where({username: friendUsername})
			.populate('friends')
			.populate('newFriends')
			.populate('pendingFrom')
			.then(function(friend) {

				// TODO: check if there's a request
				// TODO: check if they are already friends
				if(accepted) {
					// add to friends
					friend.newFriends.add(myId);
					friend.friends.add(myId);
				}
				friend.pendingFrom.remove(myId);
				friend.save(function(err) {
					User.findOne()
						.where({id: myId})
						.populate('friends')
						.populate('newFriends')
						.populate('pendingTo')
						.then(function(me) {
							if(accepted) {
								me.newFriends.add(friend.id);
								me.friends.add(friend.id);
							}
							me.pendingTo.remove(friend.id)
							me.save(function(err) {
								res.json({message: 'Successfully added ' + friend.username});
							});
					}).catch(addFriendError);
				});
			}).catch(addFriendError);

	},

	addFriend: function(req, res) {

		var requestError = function(err) {
			res.json({error: "Error in posting the request."});
		};

		var alreadyRequested = function(me, friend) {
			if(friend.pendingFrom.indexOf(me.id) !== -1 
				&& me.pendingTo.indexOf(friend.id) !== -1) {
				res.json({error: 'Already posted a request'})
			}
		}

		var alreadyFriends = function(me, friend) {
			if(friend.friends.indexOf(me.id) !== -1 
				&& me.friends.indexOf(friend.id) !== -1) {
				res.json({error: 'Already friends with' + friend.username})
			}
		}

		var reverseRequest = function(me, friend) {
			if(_.some(friend.pendingTo, function(f){return f.id == me.id;})
				&& _.some(me.pendingFrom, function(f){return f.id == friend.id;})) {
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
		}

		var friendUsername = req.param('username');
		var myId = req.user.id;

		User.findOne()
			.where({username: friendUsername})
			.populate('pendingFrom')
			.populate('friends')
			.populate('newFriends')
			.then(function(friend){
				User.findOne()
					.where({id: myId})
					.populate('pendingTo')
					.popupate('friends')
					.populate('newFriends')
					.then(function(me){
 
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

