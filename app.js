const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
const dbPath = path.join(__dirname, "covid19India.db");

let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running At http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error ${e.message}`);
  }
};
initializeDBAndServer();

app.get(`/states/`, async (req, res) => {
  const statesQuery = `select * from state order by state_id;`;
  const dbResponse = await db.all(statesQuery);
  res.send(dbResponse);
});

app.get(`/states/:stateId/`, async (req, res) => {
  const { stateId } = req.params;
  const stateQuery = `select * from state where state_id == ${stateId}; `;
  const dbResponse = await db.get(stateQuery);
  res.send(dbResponse);
});

app.post(`/districts/`, async (req, res) => {
  const disDetails = req.body;
  const {
    district_id,
    districtName,
    state_id,
    cases,
    cured,
    active,
    deaths,
  } = disDetails;
  const distQuery = `INSERT INTO district(district_id,
    district_name,
    state_id,
    cases,
    cured,
    active,
    deaths) 
    VALUES (
      '${district_id}',
      '${districtName}', // Use the correct property name 'districtName'
      '${state_id}',
      '${cases}',
      '${cured}',
      '${active}',
      '${deaths}'
    );`;
  const dbResponse = await db.run(distQuery);
  const distId = dbResponse.lastID;
  res.send("District Successfully Added");
});
app.get(`/districts/:districtId/`, async (req, res) => {
  const { districtId } = req.params;
  const distQuery = `select * from district where district_id == ${districtId}; `;
  const dbResponse = await db.get(distQuery);
  res.send(dbResponse);
});

app.delete(`/districts/:districtId/`, async (req, res) => {
  const { districtId } = req.params;
  const distQuery = `delete from district where district_id == ${districtId}; `;
  const dbResponse = await db.run(distQuery);
  res.json("District Removed");
});

app.put(`/districts/:districtId/`, async (req, res) => {
  const { districtId } = req.params;
  const districtDetails = req.body;
  const {
    district_id,
    district_name,
    state_id,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;

  const districtQuery = `UPDATE district SET
      district_id='${district_id}',
      district_name='${district_name}',
      state_id='${state_id}',
      cases='${cases}',
      cured='${cured}',
      active='${active}',
      deaths='${deaths}'
     WHERE district_id = ${districtId};`;
  await db.run(districtQuery);
  res.json("District Details Updated");
});

app.get(`/districts/:districtId/details`, async (req, res) => {
  const { districtId } = req.params;
  const districtQuery = `
    SELECT s.state_name
    FROM state s
    INNER JOIN district d
    ON s.state_id = d.state_id
    WHERE d.district_id = ${districtId};
  `;
  const dbResponse = await db.get(districtQuery);
  res.json(dbResponse);
});

module.exports = app;
