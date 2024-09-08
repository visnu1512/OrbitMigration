const express = require('express');
const getOracleConnection = require('db'); // Adjust the path as needed
const path = require('path');
const fs = require('fs');
const oracledb = require('oracledb'); // Correctly import oracledb
const exec = require('child_process').exec;

require('dotenv').config();
const app = express();

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

const readSqlFile = (fileName) => {
    const filePath = path.join(__dirname, 'batchScript', fileName);
    console.log (filePath);
    return fs.readFileSync(filePath, 'utf8');
};
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbConnectString = process.env.DB_CONNECT_STRING;
console.log ( `${dbUser} ${dbPassword} ${dbConnectString} `);
// Define the working directory where the batch file is located
const workingDirectory = path.join(__dirname, '.', 'batchScript');

// Define the command to run the batch file
//const command = `cmd /c "${cmdFilePath}" ${param1} ${param2}`;
const command = `cmd /c run-sql.bat ${dbUser} ${dbPassword} ${dbConnectString}  > commandOuttext.txt 2> commnderror.txt`;
console.log 
// Execute the command in the specified working directory
exec(command, { cwd: workingDirectory }, (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}00`);
    return;
  }
  console.log(`stdout I am here: ${stdout}`);
  console.error(`stderr check: ${stderr}`);
});

function fixInvalidJson(jsonString) {
    // Fix the trailing commas by using regex
    const fixedJsonString = jsonString.replace(/,(\s*[\}\]])/g, '$1');
  
    // Parse the string to JSON (Note: This will still throw an error due to duplicate keys)
    let parsedJson;
    try {
        console.log ( `json ${jsonString}`);
      parsedJson = JSON.parse(fixedJsonString);
    
      console.log (`parsed json ${ fixedJsonString}`);
      return parsedJson;
    } catch (error) {
      console.log("Failed to parse JSON:", error.message);
      return null;
    }
}
// Route to fetch data and render the chart
app.get('/data', async (req, res) => {
    let connection;
    try {
        // Read the JSON file synchronously
        const data =JSON.stringify( readSqlFile('data1.json'));
      console.log (`printing json ${data}`)
        // Parse the JSON string
        const jsonData = JSON.parse(data);
        console.log (`printing json ${jsonData}`);
        let data1;
        if (Array.isArray(data.ROWSET.ROW)) {
            data1 = data.ROWSET.ROW.map(row => ({
              ELEMENT: row.NAME, // Rename NAME to ELEMENT
              VALUE: row.CNT // Keep CNT as VALUE
            }));
            console.log(data1);
        }
        else {
            console.error('ROW is not an array');
                console.warn("Unexpected ROW structure. 'ROW' is not an array.");
              
        }
    } catch (err) {
        console.error('Error parsing JSON:', err);
    }

           

        // Use the JSON data
       // console.log('JSON Data:', jsonData);
      } 
      

/*
    try {
        connection = await getOracleConnection();
        const sqlFileName1 = 'query1.sql';
        const sqlFileName2 = 'query2.sql';
        const sqlString1 = readSqlFile(sqlFileName1);
        const sqlString2 = readSqlFile(sqlFileName2);

     //   console.log('SQL String 1:', sqlString1);
      //  console.log('SQL String 2:', sqlString2);

        // Execute both queries
        const [result1, result2] = await Promise.all([
            connection.execute(sqlString1),
            connection.execute(sqlString2)

        ]);

        // Process the data from both queries
        const data1 = result1.rows.map(row => ({
            ELEMENT: row[0], // Adjust based on your actual query result
            VALUE: row[1]
        
        }));

        const data2 = result2.rows.map(row => ({
            ELEMENT: row[0], // Adjust based on your actual query result
            VALUE: row[1]
        
        }));
        console.log('Data from Query 1:', data1);
        console.log('Data from Query 2:', data2);

        // Render the dashboard with the fetched data
        if (!res.headersSent) {
            res.render('dashboard', { data1, data2 });
        }

    } catch (err) {
        console.error('Error:', err);
        if (!res.headersSent) {
            res.status(500).send('Server Error');
        }
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }

    */
});

// Route to fetch data as JSON
app.get('/data-json', async (req, res) => {
    let connection;
    try {
        connection = await getOracleConnection();
        const sqlFileName = 'query1.sql';
        const sqlString1 = readSqlFile(sqlFileName);

        // Execute the SQL query
       // const result = await connection.execute(sqlString, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        const result = await     connection.execute(sqlString1);
        if (!result || !result.rows) {
            throw new Error('No data returned from the query');
        }

        // Process the data
        const data = result.rows.map(row => ({
            ELEMENT: row[0], // Adjust based on your actual query result
            VALUE: row[1]
        }));

        // Send the data as JSON
        res.setHeader('Content-Type', 'application/json');
        res.json(data);

    } catch (err) {
        console.error('Error:', err);
        if (!res.headersSent) {
            res.status(500).send('Server Error');
        }
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
});

app.listen(3001, () => {
    console.log('Server is running on http://localhost:3001/data');
});
