const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const http = require('http');
const ethersPkg = require('ethers');
const path = require('path');
const server = http.createServer(app);
const cors = require('cors');

require('dotenv').config({ path: path.resolve(__dirname, './config/dev.env') });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use(cors({
    origin: '*'
}));


app.get('/v1/address', async function ( req, res) {
    const alchemyURL = `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`;
    const ethers = new ethersPkg.providers.JsonRpcProvider(alchemyURL);
    const address = req.query.convert;
    try {
        const name = await ethers.lookupAddress(address);
        if( name && name !== null ){
            res.status(200).json({ original: address, converted: name, message: 'success'}).end()
        } else {
            res.status(200).json({ original: address, converted: name, message: 'error'}).end()
        }
    } catch (error) {
        console.log("nah bro....not working", error);
    }
    

})

app.get('/v1/ens', async function ( req, res) {
    const alchemyURL = `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`;
    const ethers = new ethersPkg.providers.JsonRpcProvider(alchemyURL);
    const address = req.query.convert;
    try {
        const name = await ethers.resolveName(address);
        if( name && name !== null ){
            res.status(200).json({ original: address, converted: name, message: 'success'}).end()
        } else {
            res.status(200).json({ original: address, converted: name, message: 'error'}).end()
        }
    } catch (error) {
        console.log("nah brozay....not working", error);
    }

})


server.listen( process.env.PORT || 5002, () => {
    console.log("server running....")
})