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

		if (!sender){
			res.status(400).send({error: "No sender included"});
		}
			
		var to = req.param('to');
		var faction = req.param('faction');
		var fact = req.param('fact');
		var recipients = [];

		if (!fact){
			res.status(400).send({error: "No fact sent"});
		}

		if (!faction){
			res.status(400).send({error: "No faction sent"});
		}

		if (!to || to.length === 0){
			res.status(400).send({error: "No recipients sent"});
		}

		User.find({username: to}).exec(function(err, users) {
			
			if(err) {
				return res.status(500).send({error: "failure"});
			}

			// Verify if recipient and sender are friends
			users.forEach(function(user) {
				if (_.some(user.friends, function(friend){ return friend.id === sender.id; })){
					recipients.push(p); 
				}
			});

			if(recipients.length === 0) {
				return res.status(400).send({error: "No valid recipients sent"});
			}

			Faction.create({
				sender : sender,
				recipients : recipients,
				comments : [],
				trueResponses : 0,
				falseResponses : 0,
				story : faction,
				fact : fact ? true : false  // Default to story being fiction (TODO: change?)
			}, function(err, faction){
				if (!err){	
					recipients.forEach(function(user){
						user.pendingFactions.add(faction);
						user.save(); 
					})
					return res.status(201).send({message: 'Faction successfully sent.'});	
				} else {
					sails.log(err);
					return res.status(500).send(err);
				}
			});

		});

		


	}
};

