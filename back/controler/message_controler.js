import Conversation from "../models/convo.js";

export const sendMessage = async (req, res) => {
   
    try {
        const { message } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id; //current logged in user will send message

        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        })
        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId],

            });
            const newMessage = new Message({
                senderId,
                receiverId,
                message,
            });
            if(newMessage) {
            
               conversation.messages.push(newMessage._id);
               await conversation.save();
               res.status(201).json({ message: "Message sent successfully"});
            }
            await Promise.all([conversation.save(),newMessage.save() ]);
            res.status(201).json({ message: "Message sent successfully",newMessage});
        }

    } catch (error) {
        console.log("Error in sending message" + error);
        res.status(500).json({ message: "Internal server error " });

    }
}

export const getMessage = async(req,res) => {
    try {
        const { id: chatuser } = req.params;
        const senderId = req.user._id; 
        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, chatuser] },
        }).populate("message"); // id ka msg show krne k lie likha hai
        if(!conversation) {
            return res.status(201).json({ message: "no message found"});
        }
        const messages = conversation.messages;
        res.status(201).json({ messages });
        
    } catch (error) {
        console.log("error in getting message" +error);
        res.status(500).json({ message: "Internal server error " });
    }
}