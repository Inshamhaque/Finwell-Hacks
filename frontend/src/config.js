const Production = import.meta.PRODUCTION
export const BACKEND_URL=Production?'https://finwell-server.onrender.com':"http://localhost:3000"
console.log(BACKEND_URL)
