const express = require('express');
const getOracleConnection = require('db'); // Ensure the path is correct
const path = require('path');
const fs = require('fs');
const oracledb = require('oracledb');
const exec = require('child_process').exec;

require('dotenv').config();
const app = express();

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

const readSqlFile = (fileName) => {
  const filePath = path.join(__dirname, 'batchScript', fileName);
  console.log(filePath);
  return fs.readFileSync(filePath, 'utf8');
};

// Sleep function to pause execution for a given number of milliseconds
const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };
  
  // Example usage: sleep for 30 seconds (30000 milliseconds)
  (async () => {
    console.log('Starting sleep...');
    await sleep(30000); // 30 seconds
    console.log('Sleep finished');
  })();
  

const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbConnectString = process.env.DB_CONNECT_STRING;
console.log(`${dbUser} ${dbPassword} ${dbConnectString}`);

// Define the working directory where the batch file is located
const workingDirectory = path.join(__dirname, 'batchScript');

// Define the command to run the batch file
const command = `cmd /c run-sql.bat ${dbUser} ${dbPassword} ${dbConnectString} > commandOuttext.txt 2> commnderror.txt`;

// Execute the command in the specified working directory
exec(command, { cwd: workingDirectory }, (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
  console.error(`stderr: ${stderr}`);
});

function fixInvalidJson(jsonString) {
  // Fix the trailing commas by using regex
  const fixedJsonString = jsonString.replace(/,(\s*[\}\]])/g, '$1');

  // Parse the string to JSON (Note: This will still throw an error due to duplicate keys)
  try {
    console.log(`json: ${jsonString}`);
    const parsedJson = JSON.parse(fixedJsonString);
    console.log(`parsed json: ${fixedJsonString}`);
    return parsedJson;
  } catch (error) {
    console.log("Failed to parse JSON:", error.message);
    return null;
  }
}
sleep(30000).then(() => {
    console.log('Sleep finished');
  });
  
// Route to fetch data and render the chart
app.get('/', async (req, res) => {
  try {
    // Read and parse the JSON file
    const jsonString = readSqlFile('data1.json');



    console.log (`json string${fixedJsonString}`)
    const jsonData = JSON.parse(fixedJsonString);

    console.log(`Parsed JSON data: ${jsonData}`);
    console.log (    console.log(`Parsed JSON data: ${jsonData}`);
 );
   // const jsonData = JSON.parse(jsonString);

    //const jsonString = '{"ROWSET": {"ROW": {"NAME": "Customer Account", "CNT": "1200" }, "ROW": {"NAME": "Billing Account", "CNT": "1222" }, "ROW": {"NAME": "Contact", "CNT": "1243" }, "ROW": {"NAME": "Address", "CNT": "1000" }, "ROW": {"NAME": "Asset", "CNT": "123" }}}';
    let data1 = [];

    // Check if ROW is an array or an object
    if (Array.isArray(jsonData.ROWSET.ROW)) {
      console.log (`1.array ${jsonData}` );
      data1 = jsonData.ROWSET.ROW.map(row => ({
        ELEMENT: row.NAME,
        VALUE: row.CNT
      }));
    } else {
      for (const key in jsonData.ROWSET.ROW) {
        console.log (`2.array ${jsonData}` );
        const row = jsonData.ROWSET.ROW[key];
        data1.push({
          ELEMENT: row.NAME,
          VALUE: row.CNT
        });
      }
    }
console.log (data1 );


  console.log("Number of rows:", rowCount);
    console.log (`length is ${rowCount}`);
    
    console.log (`it is row ${rows}`);
    rows.forEach((row, index) => {
        console.log(`Row ${index + 1}: Name: ${row.NAME}, Count: ${row.CNT}`);
      });
  
      // Transform rows to the format required for the view
 
      /*
    for (const key in jsonData.ROWSET.ROW) {
        console.log (` printing while conversion ${jsonData.ROWSET.ROW[key]}`);
        const row = jsonData.ROWSET.ROW[key];
        data1.push({
          ELEMENT: row.NAME,
          VALUE: row.CNT
        });
      }
        */

      const jsonData1 = JSON.stringify(data1, null, 2); // `null` and `2` are for pretty-printing
      console.log(`looped over ${jsonData1}`);
      if (!res.headersSent) {
        res.render('dashboard', {data1  });
    }
  
});

// Route to fetch data as JSON
app.get('/data-json', async (req, res) => {
  
});

app.listen(3001, () => {
  console.log('Server is running on http://localhost:3001/data');
});
