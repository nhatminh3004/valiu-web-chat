const mongoose = require("mongoose");
const messageModel = require("../model/messageModel");

module.exports.addMessage = async (req, res, next) => {
  try {
    const { from, to, message } = req.body;
    const data = await messageModel.create({
      message: { text: message },
      users: [from, to],
      sender: from,
    });
    if (data) return res.json({ msg: "Message added successfuly." });
    return res.json({ msg: "Failed to add message to the database" });
  } catch (error) {
    next(error);
  }
};
module.exports.getAllMessage = async (req, res, next) => {
  try {
    const { from, to } = req.body;
    const messages = await messageModel
      .find({
        users: {
          $all: [from, to],
        },
      })
      .sort({ updatedAt: 1 });
    const projectMessages = messages.map((msg) => {
      return {
        fromSelf: msg.sender.toString() === from,
        message: msg.message.text,
      };
    });
    res.json(projectMessages);
  } catch (error) {
    next(error);
  }
};

module.exports.getMyConversations = async (req, res, next) => {
  try {
    const id = req.params.id;
    const conversations = await messageModel.aggregate([
      {
        $match: {
          users: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $sort: {
          updatedAt: -1,
        },
      },
      {
        $group: {
          _id: "$users",
          message: { $first: "$$ROOT" },
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "message.users",
          foreignField: "_id",
          as: "user_info",
        },
      },
      {
        $sort: {
          "message.updatedAt": -1,
        },
      },
    ]);
    var result = [];
    conversations.map((conversation, index) => {
      if (result.length === 0) {
        result = [...result, conversation];
      } else {
        for (var i = 0; i < result.length; i++) {
          if (conversation === result[i]) {
            continue;
          } else {
            if (
              (result[i].message.users[0].toString() ===
                conversation.message.users[0].toString() ||
                result[i].message.users[1].toString() ===
                  conversation.message.users[0].toString()) &&
              (result[i].message.users[0].toString() ===
                conversation.message.users[1].toString() ||
                result[i].message.users[1].toString() ===
                  conversation.message.users[1].toString())
            ) {
              break;
            }

            if (i === result.length - 1) {
              result = [...result, conversation];
            }
          }
        }
      }
    });
    result.map((item) => {
      if (item.user_info[0]._id.toString() === id) {
        item.user_info = item.user_info[1];
      } else {
        item.user_info = item.user_info[0];
      }
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
};
