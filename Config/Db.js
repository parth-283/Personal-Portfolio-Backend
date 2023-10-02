const mongoose = require('mongoose');


const connectionParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}

const connectToDatabase = async () => {
    try {
        await mongoose.connect(process.env.URI, connectionParams);
        console.log('Connected to the database.'.underline.green);
    } catch (error) {
        console.error('Error connecting to the database:'.underline.red, error);
    }
};

module.exports = connectToDatabase;