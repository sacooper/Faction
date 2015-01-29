/**
 * FactionController
 *
 * @description :: Server-side logic for managing factions
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	/** TODO: Respond to a faction **/
	respond: function(req, res){
		res.status(200)
	},


	/** Creation of a faction **/
	create: function(req, res){
		var sender = req.user;

		if (sender == null || sender == undefined){
			res.status(400).send("No sender included");}
			
		var to = req.param('to');
		var faction = req.param('faction');
		var fact = req.param('fact');
		var recipients = [];

		if (fact == null || to == undefined){
			res.status(400).send("No fact sent");}

		if (faction == null || faction == undefined){
			res.status(400).send("No faction sent");}

		if (to == null || to == undefined || to.length == 0 ){
			res.status(400).send("No recipients sent");}

		to.forEach(function(r){
			User.findOne()
				.where({username : r})
				.populate('pendingFactions')
				.populate('factionsReceived')
				.populate('friends')
				.exec(function(err, p){
					// console.log('P\n', p);
					// p.friends.add(sender);
					// p.save(function(err, p2){
					// 	console.log("P2\n", p2, "err", err);
					// 	;
					// 	p.friends.remove(sender.id);
					// 	p.save(function(err, p3){
					// 		console.log("P3\n", p3);
					// 	})
					// })
					if (err){
						sails.log(err);
						return res.status(500).send(err)
					};

					if (_.some(p.friends, function(f){return f.id == sender.id;})){
						recipients.push(p); }})})

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
					user.pendingFactions.add(faction);
					user.save(); })
				res.status(201).send();	
			} else {
				sails.log(err);
				res.status(500).send(err);
			}
		});


	}
};

