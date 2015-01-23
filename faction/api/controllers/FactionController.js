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

		if (fact == null || to == undefined){
			res.status(400).send("No fact sent");}

		if (faction == null || faction == undefined){
			res.status(400).send("No faction sent");}

		if (to == null || to
		 == undefined || to.length == 0 ){
			res.status(400).send("No recipients sent");}

		to.forEach(function(r){
			User.findOne()
				.where({username : r})
				.populate('pendingFactions')
				.then(function(p){
					if (p.friends.indexOf(sender.id) != -1)
						recipients.push(p);})})

		if (recipients.length == 0){
			res.status(400).send("No valid recipients sent");
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
					user.pendingFactions.push(faction.id);
					user.save(); })
				res.status(201).send();	
			} else {
				res.status(500).send(err);
			}
		});


	}
};

