/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	update: function(req, res){
		if (req.user == null || req.user == undefined){
			req.status(400).send("No user included")
		}

		var buildResponse = function(err, user){

		};

		var user = User.findOne()
					.where({id : req.user.id})
					.populate('pendingFactions')
					.populate('pendingFrom')
					.exec(buildResponse)

	}
};

