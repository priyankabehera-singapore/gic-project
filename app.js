const http = require('http');
const express = require('express');
const mysql = require('mysql2');
const { v4: uuidv4 } = require('uuid');
const methodOverride = require('method-override');

const flash = require('connect-flash');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

// Generate a UUIDv4
const uniqueId = uuidv4();


const app = express();

app.use(methodOverride('_method'));


app.use(bodyParser.urlencoded({extended:true}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static('public'));
// Serve static files from the "uploads" directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



app.use(cors()); // Allow cross-origin requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// MySQL connection
const db = mysql.createConnection({
  host: '127.0.0.1',
  port:'3306',
  user: 'localuser',
  password: 'Root!12345#', // Your MySQL password
  database: 'gic' // Replace with your database name
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to the database.');
});


function generateCustomUUID() {
  // Generate a standard UUIDv4
  const uuid = uuidv4();
  
  // Format the UUID to "uixxxx" format
  // "uixxxx" format implies that you want to prepend "ui" and keep the rest of the UUID
  // You can customize this format according to your specific needs
  const customUUID = `UI${uuid.replace(/-/g, '').substring(0, 12)}`; // Example: "ui" + first 12 characters of UUID without dashes
  
  return customUUID;
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Specify the folder to save the uploaded files
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Specify the filename
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage: storage });


//Get Cafe
app.route('/')
  .get((req, res) => {
    const query = 'SELECT * FROM gic.cafe order by cafeid DESC';

    db.query(query, (err, results) => {
        console.log(results);
      if (err) {
        console.error('Error executing query:', err.stack);
        return res.status(500).send('Database error');
      }
      res.render('cafeList', { cafes: results });
    });
  });


  //Insert to cafe
  app.post('/cafe', upload.single('file'),(req, res) => {
    const {cafename,cafedesc,employees,location,empstartDate} = req.body;
    //console.log('File:', req.file); // Log file details to the console
    const { filename } = req.file;

    //UUID for cafe
    const uniquecafeID = generateCustomUUID();

    const query = 'INSERT INTO gic.cafe (cafeid,name,description,location,image) VALUES (?,?, ?, ?, ?)';
    const values = [uniquecafeID,cafename,cafedesc,location,filename];

    db.query(query, values, (err, results) => {
      if (err) {
        console.error('Error executing query:', err.stack);
        return res.status(500).send('Database error');
      }
      res.redirect('/'); // Redirect to the list after successful submission
    });
  });



  //update the cafe
  app.put('/cafe/:id', upload.single('file'),(req, res) => {
    const cafeID = req.params.id;
    const {cafename,cafedesc,employees,location,cafeimage} = req.body;

    //let fileName = 'empty.txt';  // Default file name
    let fileName = req.file ? req.file : '';

   if(fileName == ''){
        const query = 'UPDATE gic.cafe SET name = ?, location = ?, description = ?  WHERE cafeid = ?';
         db.query(query, [cafename,location,cafedesc,cafeID], (err, results) => {
            //console.log(results);
        if (err) {
          console.error('Error executing query:', err.stack);
          return res.status(500).json({ error: 'Database error' });
        }
        if (results.affectedRows === 0) {
          //return res.status(404).json({ error: 'User not found' });
            const uniquueempID = generateCustomUUID();
             const query = 'INSERT INTO gic.cafe (cafeid,name,description,location) VALUES (?,?, ?, ?, ?)';
             const values = [uniquecafeID,cafename,location,cafedesc];
                db.query(insertQuery, values, (err) => {
                    if (err) return res.status(500).send('Database error');
                    //res.send('Cafe created successfully');
                    res.redirect('/');
                });
        }else{
            //res.send('Employee updated successfully');
            res.redirect('/');
        }
        //res.status(200).json({ message: 'User updated successfully' });
        });
   }else{
       const { filename } = req.file;
        const query = 'UPDATE gic.cafe SET name = ?, location = ?, description = ?, image =?  WHERE cafeid = ?';
         db.query(query, [cafename,location,cafedesc,filename,cafeID], (err, results) => {
            //console.log(results);
        if (err) {
          console.error('Error executing query:', err.stack);
          return res.status(500).json({ error: 'Database error' });
        }
        if (results.affectedRows === 0) {
          //return res.status(404).json({ error: 'User not found' });
            const uniquueempID = generateCustomUUID();
             const query = 'INSERT INTO gic.cafe (cafeid,name,description,location,image) VALUES (?,?, ?, ?, ?)';
             const values = [uniquecafeID,cafename,location,cafedesc,filename];
                db.query(insertQuery, values, (err) => {
                    if (err) return res.status(500).send('Database error');
                    //res.send('Cafe created successfully');
                    res.redirect('/');
                });
        }else{
            //res.send('Employee updated successfully');
            res.redirect('/');
        }
        //res.status(200).json({ message: 'User updated successfully' });
        });
    }
     
  });   



  //load the edit page
 app.get('/editcafe/:id',(req, res) => {
   const cafeID = req.params.id;
   const query = 'SELECT * FROM gic.cafe WHERE cafeid=?';

    db.query(query, [cafeID], (err, results) => {
        //console.log(results);
      if (err) {
        console.error('Error executing query:', err.stack);
        return res.status(500).send('Database error');
      }
      //res.send("hii");
      res.render('editcafe', { cafeedit: results[0] });
    });
 });



 //Delete Cafe
  app.delete('/cafedelete/:id', (req, res)=> {
        const cafeID = req.params.id;
        console.log('employee:',cafeID);

        const query = 'DELETE FROM gic.cafe WHERE cafeid = ?';
        db.query(query, [cafeID], (err, results) => {
        if (err) {
          console.error('Error executing query:', err.stack);
          return res.status(500).send('Database error');
        }
        if (results.affectedRows === 0) {
          return res.status(404).send('Cafe not found');
        }
        res.redirect('/'); // Redirect to a list of employees or another appropriate page
    });
 });



