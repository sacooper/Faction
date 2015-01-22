/**
 * FactionController
 *
 * @description :: Server-side logic for managing factions
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	/** Creation of a faction **/
	create: function(req, res){
		var to = req.param('to');
		var faction = req.param('faction');
		var fact = req.param('fact');
		var sender = req.user;
		var recipients = [];

		to.forEach(function(r){
			User.findOne()
				.where({username : r})
				.then(function(p){
					if (p.friends.indexOf(sender) != -1)
						recipients.push(p);})})

		Faction.create({
			sender : sender,
			recipients : recipients,
			comments : [],
			trueResponses : 0,
			falseResponses : 0,
			story : faction,
			fact : fact
		}, function(err, faction){
			if (!err){	
				recipients.forEach(function(user){
					user.pendingFactions.push(faction);
					user.save()
				})	
			}
		}));


	}
};

