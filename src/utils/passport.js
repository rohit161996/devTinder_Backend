const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        let user = await User.findOne({
          $or: [{ googleId: profile.id }, { emailId: email }],
        });

        if (!user) {
          user = await User.create({
            firstName: profile.name?.givenName || profile.displayName || "User",
            lastName: profile.name?.familyName || "",
            emailId: email,
            googleId: profile.id,
            authProvider: "google",
            avatar: profile.photos?.[0]?.value,
          });
        } else {
          if (!user.googleId) user.googleId = profile.id;
          user.authProvider = "google";
          if (!user.avatar) user.avatar = profile.photos?.[0]?.value;
          await user.save();
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

module.exports = passport;
