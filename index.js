const express = require('express');
const app = express();
const cors = require('cors')
const PORT = 4321 || process.env.PORT;
const path = require('path');
const Mongo = require('./Mongo/MongoInit');
const userRoutes = require('./routes/index');

Mongo();

app.use(cors());
app.use(express.json({ limit: '30mb', extended: true }));
app.use(express.urlencoded({ limit: '30mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', userRoutes);


app.get('/', (req, res)=> {
    res.send("HealthCheck Passed!")
})

app.listen(PORT, ()=>{
    console.log(`Listening to http://localhost:${PORT}`);
})