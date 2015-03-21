/**
 * CommentController
 *
 * @description :: Server-side logic for managing comments
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	
	addComment: function(req, res) {
		var factionId = req.param('factionId');
		var content = req.param('content');

		if(!factionId) {
			return res.status(400).send(Message.createError('No faction Id sent'));
		} 
		if (!content || !content.replace(/\s/g, '').length) {
			return res.status(400).send(Message.createError('No content sent'));
		} 
		if (content.length > 1000) {
			return res.status(400).send(Message.createError('Content is too big'));
		}

		User.findOne({id: req.user.id})
		.then(function(user) {
			
			var username = user.username;

			Faction.findOne({id: factionId})
			.populate('recipients')
			.populate('sender')
			.populate('comments')
			.then(function(faction) {
				if(!faction) {
					return res.status(400).send(Message.createError('Invalid faction Id sent'));
				} 

				if(!faction.commentsEnabled) {
					return res.status(400).send(Message.createError('Comments are disabled'));
				}

				var recipientsUsernames = _.pluck(faction.recipients, 'username');
				var containsUsername = _.some(recipientsUsernames, function(u) { return u === username; });
				if(!(username === faction.sender.username || containsUsername)) {
					return res.status(400).send(Message.createError('Username is invalid. Username not part of recipients or is not the sender'));
				}
				Comment.create({
					commenter: req.user.id,
					faction: faction.id,
					content: content
				})
				.then(function(comment) {
					faction.comments.add(comment.id);
					faction.save()
					.then(function(f) {
						res.status(201).send(Message.createSuccess('Successfully posted a comment', 
							{ 
								commentId: comment.id,
								createdAt: comment.createdAt
							}
						));
					})
					.catch(function(err) {
						res.status(500).send(Message.createError(err));
					});
				})
				.catch(function(err) {
					res.status(500).send(Message.createError(err));
				});
			})
			.catch(function (err) {
				res.status(500).send(Message.createError(err));
			});
		})
		.catch(function(err) {
			res.status(500).send(Message.createError(err));
		})

	},

	enableComment: function(req, res) {
		var factionId = req.param('factionId');
		var enabled = req.param('enabled');

		if(!factionId) {
			return res.status(400).send(Message.createError('No faction Id sent'));
		}
		if(_.isUndefined(enabled)) {
			return res.status(400).send(Message.createError('No enabled boolean sent'));
		}

		Faction.findOne({id: factionId})
		.then(function(faction) {
			if(!faction) {
				return res.status(400).send(Message.createError('Invalid faction Id sent'));
			}
			if(req.user.id !== faction.sender) {
				return res.status(400).send(Message.createError('You are not the sender of this faction'));
			}
			faction.commentsEnabled = enabled;

			faction.save()
			.then(function(faction) {
				if(enabled) {
					res.status(200).send(Message.createSuccess('Successfully enabled comments in faction with id: ' + faction.id));
				} else {
					res.status(200).send(Message.createSuccess('Successfully disabled comments in faction with id: ' + faction.id));
				}
			})
			.catch(function(err) {
				res.status(500).send(Message.createError(err));
			});
		})
		.catch(function(err) {
			res.status(500).send(Message.createError(err));
		});
	}

};



