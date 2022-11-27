const User = require("../model/userModel");
const bcrypt = require("bcrypt");
const { use } = require("../routes/userRoutes");

module.exports.register = async (req, res, next) => {
  try {
    const { username, phone, email, password, gender } = req.body;
    const phoneCheck = await User.findOne({ phone });
    if (phoneCheck)
      return res.json({ msg: "Phone number already used", status: false });
    const emailCheck = await User.findOne({ email });
    if (emailCheck)
      return res.json({ msg: "Email already used", status: false });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      phone,
      email,
      username,
      password: hashedPassword,
      gender,
    });
    delete user.password;
    await user.save();
    return res.json({ status: true, user });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
module.exports.doiMatKhau = async (req, res) => {
  const { phone, newpassword } = req.body;
  // console.log("số dthoai", phone);
  // console.log("password new:", newpassword);
  const hashedPassword = await bcrypt.hash(newpassword, 10);
  const user = await User.findOne({ phone });
  // console.log("user_id", user._id);
  const usersauKhiDoiMatKhau = await User.findByIdAndUpdate(
    { _id: user._id },
    { password: hashedPassword },
    { new: true }
  );

  return res.json({ status: true, data: usersauKhiDoiMatKhau });
};

module.exports.login = async (req, res, next) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });
    if (!user)
      return res.json({ msg: "Incorrect phone or password", status: false });
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.json({ msg: "Incorrect phone or password", status: false });
    delete user.password;
    return res.json({ status: true, user });
  } catch (error) {
    next(error);
  }
};
module.exports.checkPhoneTonTai = async (req, res, next) => {
  try {
    const { phone } = req.body;
    console.log("số dthoai", phone);
    const phoneCheck = await User.findOne({ phone });
    if (phoneCheck)
      return res.json({ msg: "Phone number already used", status: false });
  } catch (error) {
    next(error);
  }
  return res.json({ msg: "Phone Hợp lệ", status: true });
};

module.exports.setAvatar = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const avatarImage = req.body.image;
    const userData = await User.findByIdAndUpdate(userId, {
      isAvatarImageSet: true,
      avatarImage,
    });
    return res.json({
      isSet: userData.isAvatarImageSet,
      image: userData.avatarImage,
    });
  } catch (error) {
    next(error);
  }
};

module.exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ _id: { $ne: req.params.id } }).select([
      "email",
      "username",
      "avatarImage",
      "_id",
    ]);
    return res.json(users);
  } catch (error) {
    next(error);
  }
};

module.exports.getUsersInfo = async (req, res, next) => {
  try {
    const usersId = req.body.usersId;
    let result = [];
    if (usersId) {
      for (var i = 0; i < usersId.length; i++) {
        const user = await User.findById(usersId[i]);

        if (user) {
          result = [...result, user];
        }
      }
    }
    console.log(result);
    return res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports.searchUser = async (req, res, next) => {
  try {
    const { searchKey, id } = req.body;
    const users = await User.find({
      username: { $regex: ".*" + searchKey + ".*", $options: "i" },
      _id: { $ne: id },
    });
    const userByPhone = await User.find({ phone: searchKey, _id: { $ne: id } });
    return res.json([...users, ...userByPhone]);
  } catch (error) {
    next(error);
  }
};

module.exports.addSentInvitation = async (req, res, next) => {
  try {
    const from = req.body.from;
    const to = req.body.to;
    const userData = await User.findByIdAndUpdate(from, {
      $push: { sentInvitations: to },
    });
    return res.json(userData.sentInvitations);
  } catch (error) {
    next(error);
  }
};

module.exports.acceptFriend = async (req, res, next) => {
  try {
    const currentUser = req.body.currentUser;
    const currentChat = req.body.currentChat;
    await User.findByIdAndUpdate(currentUser._id, {
      $push: { listFriends: currentChat._id },
      $pull: { sentInvitations: currentChat._id },
    });
    await User.findByIdAndUpdate(currentChat._id, {
      $push: { listFriends: currentUser._id },
      $pull: { sentInvitations: currentUser._id },
    });
    return res.json("Add friend successfully");
  } catch (error) {
    next(error);
  }
};
module.exports.denyAddFriend = async (req, res, next) => {
  try {
    const from = req.body.from;
    const to = req.body.to;
    await User.findByIdAndUpdate(from, {
      $pull: { sentInvitations: to },
    });
    await User.findByIdAndUpdate(to, {
      $pull: { sentInvitations: from },
    });
    return res.json("Deny invitation successfully");
  } catch (error) {
    next(error);
  }
};

module.exports.unfriend = async (req, res, next) => {
  try {
    const user = req.body.user;
    const currentUser = req.body.currentUser;
    await User.findByIdAndUpdate(user._id, {
      $pull: { listFriends: currentUser._id },
    });
    await User.findByIdAndUpdate(currentUser._id, {
      $pull: { listFriends: user._id },
    });
    const result = await User.findById(user._id);
    return res.json(result);
  } catch (error) {
    next(error);
  }
};
module.exports.updateUserInfo = async (req, res, next) => {
  try {
    const id = req.body.id;
    const username = req.body.username;
    const gender = req.body.gender;
    const avatarImage = req.body.avatarImage;
    console.log("Id update user nhan:",id);
    console.log("username update user nhan:",username);
    console.log("gender update user nhan:",gender);
    console.log("avatarURL update user nhan:",avatarImage);
    await User.findByIdAndUpdate(id, {
      username: username,
      gender: gender,
      avatarImage: avatarImage,
    });
    const result = await User.findById(id);
    return res.json(result);
  } catch (error) {
    next(error);
  }
};
module.exports.updateImageMobile = async (req, res, next) => {
  try {
    const id = req.body.id;
    const avatarImage = req.body.avatarImage;
    console.log("id update image nhan dc",id);
    console.log("url update image nhan dc :",avatarImage);
    await User.findByIdAndUpdate(id, {
      avatarImage: avatarImage,
    });
    const result = await User.findById(id);
    return res.json(result);
  } catch (error) {
    next(error);
  }
};
