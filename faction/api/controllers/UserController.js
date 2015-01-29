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

		var acceptFriend = function(err, friend) {
			if(err) {
				//next(err)
			}
			if(accepted) {
				// add to friends
				friend.new_friends.push(myId);
				friend.friends.push(myId);
			}

			User.findOne({id: myId})
				.exec(acceptMe);

			// If accepted or not, remove the ID from pendingFrom
			var deleteId = friend.pendingFrom.indexOf(myID)
			delete friend.pendingFrom[deleteId];
			friend.save(function(err) {});
		};

		var acceptMe = function(err, me) {
			if(err) {
				// next(err)
			}
			if(accepted) {
				me.new_friends.push(friend.id);
				me.friends.push(friend.id);
			}

			// If accepted or not, remove the ID from pendingFrom
			var deleteId = me.pendingTo.indexOf(friend.id)
			delete me.pendingTo[deleteId];
			me.save(function(err) {});
		};

		User.findOne({username: friendUsername})
			.exec(acceptFriend);

	},

	addFriend: function(req, res) {

		var friendUsername = req.param('username');
		var myId = req.user.id;

		User.findOne({username: friendUsername})
			.exec(function(err, friend){
				if(err) {
					// next(err);
				}

				friend.pendingFrom.push(myId);
				friend.save(function(err) {});

				User.findOne({id: myID})
					.exec(function(err, me){
						if(err) {
							// next(err);
						}
						me.pendingTo.push(friend.id);
						me.save(function(err) {});
					});
			});
	}
};