//get the list of cafe
app.get('/employees-cafelist', (req, res)=> {
    const query = 'SELECT * FROM cafe ORDER BY cafeid DESC';
    db.query(query, (err, results) => {
        console.log(results);
    if (err) {
      console.error('Error fetching data:', err.stack);
      res.status(500).send('Error fetching data');
      return;
    }
    res.json(results);
    
  });

});

//Get the location by cafe id
app.get('/api/location/:id', (req, res)=> {
    const cafeID = req.params.id;
    const query = 'SELECT location FROM gic.cafe WHERE cafeid=? ';
    db.query(query, [cafeID], (err, results) => {
        if (err) {
          console.error('Error executing query:', err.stack);
          return res.status(500).send('Database error');
        }
        if (results.affectedRows === 0) {
          return res.status(404).send('Location not found');
        }
        res.json(results); 
    });

});


//Get the locations of the cafe
app.get('/cafelocation', (req, res)=> {   
    const query = 'SELECT DISTINCT(location) FROM gic.cafe';
    db.query(query,(err, results) => {
        if (err) {
          console.error('Error executing query:', err.stack);
          return res.status(500).send('Database error');
        }
        if (results.affectedRows === 0) {
          return res.status(404).send('Location not found');
        }
        res.render('cafelocations', { locs: results });
    });

});


//Get the no of Employess as per the location
app.get('/api/cafe/:id', (req, res)=> {   
    const loc = req.params.id;
    //console.log(loc);
    const query = 'SELECT c.name as cafename,c.image as cafeimage, c.description as cafedesc, c.cafeid, COUNT(e.empid) AS total_employees FROM gic.cafe c LEFT JOIN gic.employee e ON e.cafeid = c.cafeid WHERE c.location = ? GROUP BY c.cafeid, c.name ORDER BY total_employees DESC';
    db.query(query,[loc],(err, results) => {
        if (err) {
          console.error('Error executing query:', err.stack);
          return res.status(500).send('Database error');
        }
        if (results.affectedRows === 0) {
          return res.status(404).send('Location not found');
        }
        res.json(results); 
    });

});

//Get the list of employess by cafe
app.get('/empbycafe', (req, res)=> {   
    //const cafeid = req.params.id;
    const { cafeid } = req.query;
    console.log(cafeid);
    if(cafeid){
        const query = 'SELECT empid,e.emp_name,e.email_address,e.phone_number,DATE_FORMAT(e.hire_date, "%y-%m-%d") AS hire_date,c.name,DATEDIFF(CURDATE(), hire_date) AS days_worked FROM gic.employee e, gic.cafe c WHERE e.cafeid = c.cafeid and e.cafeid = ? ORDER BY days_worked DESC;';
        db.query(query,[cafeid],(err, results) => {
            if (err) {
              console.error('Error executing query:', err.stack);
              return res.status(500).send('Database error');
            }
            if (results.affectedRows === 0) {
              return res.status(404).send('Location not found');
            }
            res.json(results); 
        });
        
    }else{
        const query = 'SELECT empid,e.emp_name,e.email_address,e.phone_number,DATE_FORMAT(e.hire_date, "%y-%m-%d") AS hire_date,c.name,DATEDIFF(CURDATE(), hire_date) AS days_worked FROM gic.employee e, gic.cafe c WHERE e.cafeid = c.cafeid ORDER BY days_worked DESC;';
        db.query(query,(err, results) => {
            if (err) {
              console.error('Error executing query:', err.stack);
              return res.status(500).send('Database error');
            }
            if (results.affectedRows === 0) {
              return res.status(404).send('Location not found');
            }
            res.render('empbycafe', { emps: results });

        });
    }
});




