const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const port = 8080;

app.use(cors());

// Route de santé
app.get('/', (req, res) => {
    res.json({ message: "API Gateway Smart Campus - Online" });
});

// POINT D'ENTRÉE UNIQUE : Redirection vers l'Orchestrateur
// Le frontend appelle : http://localhost:8080/api/orchestrator/...
// La gateway redirige vers : http://orchestrator:4000/...
app.use('/api/orchestrator', createProxyMiddleware({
    target: 'http://orchestrator:4000',
    changeOrigin: true,
    pathRewrite: {
        '^/api/orchestrator': '' // Retire le préfixe
    }
}));

app.listen(port, () => {
    console.log(`API Gateway running on port ${port}`);
});