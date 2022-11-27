const {
  sendMessage,
  getAllMessage,
  getMyConversations,
  createConversation,
  evictMessage,
  createGroup,
  removeMember,
  addMembers,
  changeLeader,
  leaveGroup,
  removeGroup,
} = require("../controllers/conversationController");

const router = require("express").Router();

router.post("/sendMessage/", sendMessage);
router.get("/myConversations/:id", getMyConversations);
router.post("/createConversation/", createConversation);
router.post("/createGroup/", createGroup);
router.post("/getmsg", getAllMessage);
router.post("/evictMessage", evictMessage);
router.post("/removeMember", removeMember);
router.post("/addMembers", addMembers);
router.post("/changeLeader", changeLeader);
router.post("/leaveGroup", leaveGroup);
router.post("/removeGroup", removeGroup);

module.exports = router;
