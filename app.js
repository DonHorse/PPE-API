// Page server, API, sert à faire le lien entre le front et le back : les requêtes sql et configurations de connexion sont ici

// import des librairies
const express = require("express");
const app = express();
const mysql = require("mysql");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const bcrypt = require("bcrypt");
const {DATETIME} = require("mysql/lib/protocol/constants/types");
const saltRounds = 10;



// Paramétrages server
app.use(express.json());
app.use(cors({
        origin: ["http://localhost:3000"],
        methods: ["GET","HEAD","PUT","PATCH","POST","DELETE"],
        credentials: true,
    }
));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

//session
app.use(
    session({
        key: "userId",
        secret: "horse",
        resave: false,
        saveUninitialized: false,
        cookie: {
            expires: 60 * 60 * 24 * 7,
        },
    })
);

// Connexion à mysql
const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password:"root",
    database:"ppe2-dipss",
});



// -------------------------------------------------CRUD---------------------------------------------------------------

// --------------------------------------------CREATE / POST-----------------------------------------------------------

app.post("/DIPSS/register", (req, res) => {
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const email = req.body.email;
    const role = req.body.role;
    const password = req.body.password;

        db.query("SELECT * FROM user WHERE email = ?",
            email,
            (err, result1) => {
            if (err) {
                res.send({ message: "sql erreur" });
            }if(result1.length != 0 ) {
                console.log("doublon");
                res.send({ message: "Utilisateur déjà enregistré" });
            }else{
                console.log("aucun");
                bcrypt.hash(password, saltRounds, (err, hash) => {
                    if (err) {
                        console.log(err);
                    }
                    db.query(
                        "INSERT INTO user (first_name, last_name, email, password, role) VALUES (?,?,?,?,?)",
                        [firstname, lastname, email, hash, role],
                        (err, res) => {
                            console.log(err);
                            res.send({message : "L'utilisateur" + email + "est enregistré"})
                        }
                    );
                });
            }});
    });

app.post("/DIPSS/training/create", (req, res) => {
    const title = req.body.title;
    const objectif = req.body.objectif;
    const date = req.body.date;
    const duration = req.body.duration;
    const note = req.body.note;

    db.query(
        "INSERT INTO training (title, objectif, date, duration, validation, note) VALUES (?,?,?,?,0,?)",
        [title, objectif, date, duration, note],
        (err, res) => {
            if(err){
                console.log(err);
            }else{
                res.send(res);
            }
        }
    );
});

app.post("/DIPSS/exercise/create", (req, res) => {
    const title = req.body.title;
    const type = req.body.type;
    const image = req.body.image;
    const description= req.body.description;

    db.query(
        "INSERT INTO exercise (title, type, image, description) VALUES (?,?,?,?)",
        [title, type, image, description],
        (err, resultat) => {
            if (err) {
                console.log(err);
            }else{
                res.send({ message: "Enregistré" });
            }
        }
    );
});

app.post("/DIPSS/assignement/create", (req, res) => {
    const repetitionNumber = req.body.repetitionNumber;
    const weight = req.body.weight;
    const resistance = req.body.resistance;
    const distance = req.body.distance;
    const duration = req.body.duration;
    const rest = req.body.rest;

    db.query(
        "INSERT INTO exercise_assignment  (repetition_number, weight, resistance, distance, duration, rest) VALUES (?,?,?,?,?,?)",
        [repetitionNumber, weight, resistance, distance, duration, rest],
        (err, resultat) => {
            if (err) {
                console.log(err);
            }else{
                res.send({ message: "Enregistré" });
            }
        }
    );
});

app.post("/DIPSS/login", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    db.query(
        "SELECT * FROM user WHERE email = ?",
        email,
        (err, result) => {
            if (err) {
                res.send({ err: err });
            }

            if (result.length > 0) {
                bcrypt.compare(password, result[0].password, (error, response) => {
                    if (response) {
                        req.session.user= result;
                        console.log(req.session.user);
                        res.send(result);

                    } if (err) {
                        res.send({ message: "Mauvaise combinaison email/mot de passe" });
                    }
                });
            } else {
                res.send({ message: "Adresse mail incorrect" });
            }
        }
    );
});



// ------------------------------------------------------READ / GET----------------------------------------------------
app.get("/", (req, res) => {
    res.send('Server started')
});

app.get("/DIPSS/training-list", (req, res) => {
    db.query("SELECT * FROM training ORDER BY date DESC",
        (err, result) => {
            if (err){
                console.log(err);
            }else {
                res.send(result);
            }
        })
});

app.get("/DIPSS/login", (req, res) => {
    if (req.session.user) {
        res.send({ loggedIn: true, user: req.session.user });
    } else {
        res.send({ loggedIn: false });
    }
});

app.get('/DIPSS/logout',(req,res) => {
    req.session.destroy();
    res.clearCookie("userId");
    res.send({ loggedIn: false });
});

app.get('/DIPSS/profile', (req, res) => {
    const userId = req.session.user[0].id;

    db.query(`SELECT * FROM profil WHERE id_user = ?`,userId,
        (err, result) => {
            if (err){
                console.log(err);
            }else {
                res.send(result);
            }
        })
    });

// -----------------------------------------------------UPDATE / PUT---------------------------------------------------

app.put("/DIPSS/profile/update", (req, res) => {
    const userId = req.session.user[0].id;
    const gender = req.body.gender;
    const birthday = req.body.birthday;
    const weight = req.body.weight;
    const height = req.body.height;
    const contraindication = req.body.contraindication;
    const note = req.body.note;
    const img = req.body.img;


    db.query("UPDATE profil SET gender = ?, birthday = ?, height = ?, weight = ?, contraindication = ?, note = ?, image = ? WHERE id_user = ?",
        [gender,birthday,height,weight,contraindication,note,img,userId],
        (err, result) => {
            if (err) {
                console.log(err);
            }else
                res.send(result);
        });
});


/* code pour mass change infos page:

app.put("/api/homeModif", (req, res) => {
    const bodyTitle = req.body.bodyTitle;
    const body1 = req.body.body1;
    const footer1 = req.body.footer1;
    const footer2 = req.body.footer2;
    const footer3 = req.body.footer3;


    db.query("UPDATE info_page SET bodyTitle = ?, body1 = ?, footer1 = ?, footer2 = ?, footer3 = ? WHERE id = 1",
        [bodyTitle, body1, footer1, footer2, footer3],
        (err, result) => {
        if (err) {
            console.log(err);
        }else
            res.send(result);
    });
});
*/

// ----------------------------------------------------DELETE / DELETE-------------------------------------------------



//END CRUD


//PORT SERVER API
app.listen(3001, () => {
    console.log("server on port 3001");
});