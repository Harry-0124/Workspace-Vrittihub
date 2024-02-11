// login with password
app.post(
    "/login2",
    passport.authenticate("local", {
      successRedirect: "/explore2",
      failureRedirect: "/login2",
    })
  );



  // company registration 
app.post("/register2", async (req, res) => {
    const email = req.body.username;
    const password = req.body.password;
  
    try {
      const checkResult = await db.query("SELECT * FROM recruiter WHERE email = $1", [
        email,
      ]);
  
      if (checkResult.rows.length > 0) {
        req.redirect("/login2");
      } else {
        bcrypt.hash(password, saltRounds, async (err, hash) => {
          if (err) {
            console.error("Error hashing password:", err);
          } else {
            const result = await db.query(
              "INSERT INTO recruiter (email, password) VALUES ($1, $2) RETURNING *",
              [email, hash]
            );
            const user = result.rows[0];
            req.login(user, (err) => {
              console.log("success");
              res.sendStatus(201);
              //res.redirect("/companydetails");
            });
          }
        });
      }
    } catch (err) {
      console.log(err);
    }
  });

// manual registration verification using password
passport.use(
  "local",
  new Strategy(async function verify( username, password, cb) {
    try {
      const result = await db.query("SELECT * FROM recruiter WHERE email = $1 ", [
        username,
      ]);
      if (result.rows.length > 0) {
        const user = result.rows[0];
        const storedHashedPassword = user.password;
        bcrypt.compare(password, storedHashedPassword, (err, valid) => {
          if (err) {
            //Error with password check
            console.error("Error comparing passwords:", err);
            return cb(err);
          } else {
            if (valid) {
              //Passed password check
              return cb(null, user);
            } else {
              //Did not pass password check
              return cb(null, false);
            }
          }
        });
      } else {
        return cb("User not found");
      }
    } catch (err) {
      console.log(err);
    }
  })
);

 // O AUTH verification 
 passport.use( 
  "google",
   new GoogleStrategy(
    {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET, 
    callbackURL: "http://localhost:3000/auth/google/explore2",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
  }, 
  async (accessToken, refreshToken, profile, cb) => {
    
    try {
    console.log(profile);
      const result = await db.query("SELECT * FROM recruiter WHERE email = $1", [
      profile.email,
      ]);
        if (result.rows.length === 0) {
          const newUser = await db.query(
          "INSERT INTO recruiter (email, password) VALUES ($1, $2)",
        [profile.email, "google"] 
        );
        return cb(null, newUser.rows[0]);   
        } else {
          //Already existing 
          return cb(null, result.rows[0]);
        }
    } catch (err) { 
      return cb(err);
    }
  }
  )
  );
  
  passport.serializeUser((user, cb) => {
    cb(null, user);
  });
  
  passport.deserializeUser((user, cb) => {
    cb(null, user);
  });

