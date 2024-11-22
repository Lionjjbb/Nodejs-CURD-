var express             = require('express'),
    app                 = express(),
    passport            = require('passport'),
    FacebookStrategy    = require('passport-facebook').Strategy,
	{ MongoClient, ServerApiVersion, ObjectId } = require("mongodb"),
    session             = require('express-session'),
	formidable 			= require('express-formidable'),
	fsPromises 			= require('fs').promises;

app.set('view engine', 'ejs');

// FacebookAuth strategy
//const facebookAuth = {
//      'clientID'        : '1544657552824528', 
//      'clientSecret'    : 'd1b97cf09168eea03adc89ab0d9b11e6', 
//      'callbackURL'     : 'http://localhost:8099/auth/facebook/callback'};

// MongoDB database'message
const mongourl = 'mongodb+srv://s1288646:Aa67093524@cluster0.zvhpq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
const dbName = 'recipe_db';
const collectionName = "recipe";

// user object to be put in session (for login/logout)
var user = {};  
passport.serializeUser(function (user, done) {
    done(null, user);
});
passport.deserializeUser(function (id, done) {
    done(null, user);
});

// passport facebook strategy
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.NODE_ENV === 'production'
        ? 'https://nodejs-curd-group51.onrender.com/auth/facebook/callback'
        : 'http://localhost:8099/auth/facebook/callback',
//    "clientID"        : facebookAuth.clientID,
//    "clientSecret"    : facebookAuth.clientSecret,
//    "callbackURL"     : facebookAuth.callbackURL
  },  
  function (token, refreshToken, profile, done) {
    console.log("Facebook Profile: " + JSON.stringify(profile));
    console.log(profile);
    user = {};
    user['id'] = profile.id;
    user['name'] = profile.displayName;
    user['type'] = profile.provider;  
    console.log('user object: ' + JSON.stringify(user));
    return done(null,user);  
  })
);

