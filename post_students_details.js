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

