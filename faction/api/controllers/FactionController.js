/**
 * FactionController
 *
 * @description :: Server-side logic for managing factions
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	deleteFaction: function(req, res){
		var factionId = req.param('factionId');

		if (!factionId){
			res.status(400).send(Message.createError('You need to provide a faction id'));
		} else {
			var userId = req.user.id;

			Faction
			.findOne({id: factionId})
			.populate('deletedBy')
			.then(function(faction){
				if (_.all(faction.deletedBy, function(u){return u.id != userId; })){
					faction.deletedBy.add(req.user);
					faction.save().then(function(updatedFaction){
						res.status(200).send(Message.createSuccess('Successfully deleted faction ' + factionId, {}));
					}).catch( function(err){res.status(500).send(Message.createError(err)); });
				} else {
					res.status(200).send(Message.createSuccess('Successfully deleted faction ' + factionId, {}));
				}
			})
			.catch(function(err){ res.status(500).send(Message.createError(err)); })
		}
	},

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
							pFaction.answeredAt = new Date();
							pFaction.response = userResponse;

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
		var commentsEnabled = req.param('commentsEnabled');
		if (_.isUndefined(commentsEnabled))	{
			commentsEnabled = true;
		}	
		var recipientIds = [];

		var errFct = function(err) {
			res.status(500).send(Message.createError(err));
		}

		if (!sender){
			return res.status(400).send(Message.createError("No sender included"));
		}

		if (_.isUndefined(fact)){
			return res.status(400).send(Message.createError("No fact sent"));
		}

		if (!faction){
			return res.status(400).send(Message.createError("No faction sent"));
		}

		if (!to || to.length === 0){
			return res.status(400).send(Message.createError("No recipients sent"));
		}


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
				return res.status(400).send(Message.createError("No valid recipients sent"));
			} 
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
				fact: fact,
				commentsEnabled: commentsEnabled
			})
			.then(function(faction) {

					res.status(201).send(Message.createSuccess('Successfully sent the faction without an image', {
						factionId: faction.id,
						createdAt: faction.createdAt
					}));
			})
			.catch(errFct)
		})
		.catch(errFct);
	},

	getImage: function(req, res) {
		var factionId = req.param('factionId');
		var fileName = req.param('name');

		var SkipperDisk = require('skipper-disk');
	    var fileAdapter = SkipperDisk(/* optional opts */);

	    // TODO: do checks on fileName

	    var fd = sails.config.appPath + '/images/' + factionId + '/' + fileName;

	    fileAdapter.read(fd)
	    .on('error', function(err) {
	    	res.status(500).send(Message.createError(err));
	    })
	    .pipe(res);
	},

	uploadImage: function(req, res) {

		var factionId = req.param('factionId');
		var image = req.file('image');

		if(!factionId) {
			return res.status(400).send(Message.createError("No factionId sent"));
		}

		if(!image) {
			return res.status(400).send(Message.createError("No image sent"));
		}

		Faction.findOne({id: factionId})
		.then(function(faction) {
			
			if(!faction) {
				return res.status(400).send(Message.createError('Invalid faction id sent'));
			}

			if(faction.sender !== req.user.id) {
				return res.status(400).send(Message.createError('You are not the'));
			}

			if(faction.imageUrl) {
				return res.status(400).send(Message.createError('There already is an image associated with this faction'));
			}

			req.file('image').upload({
				dirname: require('path').resolve(sails.config.appPath, 'images/' + faction.id),
				maxBytes: 10000000 // 10 MB
			}, function whenDone(err, uploadedFiles) {
				if (err) {
			    	return res.status(500).send(Message.createError(err));
			    }

			    // If no files were uploaded, respond with an error.
			    if (uploadedFiles.length === 0){
			    	return res.status(400).send(Message.createError('No file was uploaded'));
			    }

		    	// TODO: check that the file is actually an image
		    	//			 with uploadedFiles[0].type

		    	var fd = uploadedFiles[0].fd;
		    	var fileName = fd.substring(fd.lastIndexOf('/') + 1);

		    	faction.imageUrl = 'images/' + faction.id + '/' + fileName;

		    	faction.save()
		    	.then(function(f) {
		    		res.status(201).send(Message.createSuccess('Successfully uploaded the image'));
		    	})
				.catch(function(err) {
					res.status(500).send(Message.createError(err));
				})
			})
		})
		.catch(function(err) {
			res.status(500).send(Message.createError(err));
		})


	}
};

