// Mongodb handling functions
const client = new MongoClient(mongourl, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const insertDocument = async (db, doc) => {
    var collection = db.collection(collectionName);
    let results = await collection.insertOne(doc);
	console.log("insert one document:" + JSON.stringify(results));
    return results;
}

const findDocument = async (db, criteria) => {
    var collection = db.collection(collectionName);
    let results = await collection.find(criteria).toArray();
	console.log("find the documents:" + JSON.stringify(results));
    return results;
}

const updateDocument = async (db, criteria, updateData) => {
    var collection = db.collection(collectionName);
    let results = await collection.updateOne(criteria, { $set: updateData });
	console.log("update one document:" + JSON.stringify(results));
    return results;
}

const deleteDocument = async (db, criteria) => {
    var collection = db.collection(collectionName);
    let results = await collection.deleteMany(criteria);
	console.log("delete one document:" + JSON.stringify(results));
    return results;
}

const handle_Create = async (req, res) => {
	
		await client.connect();
		console.log("Connected successfully to server");
        const db = client.db(dbName);
        let newDoc = {
            userid: req.user.id,
            recipeid: req.fields.recipeid,
            title: req.fields.title,
            category: req.fields.category,
            cuisine_type: req.fields.cuisine_type,
            preparation_time: req.fields.preparation_time,
            ingredients: req.fields.ingredients,
            instructions: req.fields.instructions
        };

        if (req.files.filetoupload && req.files.filetoupload.size > 0) {
            const data = await fsPromises.readFile(req.files.filetoupload.path);
            newDoc.photo = Buffer.from(data).toString('base64');
        }

		await insertDocument(db, newDoc);
        res.redirect('/');

}

const handle_Find = async (req, res, criteria) => {
	
		await client.connect();
        console.log("Connected successfully to server");
		const db = client.db(dbName);
		const docs = await findDocument(db);
        res.status(200).render('list',{nrecipes: docs.length, recipes: docs, user: req.user});
	
}

const handle_Details = async (req, res, criteria) => {
	
		await client.connect();
		console.log("Connected successfully to server");
        const db = client.db(dbName);
        let DOCID = { _id: ObjectId.createFromHexString(criteria._id) };
        const docs = await findDocument(db, DOCID);
        res.status(200).render('details', { recipe: docs[0], user: req.user});
	
}

const handle_Edit = async (req, res, criteria) => {
	
		await client.connect();
		console.log("Connected successfully to server");
        const db = client.db(dbName);

        let DOCID = { '_id': ObjectId.createFromHexString(criteria._id) };
        let docs = await findDocument(db, DOCID);

        if (docs.length > 0 && docs[0].userid == req.user.id) {
            res.status(200).render('edit', { recipe: docs[0], user: req.user});
        } else {
            res.status(500).render('message', { message: 'Unable to Update - you are not recipe owner!', user: req.user});
        }
	
}

const handle_Update = async (req, res, criteria) => {
	
		await client.connect();
		console.log("Connected successfully to server");
        const db = client.db(dbName);

        const DOCID = {
            _id: ObjectId.createFromHexString(req.fields._id)
        }

        let updateData = {
            recipeid: req.fields.recipeid,
            title: req.fields.title,
            category: req.fields.category,
            cuisine_type: req.fields.cuisine_type,
            preparation_time: req.fields.preparation_time,
            ingredients: req.fields.ingredients,
            instructions: req.fields.instructions
        };

        if (req.files.filetoupload && req.files.filetoupload.size > 0) {
            const data = await fsPromises.readFile(req.files.filetoupload.path);
            updateData.photo = Buffer.from(data).toString('base64');
        }

        const results = await updateDocument(db, DOCID, updateData);
        res.status(200).render('message', {message: `Updated ${results.modifiedCount} document(s)`, user: req.user});
	
}

const handle_Delete = async (req, res) => {
	
		await client.connect();
		console.log("Connected successfully to server");
        const db = client.db(dbName);
        let DOCID = { '_id': ObjectId.createFromHexString(req.query._id) };
        let docs = await findDocument(db, DOCID);
        if (docs.length > 0 && docs[0].userid == req.user.id) {   // user object by Passport.js
            //await db.collection('recipes').deleteOne(DOCID);
			await deleteDocument(db, DOCID);
            res.status(200).render('message', { message: `recipe ID ${docs[0].recipeid} removed.`, user: req.user});
        } else {
            res.status(500).render('message', { message: 'Unable to delete - you are not recipe owner!', user: req.user});
        }
	
}
//new RESTFUL
const handle_Search = async (req, res) => {
    try {
        await client.connect();
        console.log("Connected successfully to server");
        const db = client.db(dbName);
        
        let criteria = { recipeid: req.query.recipeid };
        const docs = await findDocument(db, criteria);
        
        if (docs.length > 0) {
            // If recipe found, redirect to details page
            res.redirect(`/details?_id=${docs[0]._id}`);
        } else {
            // If recipe not found, show message
            res.status(404).render('message', { 
                message: `Recipe with ID ${req.query.recipeid} not found!`,
                user: req.user 
            });
        }
    } catch (err) {
        res.status(500).render('message', { 
            message: `Error occurred during search: ${err}`,
            user: req.user 
        });
    }
}

// Middleware 1, use formidable()
app.use(formidable());

// Middleware 1, define and use it
app.use((req,res,next) => {
    let d = new Date();
    console.log(`TRACE: ${req.path} was requested at ${d.toLocaleDateString()}`);  
    next();
});

// Middleware 2, define
const isLoggedIn = (req,res,next) => {
    if (req.isAuthenticated())
        return next();
    res.redirect('/login');
}

// Middleware 3,4,5, use
app.use(session({
    secret: "tHiSiSasEcRetStr",
    resave: true,
    saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// login page
app.get("/login", function (req, res) {
	res.status(200).render('login');
});
app.get("/auth/facebook", passport.authenticate("facebook", { scope : "email" }));
app.get("/auth/facebook/callback",
    passport.authenticate("facebook", {
        successRedirect : "/list",
        failureRedirect : "/"
}));

app.get('/', isLoggedIn, (req,res) => {
    res.redirect('/list');
})

app.get('/list', isLoggedIn, (req,res) => {
    handle_Find(req, res, req.query.docs);
})

app.get('/details',isLoggedIn, (req,res) => {
    handle_Details(req, res, req.query);
})

app.get('/edit', isLoggedIn, (req,res) => {
    handle_Edit(req, res, req.query);
})

app.post('/update', isLoggedIn, (req,res) => {
    handle_Update(req, res, req.query);
})

app.get('/create', isLoggedIn, (req,res) => {
    res.status(200).render('create',{user:req.user})
})
app.post('/create', isLoggedIn, (req, res) => {
    handle_Create(req, res);
});

app.get('/delete', isLoggedIn, (req,res) => {
    handle_Delete(req, res);
});

app.get("/logout", function(req, res) {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

app.get('/search', isLoggedIn, (req, res) => {
    if (req.query.recipeid) {
        handle_Search(req, res);
    } else {
        res.status(400).render('message', { 
            message: 'Recipe ID is required for search',
            user: req.user 
        });
    }
});
// RESTful Create


app.post('/api/recipe/:recipeid', async (req,res) => { //async programming way
    if (req.params.recipeid) {
        console.log(req.body)
		
			await client.connect();
			console.log("Connected successfully to server");
		    const db = client.db(dbName);
		    let newDoc = {
		        recipeid: req.fields.recipeid,
		        title: req.fields.title,
                category: req.fields.category,
                cuisine_type: req.fields.cuisine_type,
                preparation_time: req.fields.preparation_time,
                ingredients: req.fields.ingredients,
                instructions: req.fields.instructions};
		    if (req.files.filetoupload && req.files.filetoupload.size > 0) {
		        const data = await fsPromises.readFile(req.files.filetoupload.path);
		        newDoc.photo = Buffer.from(data).toString('base64');}
			await insertDocument(db, newDoc);
		    res.status(200).json({"Successfully inserted":newDoc}).end();
		
    } else {
        res.status(500).json({"error": "missing recipeid"});
    }
})

// RESTful Read

app.get('/api/recipe/:recipeid', async (req,res) => { //async programming way
	if (req.params.recipeid) {
		console.log(req.body)
        let criteria = {};
        criteria['recipeid'] = req.params.recipeid;
		
			await client.connect();
		    console.log("Connected successfully to server");
			const db = client.db(dbName);
			const docs = await findDocument(db, criteria);
		    res.status(200).json(docs);
		
	} else {
        res.status(500).json({"error": "missing recipeid"}).end();
    }
});

// RESTful Update
app.put('/api/recipe/:recipeid', async (req,res) => {
    if (req.params.recipeid) {
        console.log(req.body)
		let criteria = {};
        criteria['recipeid'] = req.params.recipeid;
			await client.connect();
			console.log("Connected successfully to server");
		    const db = client.db(dbName);

		

		    let updateData = {
		        recipeid: req.fields.recipeid || req.params.recipeid,
		        title: req.fields.title,
                category: req.fields.category,
                cuisine_type: req.fields.cuisine_type,
                preparation_time: req.fields.preparation_time,
                ingredients: req.fields.ingredients,
                instructions: req.fields.instructions
		    };

		    if (req.files.filetoupload && req.files.filetoupload.size > 0) {
		        const data = await fsPromises.readFile(req.files.filetoupload.path);
		        updateData.photo = Buffer.from(data).toString('base64');
		    }

		    const results = await updateDocument(db, criteria, updateData);
		    res.status(200).json(results).end();
		
    } else {
        res.status(500).json({"error": "missing recipeid"});
    }
})

// RESTful Delete

app.delete('/api/recipe/:recipeid', async (req,res) => {
    if (req.params.recipeid) {
		console.log(req.body)
		let criteria = {};
        criteria['recipeid'] = req.params.recipeid;
			await client.connect();
			console.log("Connected successfully to server");
		    const db = client.db(dbName);
		    const results = await deleteDocument(db, criteria);
            console.log(results)
		    res.status(200).json(results).end();
    } else {
        res.status(500).json({"error": "missing recipeid"});       
    }
})

// End of Restful


app.get('/*', (req,res) => {
    res.status(404).render('message', {message: `${req.path} - Unknown request!` });
})

const port = process.env.PORT || 8099;
app.listen(port, '0.0.0.0', () => {console.log(`Listening at http://localhost:${port}`);});
