const {
  addMessage,
  getAllMessage,
  getMyConversations,
} = require("../controllers/messageController");

const router = require("express").Router();

router.post("/addmsg/", addMessage);
router.get("/myConversations/:id", getMyConversations);
router.post("/getmsg", getAllMessage);

module.exports = router;
