var config = require(global.__basedir + "/src/configs/Setting.json");
const { MongoClient } = require('mongodb');

class DatabaseConnection {
    static client = null;

    // Hàm connect() được gọi từ app.js
    static async connect() {
        if (!this.client) {
            this.user = config.mongodb.username; 
            this.pass = config.mongodb.password; 
            
            // Chuỗi kết nối của bạn
            this.url = "mongodb+srv://pxanhtai:OyKKtXi2T2XszoEx@cluster0.fzxgmoh.mongodb.net/";
            
            try {
                this.client = new MongoClient(this.url);
                await this.client.connect();
                console.log("✅ DatabaseConnection: Đã kết nối thành công!");
            } catch (err) {
                console.error("❌ DatabaseConnection Lỗi:", err);
                throw err;
            }
        }
        return this.client;
    }

    // Hàm này để các Repository lấy kết nối đã mở
    static getMongoClient() {
        if (!this.client) {
            // Nếu chưa connect thì return null hoặc throw error
            console.error("⚠️ Database chưa kết nối. Hãy gọi connect() trước.");
            return null;
        }
        return this.client;
    }
}

module.exports = DatabaseConnection;
