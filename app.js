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
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Example usage: sleep for 30 seconds (30000 milliseconds)

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
  (async () => {
    console.log('Starting sleep 30 seconds...');
    await sleep(30000); // 30 seconds
    console.log('Sleep finished');
  })();
  
});

// Route to fetch data and render the chart
app.get('/', async (req, res) => {
  try {
    // Read and parse the JSON file
    const jsonStringInp = readSqlFile('data1.json');
    const cleanedString = jsonStringInp.replace(/^\s+/, '').trim();

    const jsonString = cleanedString.replace(/_x0020_/g, ' ');
    console.log (jsonString);
    const jsonData = JSON.parse(jsonString);
console.log (jsonData);
    if (!jsonData) {
      res.status(500).send('Error parsing JSON');
      return;
    }

    //let data1 = [];
    let data1 = [];
    if (jsonData && jsonData.ROWSET && jsonData.ROWSET.ROW) {
      const rows = jsonData.ROWSET.ROW;
      if (Array.isArray(rows)) {
        data1 = rows.map(row => ({
          ELEMENT: row['NAME'], // Use 'NAME' from your JSON structure
          VALUE: row['CNT']    // Use 'CNT' from your JSON structure
        }));
      }
    }



    console.log("Data:", data1);

    // Render the view with the JSON data
    res.render('dashboard', { data1 });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Server Error');
  }
});

// Route to fetch data as JSON
app.get('/data-json', async (req, res) => {
    // do nothing
    });

app.listen(3001, () => {
  console.log('Server is running on http://localhost:3001');
});
