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