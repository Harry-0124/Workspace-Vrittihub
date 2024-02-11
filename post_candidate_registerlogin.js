// login with password
app.post(
    "/login",
    passport.authenticate("local", {
      successRedirect: "/details",
      failureRedirect: "/login",
    })
  );

//  candidate  registration 

app.post("/register", async (req, res) => {
    const email = req.body.username;
    const password = req.body.password;
  
    try {
      const checkResult = await db.query("SELECT * FROM candidate WHERE email = $1", [
        email,
      ]);
  
      if (checkResult.rows.length > 0) {
        req.redirect("/login");
      } else {
        bcrypt.hash(password, saltRounds, async (err, hash) => {
          if (err) {
            console.error("Error hashing password:", err);
          } else {
            const result = await db.query(
              "INSERT INTO candidate ( email, password) VALUES ($1, $2) RETURNING *",
              [email, hash]
            );
            const user = result.rows[0];
            req.login(user, (err) => {
              console.log("success");
              res.sendStatus(201);
             // res.redirect("/details");
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
    new Strategy(async function verify(username, password, cb) {
      try {
        const result = await db.query("SELECT * FROM candidate WHERE email = $1 ", [
          username,
        ]);
        if (result.rows.length > 0) {
          const user = result.rows[0];
          const storedHashedPassword = user.password;
          bcrypt.compare(password, storedHashedPassword, (err, valid) => {
            if (err) {
              console.error("Error comparing passwords:", err);
              return cb(err);
            } else {
              if (valid) {
                return cb(null, user);
              } else {
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
      callbackURL: "http://localhost:3000/auth/google/explore",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    }, 
    async (accessToken, refreshToken, profile, cb) => {
      
      try {
      console.log(profile);
        const result = await db.query("SELECT * FROM candidate WHERE email = $1", [
        profile.email,
        ]);
          if (result.rows.length === 0) {
            const newUser = await db.query(
            "INSERT INTO candidate (email, password) VALUES ($1, $2)",
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