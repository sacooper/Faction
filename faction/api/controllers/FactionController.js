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

		var sender = req.user;

		var to = req.param('to');
		var faction = req.param('faction');
		var fact = req.param('fact');
		var recipientIds = [];

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
					console.log(err);
					res.status(500).send({error: "failure"});
				}

				// Verify if recipient and sender are friends
				users.forEach(function(user) {
					if (_.some(user.friends, function(friend){ return friend.id === sender.id; })){
						recipientIds.push(user.id); 
					}
				});

				if(recipientIds.length === 0) {
					res.status(400).send({error: "No valid recipients sent"});
				}


				var actual_fact = false; // default value, TODO: Check this

				if(fact === "true") {
					actual_fact = true;
				}

				Faction.create({
					sender : sender.id,
					recipients : recipientIds,
					unreadBy: recipientIds,
					comments : [],
					trueResponses : 0,
					falseResponses : 0,
					story : faction,
					fact : actual_fact
				}).exec(function(err, faction) {
					if (err){	
						console.log(err);
						res.status(500).send(err); 
					} else {
						res.status(201).send({message: 'Faction successfully sent.'});
					}
				});

			});
		}
	}
};

