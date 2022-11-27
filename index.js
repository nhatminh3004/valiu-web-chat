const express  = require('express');
const PORT = process.env.PORT ||3000;
const cors = require("cors");
const mongoose = require("mongoose");
const socket = require("socket.io");
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");
const conversationRoutes = require("./routes/conversationRoutes");
const app =express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/conversations", conversationRoutes);
mongoose
  .connect(`mongodb+srv://mongodb:mongodb@cluster0.rpubftm.mongodb.net/Cluster0?retryWrites=true&w=majority`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("database is connected");
  })
  .catch((err) => console.log(err.message));
  const server =app.listen(PORT,()=>{
    console.log(`Sever started on port : ${PORT}`);
})
const io = socket(server);
  // cors: {
  //   origin: "http://localhost:3000",
  //   credentials: true,
  // },
//socket-----------------------------------------------
global.onlineUsers = new Map();
io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    // console.log("user added", userId);
    onlineUsers.set(userId, socket.id);
  });
  socket.on("send-msg", (data) => {
    console.log("send-msg socket :", data);
    for (var i = 0; i < data.to.length; i++) {
      if (data.to[i].userId !== data.from.user._id) {
        const sendUserSocket = onlineUsers.get(data.to[i].userId);
        if (sendUserSocket) {
          // console.log(sendUserSocket);
          const dataSent = {
            message: data.message,
            from: data.from,
          };
          io.to(`${sendUserSocket}`).emit("msg-receive", dataSent);
        }
      }
    }
  });
  socket.on("evict-message", (data) => {
    console.log("Data nhan ben sever evic message :",data);
    for (var i = 0; i < data.to.length; i++) {
      if (data.to[i].userId !== data.from) {
        const sendUserSocket = onlineUsers.get(data.to[i].userId);
        if (sendUserSocket) {
          const dataSent = { messageId: data.messageId };
          io.to(`${sendUserSocket}`).emit("reply-evict-message", dataSent);
        }
      }
    }
  });
  socket.on("send-invitation", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      io.to(`${sendUserSocket}`).emit("invitation-receive", data.from);
    }
  });
  socket.on("acceptted", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      io.to(`${sendUserSocket}`).emit("response-accept-friend", data);
    }
  });
  socket.on("unfriend", (data) => {
    const sendUserSocket = onlineUsers.get(data._id);
    if (sendUserSocket) {
      io.to(`${sendUserSocket}`).emit("response-unfriend", data);
    }
  });
  socket.on("denyAddFriend", (data) => {
    const sendUserSocket = onlineUsers.get(data.to._id);
    if (sendUserSocket) {
      io.to(`${sendUserSocket}`).emit("response-deny-invitation", data);
    }
  });
  socket.on("create-group", (data) => {
    for (var i = 0; i < data.conversation.members.length; i++) {
      if (data.conversation.members[i].userId !== data.myId) {
        const sendUserSocket = onlineUsers.get(
          data.conversation.members[i].userId
        );
        if (sendUserSocket) {
          // console.log(sendUserSocket);
          const dataSent = {
            conversation: data.conversation,
          };
          io.to(`${sendUserSocket}`).emit("inform-create-group", dataSent);
        }
      }
    }
  });
  socket.on("add-members-group", (data) => {
    for (var i = 0; i < data.conversation.conversation.members.length; i++) {
      if (data.conversation.conversation.members[i].userId !== data.myId) {
        const sendUserSocket = onlineUsers.get(
          data.conversation.conversation.members[i].userId
        );
        if (sendUserSocket) {
          // console.log(sendUserSocket);
          const dataSent = {
            conversation: data.conversation,
          };
          io.to(`${sendUserSocket}`).emit("inform-add-members-group", dataSent);
        }
      }
    }
  });

  socket.on("remove-member-group", (data) => {
    console.log(data);
    for (var i = 0; i < data.conversation.conversation.members.length; i++) {
      if (
        data.conversation.conversation.members[i].userId !==
        data.conversation.conversation.leaderId
      ) {
        const sendUserSocket = onlineUsers.get(
          data.conversation.conversation.members[i].userId
        );
        if (sendUserSocket) {
          // console.log(sendUserSocket);
          const dataSent = {
            conversation: data.conversation,
            userRemovedId: data.userRemovedId,
          };
          console.log(sendUserSocket);
          io.to(`${sendUserSocket}`).emit(
            "inform-remove-member-group",
            dataSent
          );
        }
      }
    }
    const sendUserSocket = onlineUsers.get(data.userRemovedId);
    if (sendUserSocket) {
      const dataSent = {
        conversation: data.conversation,
        userRemovedId: data.userRemovedId,
      };
      io.to(`${sendUserSocket}`).emit("inform-remove-member-group", dataSent);
    }
  });
  socket.on("change-leader", (data) => {
    for (var i = 0; i < data.conversation.conversation.members.length; i++) {
      if (data.conversation.conversation.members[i].userId !== data.myId) {
        const sendUserSocket = onlineUsers.get(
          data.conversation.conversation.members[i].userId
        );
        if (sendUserSocket) {
          // console.log(sendUserSocket);
          const dataSent = {
            conversation: data.conversation,
          };
          io.to(`${sendUserSocket}`).emit("inform-change-leader", dataSent);
        }
      }
    }
  });
  socket.on("leave-group", (data) => {
    for (var i = 0; i < data.conversation.conversation.members.length; i++) {
      if (data.conversation.conversation.members[i].userId !== data.myId) {
        const sendUserSocket = onlineUsers.get(
          data.conversation.conversation.members[i].userId
        );
        if (sendUserSocket) {
          // console.log(sendUserSocket);
          const dataSent = {
            conversation: data.conversation,
          };
          io.to(`${sendUserSocket}`).emit("inform-leave-group", dataSent);
        }
      }
    }
  });
  socket.on("remove-group", (data) => {
    for (var i = 0; i < data.members.length; i++) {
      if (data.members[i].userId !== data.myId) {
        const sendUserSocket = onlineUsers.get(data.members[i].userId);
        if (sendUserSocket) {
          // console.log(sendUserSocket);
          io.to(`${sendUserSocket}`).emit("inform-remove-group");
        }
      }
    }
  });
});