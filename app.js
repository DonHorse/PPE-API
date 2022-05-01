// Page server, API, sert à faire le lien entre le front et le back : les requêtes sql et configurations de connexion sont ici

// import des librairies
import express from "express";
const app = express();
import mysql from "mysql";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import session from "express-session";
import bcrypt from "bcrypt";
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
            expires: 60 * 60 * 24 * 10,
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
            }if(result1.length !== 0 ) {
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
                        (err) => {
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
        (err, result) => {
            if(err){
                console.log(err);
            }else{
                res.send(result);
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
        (err) => {
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
    const idTraining = req.body.idTraining;

    db.query(
        "INSERT INTO exercise_assignment  (repetition_number, weight, resistance, distance, duration, rest,id_training) VALUES (?,?,?,?,?,?,?)",
        [repetitionNumber, weight, resistance, distance, duration, rest, idTraining],
        (err) => {
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
            if (typeof(result) != "undefined" && result.length > 0) {
                bcrypt.compare(password, result[0].password, (error, response) => {
                    if (response) {
                        req.session.user= result;
                        console.log(req.session.user);
                        res.send(result);
                    } if (error) {
                        res.send({ message: "Mauvaise combinaison email/mot de passe" });
                    }
                });
            }else {
                res.send({ message: "Adresse mail incorrect" });
            }
        }
    );
});

app.post("/DIPSS/training/assign/exercise", (req, res) => {
    const id_training = req.body.id_training;
    const id_exercise = req.body.id_exercise;

    db.query("INSERT INTO training_exercise (id_training, id_exercise) VALUES (?,?) ", [id_training, id_exercise],
        (err) => {
            if (err) {
                console.log(err);
            }else
                res.send({message : "Enregitré"});
        });
});

app.post("/DIPSS/exercise/assign/exerciseAssignment", (req, res) => {
    const id_assignment = req.body.id_assignment;
    const id_exercise = req.body.id_exercise;

    db.query("INSERT INTO exercise_exercise_assignment (id_exercise_assignment, id_exercise) VALUES (?,?) ", [id_assignment, id_exercise],
        (err) => {
            if (err) {
                console.log(err);
            }else
                res.send({message : "Enregitré"});
        });
});

app.post("/DIPSS/exercise-list/training", (req, res) => {

    const id_tr = req.body.id_tr;

    db.query("SELECT * FROM exercise LEFT JOIN training_exercise ON exercise.id=training_exercise.id_exercise WHERE training_exercise.id_training = ?",
        [id_tr],
        (err, result) => {
            if (err){
                console.log(err);
            }else {
                console.log(result);
                res.send(result);
            }
        })
});

app.post("/DIPSS/exercise-assignment-list/exercise-tr", (req, res) => {

    const id_tr = req.body.id_tr;
    const id_ex = req.body.id_ex;

    console.log(id_tr,id_ex);
    db.query("SELECT * FROM exercise_assignment LEFT JOIN exercise_exercise_assignment ON exercise_assignment.id=exercise_exercise_assignment.id_exercise_assignment WHERE exercise_exercise_assignment.id_exercise=? AND id_training = ? LIMIT 1",
        [id_ex, id_tr],
        (err, result) => {
            if (err){
                console.log(err);
            }else {
                res.send(result);
                console.log(result);
            }
        })
});


// ------------------------------------------------------READ / GET----------------------------------------------------
app.get("/", (req, res) => {
    res.send('Server started')
});

app.get("/DIPSS/training-list/user", (req, res) => {
    const id_user = req.session.user[0].id;
    db.query("SELECT * FROM training WHERE id_user = ? ORDER BY date DESC",[id_user],
        (err, result) => {
            if (err){
                console.log(err);
            }else {
                res.send(result);

            }
        })
});


app.get("/DIPSS/exercise-assignment-list/exercise", (req, res) => {

    const id_exercise = req.body.id_exercise;

    db.query("SELECT * FROM exercise_assignment LEFT JOIN exercise_exercise_assignment ON exercise_assignment.id=exercise_exercise_assignment.id_exercise_assignment WHERE exercise_exercise_assignment.id_exercise=?",
        [id_exercise],
        (err, result) => {
            if (err){
                console.log(err);
            }else {
                res.send(result);
            }
        })
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

app.get("/DIPSS/exercise-list", (req, res) => {
    db.query("SELECT * FROM exercise",
        (err, result) => {
            if (err){
                console.log(err);
            }else {
                res.send(result);
            }
        })
});

app.get("/DIPSS/user-list", (req, res) => {
    db.query("SELECT * FROM user ORDER BY last_name DESC",
        (err, result) => {
            if (err){
                console.log(err);
            }else {
                res.send(result);
            }
        })
});

app.get("/DIPSS/assignment-list", (req, res) => {
    db.query("SELECT * FROM exercise_assignment",
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
app.put("/DIPSS/training/validation", (req, res) => {
    const id_training = req.body.id_training;
    res.send("ok");
    db.query("UPDATE training SET validation = 1 WHERE id = ? ", id_training,
        (err, result) => {
            if (err) {
                console.log(err);
            }else
                console.log(result);
        });
});



app.put("/DIPSS/training/assign/user", (req, res) => {
    const id_training = req.body.id_training;
    const id_user = req.body.id_user;

    db.query("UPDATE training SET id_user = ? WHERE id = ? ", [id_user, id_training],
        (err) => {
            if (err) {
                console.log(err);
            }else
                console.log(res);
        });
});


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
            } else {
                res.send(result);
            }
        });
});



// ----------------------------------------------------DELETE / DELETE-------------------------------------------------


//END CRUD


//PORT SERVER API
export default app.listen(3001, () => {
    console.log("server on port 3001");
});