const soap = require('soap');
const express = require('express');
const fs = require('fs');

const app = express();
const port = 3002;

// Fonction utilitaire (Logique métier)
function calculatePeopleCount(city) {
    city = city || "";
    let baseCount = 50;

    // 1. ZONES DENSES (Forte Affluence)
    if (["Cafétéria Sud", "Cafétéria Nord", "Amphithéâtre Principal", "Gymnase", "Résidence A", "Résidence B"].includes(city)) {
        baseCount = 145;
    }
    // 2. ZONES CALMES
    else if (["Bibliothèque Centrale", "Espace Vert", "Centre Médical", "Laboratoires Sciences", "Auditorium"].includes(city)) {
        baseCount = 30;
    }
    // 3. LE RESTE (Couloirs, Parking...)
    else {
        baseCount = 75;
    }

    const finalCount = baseCount + Math.floor(Math.random() * 20) - 10;

    let statusText = "Faible";
    if (finalCount > 50) statusText = "Modéré";
    if (finalCount > 100) statusText = "peuplé";
    if (finalCount > 150) statusText = "très peuplé";

    return { peopleCount: finalCount, status: statusText };
}

const serviceObject = {
    PeopleService: {
        PeoplePort: {

            GetPeopleCount: function (args) {
                console.log(` [SOAP] GetPeopleCount appelé pour : ${args.city}`);
                const result = calculatePeopleCount(args.city);
                return result;
            },

            ComparePeopleCount: function (args) {
                console.log("============================================");
                console.log(" [SOAP] ComparePeopleCount appelé !");
                console.log(" Args reçus :", JSON.stringify(args));

                try {
                    // Vérification des arguments
                    if (!args || !args.city1 || !args.city2) {
                        console.error(" [SOAP] Erreur : Villes manquantes dans la requête");
                        throw new Error("Les paramètres city1 et city2 sont requis");
                    }

                    const data1 = calculatePeopleCount(args.city1);
                    const data2 = calculatePeopleCount(args.city2);

                    console.log(` Calcul 1 (${args.city1}): ${data1.peopleCount}`);
                    console.log(` Calcul 2 (${args.city2}): ${data2.peopleCount}`);

                    const comparisonResult = {
                        city1: { name: args.city1, ...data1 },
                        city2: { name: args.city2, ...data2 },
                        winner: data1.peopleCount < data2.peopleCount ? args.city1 : args.city2,
                        diff: Math.abs(data1.peopleCount - data2.peopleCount)
                    };

                    const jsonResponse = JSON.stringify(comparisonResult);
                    console.log(" Réponse renvoyée :", jsonResponse);

                    return {
                        result: jsonResponse
                    };

                } catch (error) {
                    console.error(" [SOAP] ERREUR INTERNE :", error.message);
                    // On renvoie une erreur SOAP propre
                    throw {
                        Fault: {
                            Code: { Value: "Soap:Server", Subcode: { Value: "rpc:BadArguments" } },
                            Reason: { Text: "Processing Error: " + error.message }
                        }
                    };
                }
            }
        }
    }
};

try {
    const xml = fs.readFileSync('service.wsdl', 'utf8');
    app.listen(port, function () {
        console.log(` People Service (SOAP) en écoute sur le port ${port}`);
        soap.listen(app, '/wsdl', serviceObject, xml, function () {
            console.log(' Serveur SOAP initialisé avec succès.');
        });
    });
} catch (e) {
    console.error(" ERREUR FATALE au démarrage du SOAP :", e);
}
//http://localhost:3002/wsdl?wsdl