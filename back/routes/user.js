const express = require("express");
const passport = require("passport");

const { isNotLoggedIn, isLoggedIn } = require("./middlewares");
const User = require("../models/User");

const router = express.Router();

router.get("/auth", (req, res, next) => {
  return res.json(req.user || false);
});

router.post("/register", isNotLoggedIn, async (req, res, next) => {
  try {
    const exUser = await User.findOne({ email: req.body.email });
    if (exUser) {
      res.status(403).send("이미 사용 중인 이메일 입니다.");
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 12);

    const user = new User({
      email: req.body.email,
      name: req.body.name,
      password: hashedPassword,
    });

    user.save();

    res.status(201).json("ok");
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

router.post("/login", isNotLoggedIn, (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.error(err);
      return next(err);
    }
    if (info) {
      return res.status(401).send(info.reason);
    }
    return req.login(user, async (loginErr) => {
      if (loginErr) {
        console.error(loginErr);
        return next(loginErr);
      }
      return res
        .status(200)
        .json(
          await User.findOne(
            { _id: user._id },
            { name: 1, email: 1, role: 1, image: 1 }
          )
        );
    });
  })(req, res, next);
});

router.get("/logout", isLoggedIn, (req, res) => {
  req.logout();
  req.session.destroy();
  res.send("ok");
});

module.exports = router;
