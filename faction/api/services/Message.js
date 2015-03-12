

module.exports = {

	createSuccess: function(message, data) {
		var theData = data;
		if(!theData) {
			theData = {}
		}		
		return {
			message: message,
			data: theData
		};
	},

	createError: function(err) {
		sails.log(err);
		return {
			error: err
		}
	}

}