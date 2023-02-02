const io = require("socket.io")(8900, {
  cors: {
    origin: "*",
  },
});
let users = [];
io.on("connection", (socket) => {
  // console.log(socket.id + " connected.");

  socket.on("joinRoom", (id) => {
    const user = { userId: socket.id, room: id };
    const check = users.every((user) => user.userId !== socket.id);
    if (check) {
      users.push(user);
      socket.join(user.room);
    } else {
      users.map((user) => {
        if (user.userId === socket.id) {
          if (user.room !== id) {
            socket.leave(user.room);
            socket.join(id);
            user.room = id;
          }
        }
      });
    }
  });

  socket.on("createComment", (msg) => {
    // console.log(msg);
    const { username, content, hotelId, createdAt, rating, send, comment,userId } =
      msg;
    if (send === "replyComment") {
      msg._id = comment._id;
      msg.reply = comment.reply;
      // console.log(msg);
      io.to(comment.hotelId).emit("sendReplyCommentToClient", msg);
    } else {
      io.to(hotelId).emit("sendCommentToClient", msg);
    }
  });

  socket.on("disconnect", () => {
    // console.log(socket.id + " disconnected.");
    users = users.filter((user) => user.userId !== socket.id);
  });
});
