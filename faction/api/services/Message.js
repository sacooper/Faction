

module.exports = {

	createSuccess: function(message, data) {		
		return {
			message: message,
			data: data
		};
	},

	createError: function(err) {
		sails.log(err);
		return {
			error: err
		}
	}

}