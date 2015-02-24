/**
 * FactionController
 *
 * @description :: Server-side logic for managing factions
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	respond: function(req, res){

		var errFct = function(err) {
			res.status(500).send(Message.createError(err));
		}

		var userResponding = req.user;
		var userResponse = req.param('userResponse');
		var factionId = req.param('factionId');

		if(_.isUndefined(userResponse)) {
			res.status(400).send(Message.createError('You need to provide a response'));
		}
		else if(!factionId) {
			res.status(400).send(Message.createError('You need to provide a faction id'));
		} 
		else {
			Faction
			.findOne({id: factionId})
			.then(function(faction) {
				var actualAnswer = faction.fact;
				// Cannot answer your own faction
				if(faction.sender === req.user.id) {
					res.status(400).send(Message.createError('Tried to answer your own faction.'));
				}
				else {
					PendingFaction
					.findOne({
						recipient: req.user.id,
						faction: faction.id
					})
					.then(function(pFaction) {
						if(pFaction.answered) {
							res.status(400).send(Message.createError('You have already answered this faction'));
						} 
						else {
							// Has to be true now
							pFaction.read = true;

							// Increment the right attribute according to user's response
							if(userResponse) {
								faction.trueResponses++;
							}
							else {
								faction.falseResponses++;
							}
							// User has answered it now
							pFaction.answered = true;

							pFaction.save()
							.then(function(pFaction) {
								faction.save()
								.then(function(faction) {
									if(actualAnswer === userResponse) {
										res.status(200).send(Message.createSuccess('Successfully responded to the faction', {isRight: true}));
									} else {
										res.status(200).send(Message.createSuccess('Successfully responded to the faction', {isRight: false}));
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
		}
	},

	/** Creation of a faction **/
	create: function(req, res){

		var sender = req.user;

		var to = req.param('to');
		var faction = req.param('faction');
		var fact = req.param('fact');
		var recipientIds = [];

		var errFct = function(err) {
			res.status(500).send(Message.createError(err));
		}

		if (!sender){
			res.status(400).send(Message.createError("No sender included"));
		}

		else if (_.isUndefined(fact)){
			res.status(400).send(Message.createError("No fact sent"));
		}

		else if (!faction){
			res.status(400).send(Message.createError("No faction sent"));
		}

		else if (!to || to.length === 0){
			res.status(400).send(Message.createError("No recipients sent"));
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
					res.status(400).send(Message.createError("No valid recipients sent"));
				} else {
					var pendingFactions = [];

					recipientIds.forEach(function(recipientId) {
						pendingFactions.push(
							PendingFaction.create({
								recipient: recipientId
							})
							.then(_.identity)
							.catch(errFct)
						);
					});
					return pendingFactions;
				}

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
				})
				.then(function(faction) {
					res.status(201).send(Message.createSuccess('Successfully sent the faction', {factionId: faction.id}));
				})
				.catch(errFct)
			})
			.catch(errFct);
		}
	}
};

