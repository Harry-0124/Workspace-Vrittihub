// PATCH request to update student details using email as a path variable

app.patch("/studentdetails/:email", async (req, res) => {
    try {
        const email = req.params.email;
        const reqPayload = req.body;
        console.log("Data received for PATCH with email ${email}: ", reqPayload);
  
        // Extract necessary details from the request payload
        const name = reqPayload.name;
        const qualification = reqPayload.qualification;
        const contact_no = reqPayload.contact_no;
        const locations = reqPayload.locations;
        const college_name = reqPayload.college_name;
        const skills = reqPayload.skills;
        const achievements = reqPayload.achievements;
        const interested_internship = reqPayload.interested_internship;
  
        // Check if at least one field is being updated
        if (!name && !qualification && !contact_no && !locations && !college_name && !skills && !achievements && !interested_internship) {
            return res.status(400).json({ error: "At least one field is required for a PATCH request" });
        }
  
        // Update the student details in the database based on the email in the path
        const result = await db.query(
            "UPDATE students SET name = COALESCE($1, name), qualification = COALESCE($2, qualification), contact_no = COALESCE($3, contact_no), locations = COALESCE($4, locations), college_name = COALESCE($5, college_name), skills = COALESCE($6, skills), achievements = COALESCE($7, achievements), interested_internship = COALESCE($8, interested_internship) WHERE email = $9 RETURNING *;",
            [name, qualification, contact_no, locations, college_name, skills, achievements, interested_internship, email]
        );
  
        const updatedStudent = result.rows[0];
        console.log("Updated student details:", updatedStudent);
  
        res.status(200).json(updatedStudent);
    } catch (error) {
        console.error("Error updating student details:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
  });