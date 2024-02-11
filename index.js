//console.log("GANPATI BAPPA MORAYA");

//packages
import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import GoogleStrategy from "passport-google-oauth2";
import session from "express-session";
import env from "dotenv";
import multer from "multer";

//middleware, port, salt rounds for encryption 
const app = express();
const port = 3000;
const saltRounds = 10;
env.config();

// session creation 
app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: true,
    })
  );

  // body parsers
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


app.use(passport.initialize());
app.use(passport.session());


// database connection with securing data using environment variables 
const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
db.connect();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


//   STUDENTS

// home page 
app.get("/", (req, res) => {
    res.render("home");
  });

// are you a 
app.get("/areyoua ", (req, res) => {
  res.render("are you a ");
});

// redirect of candidate
app.get("/candidate ", (req, res) => {
  res.render("register");
});


// login page
  app.get("/login", (req, res) => {
   res.render("login");
  });
  
// register page 
  app.get("/register", (req, res) => {
    res.render("register");
  });

// logout page 
 // app.get("/logout", (req, res) => {
  //  req.logout(function (err) {
   //   if (err) {
   //     return next(err);
  //    }
    // res.redirect("/");
  //  });
  //})
  



 // user being authenticated using O AUTH
  app.get("/explore", (req, res) => {
    console.log(req.user);
    if (req.isAuthenticated()) {
      res.render("/explore");
    } else {
      res.redirect("/login");
    }
  });
  
// signing up with Google
  app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
  );

// user after being authenticated using O AUTH
  app.get(
  "/auth/google/explore",
  passport.authenticate("google", {
      successRedirect: "/studentdetails",
      failureRedirect: "/login",
  })   
  );

// logout page
  app.get("/logout", (req , res ) => {
    req.logout((err) => {
      if (err) console.log(err);
      res.redirect("/");
    });
  });

