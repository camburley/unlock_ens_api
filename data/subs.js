module.exports = {
    save: async ( req, res, name, email, twitter, ens, number  ) => {
        async function startFirebase() {
            const admin = require('firebase-admin');
            console.log("starting firebase stuff...")
    
            if (admin.apps.length == 0) {
              admin.initializeApp({
                credential: admin.credential.cert({
                "type": process.env.service_account,
                "project_id": process.env.project_id,
                "private_key_id": process.env.private_key_id,
                "private_key": process.env.private_key.replace(/\\n/g, '\n'),
                "client_email": process.env.client_email,
                "client_id": process.env.client_id,
                "auth_uri": process.env.auth_uri,
                "token_uri": process.env.token_uri,
                "auth_provider_x509_cert_url": process.env.auth_provider_x509_cert_url,
                "client_x509_cert_url": process.env.client_x509_cert_url
                })
              });
              const _db = admin.firestore()
              console.log("💎db", _db)
              return _db
            } else {
                const _db = admin.firestore()
                console.log("💎db", _db)
                return _db
            }
          }

          const db = await startFirebase();
          const usersRef = db.collection("subscriptions");
          
          const dateSaved = new Date();
          const data = { name, ens, email, twitter, number, dateSaved }

          const doesEmailMatch = await usersRef.where('email', '==' , email).get();
          const doesEnsMatch = await usersRef.where('ens', '==' , ens).get();
          const doesNumberMatch = await usersRef.where('number', '==' , number).get();
          const doesTwitterMatch = await usersRef.where('twitter', '==' , twitter).get();
          const filteredByThisEmail = doesEmailMatch.docs.map( doc => doc.data() );
          const filteredByThisEns = doesEnsMatch.docs.map( doc => doc.data() );
          const filteredByThisNumber = doesNumberMatch.docs.map( doc => doc.data() );
          const filteredByThisTwitter = doesTwitterMatch.docs.map( doc => doc.data() );

            if(filteredByThisEmail.length >= 1 ){
                await res.status(302).json({ msg_code: 1, message: 'Good news! we already have this email address saved'}).end();
                return res.status(200).json({ msg_code: 0, message: 'Success!', data: data }).end();
            } else if ( filteredByThisEns.length >= 1) {
                await res.status(302).json({ msg_code: 1, message: 'Looks like this ens is already saved. Please save an email address with another ens'}).end()
                return res.status(200).json({ msg_code: 0, message: 'Success!', data: data }).end();
            } else if( filteredByThisNumber.length >= 1){
                await res.status(302).json({ msg_code: 1, message: 'Looks like this Number is already saved. Please retry'}).end()
                return res.status(200).json({ msg_code: 0, message: 'Success!', data: data }).end();
            } else if( filteredByThisTwitter.length >= 1) {
                await res.status(302).json({ msg_code: 1, message: 'Looks like this Twitter is already saved. Please retry'}).end()
                return res.status(200).json({ msg_code: 0, message: 'Success!', data: data }).end();
            }
             else {
                await usersRef.add(data);
                return res.status(200).json({ msg_code: 0, message: 'Success!', data: data }).end();
            }
        
    }
}