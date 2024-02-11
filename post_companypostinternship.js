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
  
  
  