const express = require('express');
const axios = require('axios');
const soap = require('soap');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());
const port = 4000;

// URLs des services internes (Docker)
// URLs des services internes (Docker)
const REST_URL = 'http://mobility:3001/transports';
const SOAP_URL = 'http://people:3002/wsdl?wsdl';
const GRAPHQL_URL = 'http://citizen:3003/'; // Keep service name 'citizen' for DNS, but conceptually 'student'
const GRPC_HOST = 'emergency:3004';

// Configuration gRPC
const PROTO_PATH = path.join(__dirname, 'emergency.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {});
const emergencyProto = grpc.loadPackageDefinition(packageDefinition);
const clientGrpc = new emergencyProto.emergency.EmergencyService(GRPC_HOST, grpc.credentials.createInsecure());

// --- ROUTES ---

// 1. LOGIN (Proxy vers GraphQL)
// Le frontend envoie { email, password }, l'orchestrateur traduit en Query GraphQL
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const query = `query { login(email: "${email}", password: "${password}") { id name email isAsthmatic } }`;

    try {
        const response = await axios.post(GRAPHQL_URL, { query });

        // Gestion des erreurs GraphQL
        if (response.data.errors) {
            return res.status(401).json({ error: response.data.errors[0].message });
        }
        // Renvoie l'utilisateur propre
        res.json(response.data.data.login);
    } catch (error) {
        console.error("Erreur Auth:", error.message);
        res.status(500).json({ error: "Service Authentification indisponible" });
    }
});

// 2. GET Alerts (gRPC)
app.get('/alerts', (req, res) => {
    clientGrpc.GetAlerts({}, (err, response) => {
        if (err) return res.status(500).json({ error: "Service Urgence indisponible" });
        res.json(response);
    });
});

// 3. POST Signalement (gRPC)
app.post('/report-emergency', (req, res) => {
    const { type, location, severity, description, reporter, phone, injuries } = req.body;
    clientGrpc.AddAlert({ type, location, severity, description, reporter, phone, injuries }, (err, response) => {
        if (err) return res.status(500).json({ error: "Erreur gRPC" });
        res.json(response);
    });
});

// 4. POST Plan Trip (Orchestration Complète)
app.post('/plan-trip', async (req, res) => {
    try {
        const { citizenId, destination } = req.body;

        // A. Données Citoyen (GraphQL)
        const citizenRes = await axios.post(GRAPHQL_URL, { query: `query { citizen(id: "${citizenId}") { name isAsthmatic } }` });
        const citizen = citizenRes.data.data.citizen;

        // B. Densité de population (SOAP)
        const clientSoap = await soap.createClientAsync(SOAP_URL);
        clientSoap.setEndpoint('http://people:3002/wsdl');
        const soapResult = await clientSoap.GetPeopleCountAsync({ city: destination });
        const peopleData = soapResult[0];

        // C. Alertes (gRPC)
        const allEmergencies = await new Promise((resolve, reject) => {
            clientGrpc.GetAlerts({}, (err, response) => {
                if (err) resolve([]); else resolve(response.alerts || []);
            });
        });

        const cityAlerts = allEmergencies.filter(e =>
            destination.toLowerCase().includes(e.location.toLowerCase()) ||
            e.location.toLowerCase().includes(destination.toLowerCase())
        );
        const criticalAlert = cityAlerts.find(e => e.severity === 'HIGH');

        // D. Construction des Recommandations
        let messages = [];
        let warnings = [];
        let isAlternative = false;

        if (peopleData.peopleCount > 100) {
            warnings.push(`Zone très fréquentée (Indice ${peopleData.peopleCount})`);
            if (citizen.isAsthmatic) {
                isAlternative = true;
                messages.push(`Bonjour ${citizen.name}, il y a beaucoup de monde à ${destination}. Risque pour votre asthme (stress/foule).`);
            } else {
                messages.push(`Info Affluence : La zone est très fréquentée sur le campus.`);
            }
        } else {
            if (!criticalAlert) messages.push("Conditions de voyage optimales.");
        }

        if (criticalAlert) {
            warnings.push(`Risque Sécurité`);
            messages.push(`⚠️ ATTENTION : ${criticalAlert.type} en cours à ${destination}.`);
        }

        const finalRecommendation = messages.join("\n\n");

        // E. Transports (REST)
        const transportRes = await axios.get(`${REST_URL}?destination=${encodeURIComponent(destination)}`);

        res.json({
            citizen,
            environment: {
                people_count: peopleData,
                alerts: cityAlerts,
                target_city: destination,
                requested_city: destination // Patch pour le frontend
            },
            trip_recommendation: finalRecommendation,
            warnings,
            available_transports: transportRes.data,
            is_alternative: isAlternative
        });

    } catch (error) {
        console.error("Erreur Plan Trip:", error);
        res.status(500).json({ error: error.message });
    }
});

// --- NOUVEAU: Routes Mobilité Directes ---
// Récupérer la liste des zones du campus (pour le menu déroulant dynamique)
app.get('/campus-zones', async (req, res) => {
    try {
        const response = await axios.get('http://mobility:3001/destinations');
        res.json(response.data);
    } catch (error) {
        console.error("Erreur Campus Zones:", error.message);
        res.status(500).json({ error: "Service mobilité indisponible" });
    }
});

// Récupérer tout le trafic (pour la vue 'Traffic')
app.get('/campus-transports', async (req, res) => {
    try {
        const response = await axios.get(REST_URL); // fetching all transports
        res.json(response.data);
    } catch (error) {
        console.error("Erreur Campus Transports:", error.message);
        res.status(500).json({ error: "Service mobilité indisponible" });
    }
});

// 5. POST Compare People (SOAP)
app.post('/compare-people', async (req, res) => {
    try {
        const { city1, city2 } = req.body;
        const clientSoap = await soap.createClientAsync(SOAP_URL);
        clientSoap.setEndpoint('http://people:3002/wsdl');
        const result = await clientSoap.ComparePeopleCountAsync({ city1, city2 });

        let parsedData;
        try { parsedData = JSON.parse(result[0].result); } catch (e) { parsedData = result[0]; }
        res.json(parsedData);
    } catch (error) {
        console.error("Erreur Comparaison:", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => console.log(`Orchestrator running on port ${port}`));