const express = require('express');
const app = express();
const session = require('express-session')
const port = 4000;


const routes = require("./routes/routes");
const hashedSecret = require("./crypto/crypto");

app.use(express.urlencoded({extended : true}));
app.use(express.json());

app.use(
session({
secret: hashedSecret,
resave:false,
saveUninitialized: true,
cookie: {secure: false},
})
);

app.use('/', routes);




app.listen(port, () => {
    console.log(`Express is listen on port http://localhost:${port}`)
})