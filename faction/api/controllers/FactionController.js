/**
 * FactionController
 *
 * @description :: Server-side logic for managing factions
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	/** TODO: Respond to a faction **/
	respond: function(req, res){
		// 501 is http code for not implemented
		return res.status(501).send({message: 'Not implemented'});
	},

	/** Creation of a faction **/
	create: function(req, res){

		var printFriends = function(user) {
			User.findOne({username: user.username})
				.populate("friends")
				.then(function(user) {console.log(user.username + " -> " + user.friends.map(function(friend){return friend.username;}) + "\n")})
				.catch(function(err) {console.log("gg")});
		};

		var sender = req.user;

		var to = req.param('to');
		var faction = req.param('faction');
		var fact = req.param('fact');
		var recipients = [];

		if (!sender){
			res.status(400).send({error: "No sender included"});
		}

		else if (!fact){
			res.status(400).send({error: "No fact sent"});
		}

		else if (!faction){
			res.status(400).send({error: "No faction sent"});
		}

		else if (!to || to.length === 0){
			res.status(400).send({error: "No recipients sent"});
		}

		else {

			User.find({username: to})
				.populate('friends')
				.exec(function(err, users) {
				
				if(err) {
					res.status(500).send({error: "failure"});
				}

				console.log("START:\n");
				users.forEach(printFriends);

				// Verify if recipient and sender are friends
				users.forEach(function(user) {
					if (_.some(user.friends, function(friend){ return friend.id === sender.id; })){
						recipients.push(user); 
					}
				});

				console.log("AFTER FRIEND CHECK:\n");
				recipients.forEach(printFriends);

				if(recipients.length === 0) {
					res.status(400).send({error: "No valid recipients sent"});
				}


				var actual_fact = false; // default value, TODO: Check this

				if(fact === "true") {
					actual_fact = true;
				}

				Faction.create({
					sender : sender,
					recipients : recipients,
					comments : [],
					trueResponses : 0,
					falseResponses : 0,
					story : faction,
					fact : actual_fact
				}, function(err, faction) {
					if (err){	
						res.status(500).send(err); 
					} else {

						console.log("FACTION CREATE:\n");
						users.forEach(printFriends);

						var counter = 0;

						recipients.forEach(function(user){
							user.pendingFactions.add(faction);
							user.factionsReceived.add(faction);
							user.save(function(err) {
								if(err) {
									res.status(500).send(err);
								}
								console.log("STEP " + counter + "\n");
								recipients.forEach(printFriends);
								counter++;
							});
						});

						console.log("Leaving with 201\n");
						recipients.forEach(printFriends);
						res.status(201).send({message: 'Faction successfully sent.'});
					}
				});

			});
		}
	}
};

