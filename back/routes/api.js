const { User } = require("../models/User");
const express = require("express");

const router = express.Router();

router.post("/register", (req, res, next) => {
  const user = new User(req.body);

  user.save((err, userInfo) => {
    if (err) return res.json({ success: false, err });

    return res.status(200).json({
      success: true,
      userInfo,
    });
  });
});

router.post("/login", (req, res, next) => {
  //요청된 이메일을 데이터 베이스에 있는지 찾는다.
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user) {
      return res.json({
        loginSuccess: false,
        message: "제공된 이메일에 해당하는 유저가 없습니다.",
      });
    }
    //요청한 이메일이 데이터 베이스에 있다면 비밀번호가 같은지 찾는다.
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch) {
        return res.json({
          loginSuccess: false,
          message: "비밀번호가 틀렸습니다.",
        });
      }
      //비밀번호가 맞다면 토큰을 생성한다.
      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err);

        res.cookie("x_auth", user.token).status(200).json({
          loginSuccess: true,
          userId: user._id,
        });
        // 토큰을 저장한다. 어디에? 쿠키, 로컬스토리지
      });
    });
  });
});

module.exports = router;