//Add the employee form
app.get('/addEmployee', (req, res)=> {
    res.render('addEmployee');
});

//Get Employee List
app.get('/emplist', (req, res)=> {
    const query = 'SELECT e.empid,e.emp_name, e.email_address,e.phone_number,e.gender,e.location,DATE_FORMAT(e.hire_date, "%y-%m-%d") AS hire_date, c.name FROM gic.employee e , gic.cafe c WHERE e.cafeid = c.cafeid ORDER BY e.empid DESC';
    db.query(query, (err, results) => {
        console.log(results);
    if (err) {
      console.error('Error fetching data:', err.stack);
      res.status(500).send('Error fetching data');
      return;
    }
    res.render('empList', { emps: results });
    
  });
    //res.render('empList');
});


app.get('/editEmployee/:id', (req, res)=> {
    const empid = req.params.id;
    const query = 'SELECT empid,emp_name,gender,email_address,phone_number,DATE_FORMAT(hire_date, "%Y-%m-%d") AS hire_date,location,cafeid FROM gic.employee WHERE empid = ?';
    db.query(query, [empid], (err, results) => {
    if (err) {
      console.error('Error fetching data:', err.stack);
      res.status(500).send('Error fetching data');
      return;
    }else if(results.length > 0){
      res.render('editEmp', { emp: results[0] }); 
    }else {
        res.send('Employee not found');
    }    
  });
});



//Insert into the DB for Employess
app.post('/employee', (req, res) => {
    console.log(req.body);
   
    const uniquueempID = generateCustomUUID();
     console.log(uniquueempID);
    const {empname,empEmail,empPhone,empGender,location,cafe,hiredate} = req.body;

    const query = 'INSERT INTO gic.employee (empid,emp_name,email_address,phone_number,gender,location,cafeid,hire_date) VALUES (?,?,?,?,?,?,?,?)';

  db.query(query, [uniquueempID,empname,empEmail,empPhone,empGender,location,cafe,hiredate], (err, results) => {
    if (err) {
      console.error('Error inserting data:', err.stack);
      res.status(500).send('Error inserting data');
    } else {
      //res.status(200).send('Data inserted successfully');
      res.redirect('/emplist');
    }
  });
});


//Update the Employee
app.put('/employee/:id', (req, res)=> {
    const {empname,empEmail,empPhone,empGender,cafe,location,hiredate} = req.body;
    console.log({empname,empEmail,empPhone,empGender,cafe,location,hiredate});
    const empid = req.params.id;

    const query = 'UPDATE gic.employee SET emp_name = ?, email_address = ?, phone_number = ? , gender = ?, cafeid=?, location=?, hire_date=?  WHERE empid = ?';
     db.query(query, [empname,empEmail,empPhone,empGender,cafe,location,hiredate,empid], (err, results) => {
        //console.log(results);
    if (err) {
      console.error('Error executing query:', err.stack);
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.affectedRows === 0) {
      //return res.status(404).json({ error: 'User not found' });
        const uniquueempID = generateCustomUUID();
        const insertQuery = 'IINSERT INTO gic.employee (empid,emp_name,email_address,phone_number,gender,cafeid,location,,hire_date) VALUES (?,?,?,?,?,?,?,?)';
            db.query(insertQuery, [uniquueempID, empEmail,empPhone,empGender,cafe,location,hiredate], (err) => {
                if (err) return res.status(500).send('Database error');
                res.send('Employee created successfully');
            });
    }else{
        //res.send('Employee updated successfully');
        res.redirect('/emplist');
    }
    //res.status(200).json({ message: 'User updated successfully' });
    });

});


//Delete Employee
app.delete('/deleteEmployee/:id', (req, res)=> {
    const employeeId = req.params.id;
    console.log('employee:',employeeId);

    //unlink the image in the folder


    const query = 'DELETE FROM gic.employee WHERE empid = ?';
    db.query(query, [employeeId], (err, results) => {
    if (err) {
      console.error('Error executing query:', err.stack);
      return res.status(500).send('Database error');
    }
    if (results.affectedRows === 0) {
      return res.status(404).send('Employee not found');
    }
    res.redirect('/emplist'); // Redirect to a list of employees or another appropriate page
  });

});


app.listen(4002, ()=> {
    console.log('Server started on port 4002');
});