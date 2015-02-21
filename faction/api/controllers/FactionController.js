/**
 * FactionController
 *
 * @description :: Server-side logic for managing factions
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	/** TODO: Respond to a faction **/
	respond: function(req, res){
		var userResponding = req.user;
		var userResponse = req.param('userResponse');
		var factionId = req.param('factionId');

		var errFct = function(err) {
			sails.log(err);
			res.status(500).send({error: err});
		}

		Faction
		.findOne({id: factionId})
		.then(function(faction) {
			var actualAnswer = faction.fact;
			// Cannot answer your own faction
			if(faction.sender === req.user.id) {
				res.status(200).send({error: 'Tried to answer your own faction.'});
			}
			else {
				PendingFaction
				.findOne({
					recipient: req.user.id,
					faction: faction.id
				})
				.then(function(pFaction) {
					if(pFaction.answered) {
						res.status(200).send({error: 'You have already answered this faction'});
					} 
					else {
						// Has to be true now
						pFaction.read = true;
						// Increment the right attribute
						console.log('actualAnswer === "true"', actualAnswer === "true");
						console.log('actualAnswer === userResponse', actualAnswer === userResponse);
						
						if(actualAnswer === "true") {
							faction.trueResponses++;
						}
						else {
							faction.falseResponses++;
						}
						// User has answered it now
						pFaction.answered = true;

						pFaction
						.save()
						.then(function(pFaction) {
							faction.save()
							.then(function(faction) {
								if(actualAnswer === userResponse) {
									res.status(200).send({isRight: true});
								} else {
									res.status(200).send({isRight: false});
								}
							})
							.catch(errFct)
						})
						.catch(errFct);
					}
				})
				.catch(errFct);
			}
		})
		.catch(errFct);
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
				.then(function(users) {

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

				var pendingFactions = [];

				recipientIds.forEach(function(recipientId) {
					pendingFactions.push(
						PendingFaction.create({
							recipient: recipientId
						}).then(function(pf) {
							return pf;
						})
					);
				});
				return pendingFactions;

			})
			.spread(function() {
				var pendingFactions = Array.prototype.slice.call(arguments);
				pendingFactionsId = _.pluck(pendingFactions, 'id');
				recipientIds = _.pluck(pendingFactions, 'recipient');

				Faction.create({
					sender: sender.id,
					recipients: recipientIds,
					status: pendingFactionsId,
					comments: [],
					trueResponses: 0,
					falseResponses: 0,
					story: faction,
					fact: fact
				}).exec(function(err, faction) {
					if(err) {
						sails.log(err);
						res.status(500).send(err);
					}
					else {
						res.status(201).send({factionId: faction.id});
					}
				})
			})
			.catch(function(err) {
				sails.log(err);
				res.status(500).send({error: err});
			});
		}
	}
};

