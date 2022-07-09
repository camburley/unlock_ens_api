const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const http = require('http');
const origins = require('./helper/origins');
const ethers = require('ethers');
const alchemyKey = `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`
const provider = new ethers.providers.JsonRpcProvider(alchemyKey)
const path = require('path');
const server = http.createServer(app)
const cors = require('cors');

require('dotenv').config({ path: path.resolve(__dirname, './config/dev.env') })

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// HEADER 

app.use(function (err, req, res, next) {
    const allowedOrigins = origins.allow()
    const origin =  req.headers.origin || "localhost:5007"
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin ); 
    }
   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
   res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type'); 
   res.setHeader('Access-Control-Allow-Credentials', true);
   if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
     console.error(err);
     return res.status(400).send({ status: 404, message: err.message }); // Bad request
 }
   next();
});

app.use(cors({
 origin: '*'
}));


app.get('/v1/address', async function ( req, res ) {
    const alchemyKey = `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`
    const provider = new ethers.providers.JsonRpcProvider(alchemyKey);
    const address = req.query.convert
    await provider.ready;
    try {
        var name = await provider.lookupAddress(address);
        if(name){
             res.status(200).json({ original: address, resolved: name, message: 'success'}).end();
        } else {
            return res.status(200).json({ original: address, resolved: name, message: 'error'}).end();
        }
    } catch (error) {
        console.log("nah brah, not working....", error);
        
    }


});


app.get('/v1/ens', async function ( req, res ) {
    const alchemyKey = `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`
    const provider = new ethers.providers.JsonRpcProvider(alchemyKey);
    const address = req.query.convert
    try {
        const name = await provider.resolveName(address);
        console.log("name", name)
        if(name && name !== null ){
             res.status(200).json({ original: address, converted: name, message: 'success'}).end()
        } else {
            return res.status(200).json({ original: address, converted: name, message: 'error'}).end()
        }
    } catch (error) {
        console.log("nah brozay, not working....", error);
    }


});



server.listen(process.env.PORT || 5002, () => {
    console.log("server listening on 5002");
});

