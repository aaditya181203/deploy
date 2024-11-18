let IS_PROD = true;
const server = IS_PROD
  ? "https://deploy-1-gp6m.onrender.com"
  : "http://localhost:8000";


export default server;
