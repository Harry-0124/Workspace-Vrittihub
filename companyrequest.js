// company login

app.post("/login2",
    
    async(req, res) => {
      const email = req.body.email;
      const loginPassword = req.body.password;
    
      try {
        const checkResult = await db.query("SELECT password FROM recruiter WHERE email = $1", 
              [email] );
        
        if (checkResult.rows.length > 0) {
          const hashedPassword = checkResult.rows[0].password;
          console.log("hashedPassword: " + hashedPassword);
          bcrypt.compare(loginPassword, hashedPassword, (err, result) => {
            if (err) {
              console.error('Error comparing passwords:', err);
              // Handle error
              res.sendStatus(500);
            } else if (result) {
              // Passwords match, user authentication successful
              console.log('Password matches!');
              // Proceed with login
              res.sendStatus(200);
            } else {
              // Passwords do not match, user authentication failed
              console.log('Password does not match!');
              // Handle incorrect password
              res.sendStatus(401);
            }
          });

        } else {
          res.sendStatus(401);
        }
        
      }catch (err) {
        console.log(err);
      }
    }

  );




// company registeration

  

  


  app.post("/register2", async (req, res) => {
    const email = req.body.username;
    const password = req.body.password;
    try {
      const checkResult = await db.query("SELECT * FROM recruiter WHERE email = $1", [
        email,
      ]);
  
      if (checkResult.rows.length > 0) {
        // Company with the given email already exists, handle accordingly
        res.sendStatus(400);
      } else {
        bcrypt.hash(password, saltRounds, async (err, hash) => {
          if (err) {
            console.error("Error hashing password:", err);

            res.sendStatus(500);

          } else {
            const result = await db.query(
              "INSERT INTO recruiter (email, password) VALUES ($1, $2) RETURNING *",
              [email, hash]
            );
            const user = result.rows[0];
            req.login(user, (err) => {
              console.log("success");
              res.sendStatus(201);
              
            });
          }
        });
      }
    } catch (err) {
      console.log(err);
    }
  });
  



// company details

app.post("/companydetails", async (req, res) => {
    const reqPayload = req.body;
    console.log('Data received: ', reqPayload);
  
    const company_name = reqPayload.company_name;
    const qualification_required  = reqPayload.qualification_required;
    const contact_no  = reqPayload.contact_no;
    const position_name  = reqPayload.position_name;
    const skills_required  = reqPayload.skills_required;
    const job_description  = reqPayload.job_description;
    const email  = reqPayload.email;
    const locations = reqPayload.locations;
    const interested_domain  = reqPayload.interested_domain;
  
    
      const result = await db.query(
        "INSERT INTO company (company_name, qualification_required, contact_no, position_name, skills_required, job_description, email, locations, interested_domain) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9);",
        [company_name, qualification_required, contact_no, position_name, skills_required, job_description, email, locations, interested_domain]
      );
      console.log(result);
      console.log(email);
  
      res.sendStatus(200);
  
  });





// company post internship

app.post("/postinternship", async (req, res) => {
    try {
      const reqPayload = req.body;
      console.log('Internship Posted Data received: ', reqPayload);
  
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







// get request company details

app.get("/companydetails/:email", async (req, res) => {

    try {
      const email = req.params.email;
      console.log("Email: " + email);
  
      // Fetch company details from the database based on the student email
      const result = await db.query(
        'SELECT company_name, qualification_required, contact_no, position_name, skills_required, job_description, email, locations, interested_domain FROM company WHERE email = $1',
        [email]
      );
  
      // Check if a company with the given email exists
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
  

  



//New request
// get posted internship request

app.get("/postedinternship/:email", async (req, res) => {
    try {
        const email = req.params.email;
  
        // Retrieve internship post data from the database based on the post ID
        const internshipPost = await db.query(
            "SELECT * FROM internship_post WHERE email = $1;",
            [email]
        );
  
        console.log("Internship Posted Data:", internshipPost.rows);
  
        res.status(200).json(internshipPost.rows);
    } catch (error) {
        console.error("Error getting internship posted:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
  






// Students new request
// apply for internship get request

app.get("/appliedforinternship/:email", async (req, res) => {
    try {
        const email= req.params.email;
  
        // Retrieve internship application data from the database based on the application ID
        const internshipApplication = await db.query(
            "SELECT * FROM internship_application WHERE email = $1;",
            [email]
        );
  
        console.log("Internship Application Data:", internshipApplication.rows);
  
        res.status(200).json(internshipApplication.rows);
    } catch (error) {
        console.error("Error getting internship application:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
  });
  


  
