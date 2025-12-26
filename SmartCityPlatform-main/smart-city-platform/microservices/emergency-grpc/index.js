const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

// 1. Load Proto
const PROTO_PATH = path.join(__dirname, 'emergency.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});
const emergencyProto = grpc.loadPackageDefinition(packageDefinition);

const DB_PATH = path.join(__dirname, '../../data.db');

const dbPromise = open({
  filename: DB_PATH,
  driver: sqlite3.Database
});

async function getAlerts(call, callback) {
  try {
    const db = await dbPromise;
    const rows = await db.all("SELECT * FROM alerts ORDER BY id DESC");
    callback(null, { alerts: rows });
  } catch (err) {
    console.error(err);
    callback(err);
  }
}

async function addAlert(call, callback) {
  try {
    const { type, location, severity, description, reporter, phone, injuries } = call.request;
    const db = await dbPromise;

    await db.run(
      `INSERT INTO alerts (type, location, severity, description, reporter, phone, injuries, time)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        type,
        location,
        severity,
        description || "No details",
        reporter || "Anonymous",
        phone || "Unknown",
        injuries || "None",
        new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      ]
    );

    console.log(`[gRPC] Alert received: ${type}`);
    callback(null, { success: true, message: "Alert added successfully" });
  } catch (err) {
    console.error(err);
    callback(err);
  }
}

const server = new grpc.Server();
server.addService(emergencyProto.emergency.EmergencyService.service, {
  GetAlerts: getAlerts,
  AddAlert: addAlert
});

server.bindAsync('0.0.0.0:3004', grpc.ServerCredentials.createInsecure(), () => {
  console.log('Emergency Service (gRPC) running on port 3004');
  console.log(` Connected to database at: ${DB_PATH}`);
  server.start();
});