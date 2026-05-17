const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // await mongoose.connect('mongodb://localhost:27017/booklend', {
        //     useNewUrlParser: true,
        //     useUnifiedTopology: true,
        // });
        await mongoose.connect(
            'mongodb://learncode10002003:TSqycXw29eMRfNwY@cluster0-shard-00-00.krbio.mongodb.net:27017,cluster0-shard-00-01.krbio.mongodb.net:27017,cluster0-shard-00-02.krbio.mongodb.net:27017/booklend?ssl=true&replicaSet=atlas-gzm0h6-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0'
        );
        console.log("Kết nối MongoDB thành công");
    } catch (err) {
        console.error("Lỗi kết nối MongoDB:", err.message);
    }
};

module.exports = connectDB;