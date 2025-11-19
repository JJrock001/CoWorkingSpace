
const Room = require('../models/Room');

exports.getRooms = async(req, res,next) => {
    try {
        const rooms =await Room.find(req.query);
        console.log(req.query);
        res.status(200).json({ success: true, count: rooms.length, data: rooms });
    } catch (err) {
        res.status(400).json({ success: false });
    }
};
exports.getRoom = async(req, res,next) => {
try {
    const room = await Room.findById(req.params.id);
    if(!room){
        return res.status(404).json({ success: false});
    }
    res.status(200).json({ success: true, data: room });
} catch (err) {
    res.status(400).json({ success: false });
};
};
exports.createRoom = async(req, res,next) => {
    const room = await Room.create(req.body);
    res.status(201).json({ 
        success: true,
        data: room 
    });
};
exports.updateRoom = async(req, res,next) => {
    try {
        const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if(!room){
            return res.status(404).json({ success: false});
        }
        res.status(200).json({ success: true, data: room });
    } catch (err) {
        res.status(400).json({ success: false });
    }
};
exports.deleteRoom = async(req, res,next) => {
    try {
        const room = await Room.findByIdAndDelete(req.params.id);
        if(!room){
            return res.status(404).json({ success: false});
        }
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false });
    }
};