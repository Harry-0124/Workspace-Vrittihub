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
  
  