const {
  register,
  setAvatar,
  getAllUsers,
  searchUser,
  addSentInvitation,
  acceptFriend,
  denyAddFriend,
  checkPhoneTonTai,
  doiMatKhau,
  getUsersInfo,
  unfriend,
  updateUserInfo,
  updateImageMobile
} = require("../controllers/userController");
const { login } = require("../controllers/userController");

const router = require("express").Router();

router.post("/register", register);
router.get("/test", (req, res) => {
  res.send("Hello");
});
router.post("/login", login);
router.post("/doiMatKhau", doiMatKhau);
router.post("/checkPhoneTonTai", checkPhoneTonTai);
router.post("/setAvatar/:id", setAvatar);
router.post("/invite", addSentInvitation);
router.post("/acceptFriend", acceptFriend);
router.post("/denyAddFriend", denyAddFriend);
router.get("/allusers/:id", getAllUsers);
router.post("/search", searchUser);
router.post("/getUsersInfo", getUsersInfo);
router.post("/unfriend", unfriend);
router.post("/updateUserInfo", updateUserInfo);
router.post("/updateImageMobile",   updateImageMobile);

module.exports = router;