// get student details

  app.get("/studentdetails/:email", async (req, res) => {

    try {
      const email = req.params.email;
  
      // Fetch student details from the database based on the student email
      const result = await db.query(
        "SELECT name, email, qualification, contact_no, locations, college_name, skills, achievements, interested_internship FROM students WHERE email = $1",
        [email]
      );
  
      // Check if a student with the given email exists
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Student not found" });
      }
  
      // Extract student details from the query result
      const studentDetails = result.rows[0];
  
      // Send the student details as a response
      res.status(200).json(studentDetails);
      console.log('Student Details:', studentDetails );
    } catch (error) {
      console.error("Error fetching student details:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });







//   P  O  S  T         R  E Q  U  E  S  T  S

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




// CANDIDATE DETAILS POST REQUEST
//8.5 solution.js 90 line





// POST request to store student details
app.post("/studentdetails", async (req, res) => {
  const reqPayload = req.body;
  console.log('Data received: ', reqPayload);
  const name = reqPayload.name;
  const email = reqPayload.email;
  const qualification = reqPayload.qualification;
  const contact_no = reqPayload.contact_no;
  const locations = reqPayload.locations ;
  const college_name = reqPayload.college_name;
  const skills = reqPayload.skills;
  const achievements = reqPayload.achievements;
  const interested_internship = reqPayload.interested_internship;

  const result = await db.query(
  
    "INSERT INTO students ( name, email, qualification, contact_no, locations, college_name, skills, achievements, interested_internship) VALUES( $1, $2, $3, $4, $5, $6, $7, $8 , $9);",
    [ name , email, qualification, contact_no, locations, college_name, skills, achievements, interested_internship]
  );
console.log(result);
console.log(email);


 res.sendStatus(200);

});







// CANDIDATE DETAILS EDIT POST patch REQUEST









  

    // Define a route to handle internship applications
//app.post('/apply', async (req, res) => {
  //try {
    //const { candidateName, candidateEmail,  } = req.body;

    // Store application in PostgreSQL
    //const result = await db.query(
   //   "INSERT INTO internship_applications (candidate_name, candidate_email) VALUES ($1, $2) RETURNING * ;",
   ///   [candidateName, candidateEmail]
   /// );

    // Assuming 'internship_applications' is the name of your table
   // const appliedRequest = result.rows[0];

    // Send success message to the candidate
   // res.json({
   //   success: true,
   //   message: 'Application submitted successfully!',
   //   appliedRequest,
 //   });
//  } catch (error) {
 //   console.error('Error processing internship application:', error);
 //   res.status(500).json({
 ///     success: false,
  //    message: 'Internal Server Error',
  ///  });
 //}
//});







// STUDENT APPLY FOR INTERNSHIP POST REQUEST 

app.post("/applyforinternship", async (req, res) => {
  try {
    const reqPayload = req.body;
    console.log('Internship Application Data received: ', reqPayload);

    const student_name = reqPayload.student_name;
    const qualification = reqPayload.qualification;
    const contact_no = reqPayload.contact_no;
    const college_name = reqPayload.college_name;
    const skills_achievements = reqPayload.skills_achievements;
    const bio = reqPayload.bio;
    const email = reqPayload.email;
    const locations = reqPayload.locations;
    const where_internship = reqPayload.where_internship;

    // Insert the internship application details into the database
    const result = await db.query(
      "INSERT INTO internship_application (student_name, qualification, contact_no, college_name, skills_achievements, bio, email, locations, where_internship) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);",
      [student_name, qualification, contact_no, college_name, skills_achievements, bio, email, locations, where_internship]
    );

    console.log(result);
    console.log(email);

    // Notify the company about the internship application (you can implement this as needed)

    res.status(200).json({ success: "Internship application submitted successfully!" });
  } catch (error) {
    console.error("Error applying for internship:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});










//   C O M P A N Y 

// company home page

// redirect to recruiter 
app.get("/recruiter ", (req, res) => {
    res.render("register2");
  });
  
  // login page
    app.get("/login2", (req, res) => {
      res.render("login2");
    });
    
  // register page 
    app.get("/register2", (req, res) => {
      res.render("register2");
    });
  
   
  // logout page 
    app.get("/logout2", (req, res) => {
      req.logout(function (err) {
        if (err) {
          return next(err);
        }
        res.redirect("/");
      });
    });
    
  // user being authenticated using O AUTH
    app.get("/explore2", (req, res) => {
      console.log(req.user);
      if (req.isAuthenticated()) {
        res.render("explore2");
      } else {
        res.redirect("/login2");
      }
    });
    
  // signing up with Google
    app.get(
    "/auth/google",
    passport.authenticate("google", {
      scope: ["profile", "email"],
    })
    );
  
  // user after being authenticated using O AUTH
    app.get(
    "/auth/google/explore",
    passport.authenticate("google", {
        successRedirect: "/companydetails",
        failureRedirect: "/login",
    })   
    );
  
  // logout page
    app.get("/logout2", (req , res ) => {
      req.logout((err) => {
        if (err) console.log(err);
        res.redirect("/");
      });
    });
  
  // login with password
    app.post(
      "/login2",
      passport.authenticate("local", {
        successRedirect: "/explore2",
        failureRedirect: "/login2",
      })
    );
  
   // company  details  get page 


   app.get("/companydetails/:email", async (req, res) => {

    try {
      const email = req.params.email;
  
      // Fetch company details from the database based on the company_id
      const result = await db.query(
        "SELECT company_name, qualification_required, contact_no, position_name, skills_required, job_description, email, locations, interested_domain FROM company WHERE email = $1",
        [email]
      );
  
      // Check if a company with the given company_id exists
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Company not found" });
      }
  
      // Extract company details from the query result
      const companyDetails = result.rows[0];
  
      // Send the company details as a response
      res.status(200).json(companyDetails);
      console.log('Company Details:', companyDetails );
    } catch (error) {
      console.error("Error fetching company details:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });





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





// COMPANY DETAILS POST REQUEST

 app.post("/companydetails", async (req, res) => {
   const reqPayload = req.body;
  console.log('Data received: ', reqPayload);
  const company_name = reqPayload.company_name;
  const qualification_required  = reqPayload.qualification_required;
  const contact_no  = reqPayload.contact_no;
  const  position_name  = reqPayload.position_name;
  const skills_required  = reqPayload.skills_required;
  const job_description  = reqPayload.job_description;
  const email  = reqPayload.email;
  const locations = reqPayload.locations;
  const interested_domain  = reqPayload.interested_domain;


    const result = await db.query(
      "INSERT INTO company (company_name , qualification_required, contact_no, position_name, skills_required, job_description, email, locations, interested_domain) VALUES( $1, $2, $3, $4,$5, $6, $7, $8, $9);",
      [company_name , qualification_required, contact_no, position_name, skills_required, job_description, email, locations, interested_domain]
    );
  console.log(result);
  console.log(email);

  res.sendStatus(200);
  });





// COMPANY POST REQUEST TO POST INTERNSHIP



app.post("/postinternship", async (req, res) => {
  try {
    const reqPayload = req.body;
    console.log('Internship Post Data received: ', reqPayload);

    const company_name = reqPayload.company_name;
    const qualification_required = reqPayload.qualification_required;
    const contact_no = reqPayload.contact_no;
    const position_name = reqPayload.position_name;
    const skills_required = reqPayload.skills_required;
    const job_description = reqPayload.job_description;
    const email = reqPayload.email;
    const locations = reqPayload.locations;
    const interested_domain = reqPayload.interested_domain;

    // Insert the internship post details into the database
    const result = await db.query(
      "INSERT INTO internship_post (company_name, qualification_required, contact_no, position_name, skills_required, job_description, email, locations, interested_domain) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);",
      [company_name, qualification_required, contact_no, position_name, skills_required, job_description, email, locations, interested_domain]
    );

    console.log(result);
    console.log(email);

    // Notify students about the new internship opportunity (you can implement this as needed)

    res.status(200).json({ success: "Internship posted successfully!" });
  } catch (error) {
    console.error("Error posting internship:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});





// COMPANY get REQUEST for INTERNSHIP
app.get('/postedinternship', async (req, res) => {
  try {
    const companyName = req.body.companyName; 

    const result = await db.query(
      'SELECT * FROM internship_post',
      []
    );

    const internshipApplications = result.rows;

    res.json({
      success: true,
      internshipApplications,
    });
  } catch (error) {
    console.error('Error fetching internship applications:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
});








    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
    