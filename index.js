const express = require('express');
const handlebars = require('express-handlebars');
const fileUpload = require("express-fileupload");
const cors = require('cors');
require('colors')
require('dotenv').config();
const connectToDatabase = require('./Config/Db');
const Project = require('./Routes/Projects.routes');
const Education = require('./Routes/Education.routes');
const Language = require('./Routes/Language.routes');
const Reference = require('./Routes/Reference.routes');
const workExperience = require('./Routes/workExperience.routes');
const Certificate = require('./Routes/Certificate.routes');
const Skill = require('./Routes/Skill.routes');
const UserRoute = require('./Routes/User.routes');
const { User } = require("./Models/UserModel")

console.clear()
connectToDatabase()
app = express()

app.engine('hbs', handlebars.engine({
  layoutsDir: __dirname + '/views/layouts',
  extname: 'hbs',
  helpers: {
    splitDate: function (date) {
      let month = date.getMonth() + 1;
      let year = date.getFullYear();
      return `${month}/${year}`
    }
  }
}));

app.set('view engine', 'hbs');

app.use(express.static('public'));

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  fileUpload({
    useTempFiles: true,
  })
);

app.use("/projects", Project)
app.use("/education", Education)
app.use("/workexperience", workExperience)
app.use("/skill", Skill)
app.use("/language", Language)
app.use("/reference", Reference)
app.use("/certificate", Certificate)
app.use("/user", UserRoute)


app.get('/getPublicIP', (req, res) => {
  const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  res.json({ publicIP: clientIP });
});

app.listen(process.env.PORT, () => {
  console.log(`This port is listening on http://localhost:${process.env.PORT}`.yellow);
});
