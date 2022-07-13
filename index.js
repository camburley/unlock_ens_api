const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const http = require('http');
const ethersPkg = require('ethers');
const path = require('path');
const server = http.createServer(app);
const cors = require('cors');
const Mixpanel = require('mixpanel');
const admin = require('firebase-admin');
const subs = require('./data/subs');


require('dotenv').config({ path: path.resolve(__dirname, './config/dev.env') });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use(cors({
    origin: '*'
}));


app.get('/v1/address', async function ( req, res) {
    const firstPartyDataMixpanel = process.env.MIXPANEL_PROJECT_TOKEN
        var mixpanel = Mixpanel.init( firstPartyDataMixpanel, {
        protocol: 'https'
    });

    const alchemyURL = `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`;
    const ethers = new ethersPkg.providers.JsonRpcProvider(alchemyURL);
    const address = req.query.convert;

    async function mixpanelTrack(address, converted ){
        return mixpanel.track('ens requested', {
           address: address,
           converted: converted,
       });
     }
    try {
        const name = await ethers.lookupAddress(address);
        if( name && name !== null ){
            mixpanelTrack(address, name);
            res.status(200).json({ original: address, converted: name, message: 'success'}).end()
        } else {
            mixpanelTrack(address, 'null');
            res.status(200).json({ original: address, converted: name, message: 'error'}).end()
        }
    } catch (error) {
        console.log("nah bro....not working", error);
    }
    

})

app.get('/v1/ens', async function ( req, res) {
    const firstPartyDataMixpanel = process.env.MIXPANEL_PROJECT_TOKEN
        var mixpanel = Mixpanel.init( firstPartyDataMixpanel, {
        protocol: 'https'
    });

    const alchemyURL = `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`;
    const ethers = new ethersPkg.providers.JsonRpcProvider(alchemyURL);
    const address = req.query.convert;
    async function mixpanelTrack(address, converted ){
        return mixpanel.track('address requested', {
           ens: address,
           converted: converted,
       });
     }
    try {
        const name = await ethers.resolveName(address);
        if( name && name !== null ){
            mixpanelTrack(address, name);
            res.status(200).json({ original: address, converted: name, message: 'success'}).end()
        } else {
            mixpanelTrack(address, 'null');
            res.status(200).json({ original: address, converted: name, message: 'error'}).end()
        }
    } catch (error) {
        console.log("nah brozay....not working", error);
    }

})

app.post('/v1/add', async function ( req, res ) {
    const ens = req.body.ens
    const number = req.body.number 
    const email = req.body.email
    const name = req.body.name 
    const twitter = req.body.twitter 

    if(ens === undefined || email === undefined  ){
        return res.status(400).json({ msg_code: 1, message: 'subscriptions must include email address and ens appended to the body. Add both and retry.'})
        } else if( validateEmail(email) === false ) {
        return res.status(400).json({ msg_code: 1, message: 'A valid email address is required. Please append a valid email and retry.'})
    };

 
    function validateEmail (email)
    {
        let regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (email.match(regexEmail)) {
        return true; 
        } else {
        return false; 
        }
    }
  
    await subs.save(req, res, name, email, twitter, ens, number);
});


server.listen( process.env.PORT || 5002, () => {
    console.log("server running....")
})