const mongoose = require('mongoose');


const RoomSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'Please add a name'],
		unique: true,
		trim: true,
		maxlength: [50, 'Name can not be more than 50 characters']
	},
	address: {
		type: String,
		required: [true, 'Please add an address']
	},
	telephone: {
		type: String,
		required: [true, 'Please add a telephone number']
	},
	openTime: {
		type: String,
		required: [true, 'Please add an open time']
	},
	closeTime: {
		type: String,
		required: [true, 'Please add a close time']
	}
});

module.exports = mongoose.model('Room', RoomSchema);
