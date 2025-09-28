const User = require("../models/users");
const Message = require("../models/messages");

exports.sendMessage = async(req, res) => {
    try {
        let {name, email, password, recipient, body, phone_number, propertyId } = req.body;
        const user = await User.findById(req.user)
        if(user.id.toString() === recipient) {
            return res.status(400).json({
                message: "you cannot message yourself"
            })
        }
        await Message.create({
          name,
          email,
          password,
          recipient,
          sender: req.user.id,
          phone_number,
          propertyId,
          body,
        });

        res.status(200).json({
            message: 'Message sent successfully'
        })

    } catch (error) {
        res.status(400).json({
            error: error.message
        })
    }
}



exports.getMessages = async (req, res) => {
  try {
let readMessages = await Message.find({
  recipient: req.user.id.toString(),
  read: true
})
  .sort({ createdAt: 1, read: -1 })
  .populate("sender", "name")
  .populate("propertyId", "name")
  .lean();


let unreadMessages = await Message.find({
  recipient: req.user.id.toString(),
  read: false,
})
  .sort({ createdAt: 1, read: -1 })
  .populate("sender", "name")
  .populate("propertyId", "name")
  .lean();

const messages = [...unreadMessages, ...readMessages ]
// const messages = [...readMessages, unreadMessages]
// console.log(readMessages, unreadMessages);
res.status(200).json({
messages
});

  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};



exports.readMessage = async (req, res) => {
  try {

    if(!req.user) {
      return res.json({
        message:'Not authorized'
      })
    }
    let message = await Message.findById(req.params.id).populate(
      "propertyId",
      "name"
    );

    if(!message) {
    return res.json({
      message: "Message not found",
    });
      }
      // let unread = message.read;
      // console.log(unread)
      if(message.read !== true) {
        message.read = true;
        await message.save();
        // return;
      }
    res.status(200).json({
    message
    })
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};


exports.deleteMessage = async (req, res) => {
  // Delete items by IDs
    try {
      const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "No items selected" });
    }
      await Message.deleteMany({ _id: { $in: ids } });
      res.status(200).json({ message: "Message deleted successfully" });
    
      } catch (error) {
      console.error("Error deleting items:", error);
      res.status(500).json({ error: "Failed to delete items" });
    }
  }


exports.markAsRead = async (req, res) => {
  // Delete items by IDs
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "No items selected" });
    }

     const messages = await Message.find({ _id: { $in: ids } });

    // If no messages found, return an error
    if (messages.length === 0) {
      return res.status(404).json({ error: "No messages found" });
    }

    // Update the 'read' field for each message
    for (const message of messages) {
      if (!message.read) {
        message.read = true;
        await message.save(); // Save the updated message
      }
    }

    res.status(200).json({ message: "Message marked as read" });
  } catch (error) {
    console.error("Error deleting items:", error);
    res.status(500).json({ error: "Failed to mark items" });
  }
};


  