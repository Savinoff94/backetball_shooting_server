require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mogoose = require('mongoose');
const { default: mongoose } = require('mongoose');
const router = require('./router/index');
const errorMiddleware = require('./middlewares/error-middleware');
const app = express();

const PORT = process.env.PORT || 5000;


app.use(express.json());
app.use(cookieParser());
app.use(cors({
    credentials: true,
    // origin: process.env.CLIENT_URL
    // origin: 'http://localhost:3000'
    origin: 'https://lucky-pixie-719978.netlify.app'
    // origin: '*'
}));
app.use('/api', router);

app.use(errorMiddleware);

const start = async () => {

    try {
        
        await mongoose.connect(process.env.DB_URL, {
            useNewUrlParser:true,
            useUnifiedTopology:true
        });
        app.listen(PORT, "0.0.0.0", () => console.log('Server started on port: ' + PORT));

    } catch (err) {
        
        console.log(err);
    }
}

start();