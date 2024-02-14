// PATCH request to update company details using email as a path variable


app.patch("/companydetails/:email", async (req, res) => {
    try {
        const email = req.params.email;
        const reqPayload = req.body;
        console.log("Data received for PATCH with email ${email}: ", reqPayload);
  
        // Extract necessary details from the request payload
        const company_name = reqPayload.company_name;
        const qualification_required = reqPayload.qualification_required;
        const contact_no = reqPayload.contact_no;
        const position_name = reqPayload.position_name;
        const skills_required = reqPayload.skills_required;
        const job_description = reqPayload.job_description;
        const locations = reqPayload.locations;
        const interested_domain = reqPayload.interested_domain;
  
        // Check if at least one field is being updated
        if (!company_name && !qualification_required && !contact_no && !position_name && !skills_required && !job_description && !locations && !interested_domain) {
            return res.status(400).json({ error: "At least one field is required for a PATCH request" });
        }
  
        // Update the company details in the database based on the email in the path
        const result = await db.query(
            "UPDATE company SET company_name = COALESCE($1, company_name), qualification_required = COALESCE($2, qualification_required), contact_no = COALESCE($3, contact_no), position_name = COALESCE($4, position_name), skills_required = COALESCE($5, skills_required), job_description = COALESCE($6, job_description), locations = COALESCE($7, locations), interested_domain = COALESCE($8, interested_domain) WHERE email = $9 RETURNING *;",
            [company_name, qualification_required, contact_no, position_name, skills_required, job_description, locations, interested_domain, email]
        );
  
        const updatedCompany = result.rows[0];
        console.log("Updated company details:", updatedCompany);
  
        res.status(200).json(updatedCompany);
    } catch (error) {
        console.error("Error updating company details:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
  });
  