const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const DatabaseConnection = require('../Database/Database');
const UserRepository = require('../repositories/UserRepository');
const config = require(global.__basedir + "/src/configs/config"); // Check lại đường dẫn config
const crypto = require('crypto'); // Thư viện có sẵn của Node.js
const { sendActivationEmail } = require('./MailService');

class UserService {
    constructor() {
        // Không gọi DatabaseConnection.getMongoClient() ở đây nữa
        this.userRepository = null; 
    }

    // Hàm bổ trợ để khởi tạo repository khi cần
    async _init() {
        if (!this.userRepository) {
            const client = DatabaseConnection.getMongoClient();
            if (!client) {
                throw new Error("⚠️ Database chưa kết nối. Hãy gọi connect() trước.");
            }
            const database = client.db(config.mongodb.database);
            this.userRepository = new UserRepository(database);
            this.database = database; // Dùng cho hàm activateUser
        }
    }

    // Đăng ký
    async register(user) {
        await this._init();
        // 1. Kiểm tra user tồn tại (Giữ nguyên code cũ của bạn)
        const existingUser = await this.userRepository.findUserByUsername(user.Username);
        if (existingUser) { throw new Error("Username đã tồn tại"); }

        // 2. Mã hóa mật khẩu (Giữ nguyên)
        const salt = await bcrypt.genSalt(10);
        user.Password = await bcrypt.hash(user.Password, salt);

        // --- BỔ SUNG: Tạo token và trạng thái chờ kích hoạt ---
        user.activationToken = crypto.randomBytes(32).toString('hex');
        user.isActive = false; 

        // 3. Lưu vào DB
        const savedUser = await this.userRepository.createUser(user);

        // 4. Gửi Email (Chạy bất đồng bộ, không bắt người dùng đợi mail xong mới báo thành công)
        sendActivationEmail(user.Email, user.activationToken).catch(err => console.error("Mail error:", err));

        return savedUser;
    }

    // --- BỔ SUNG: Hàm kích hoạt ---
    async activateUser(token) {
        await this._init();
        // Tìm user theo token
        const user = await this.database.collection('users').findOne({ activationToken: token });
        
        if (!user) throw new Error("Mã kích hoạt không hợp lệ.");

        // Cập nhật status
        await this.database.collection('users').updateOne(
            { _id: user._id },
            { 
                $set: { isActive: true }, 
                $unset: { activationToken: "" } // Xóa token đi
            }
        );
        return true;
    }

    // Đăng nhập
    async login(username, password) {
        await this._init();
        const user = await this.userRepository.findUserByUsername(username);
        if (!user) return null;

        if (user.isActive === false) {
            throw new Error("Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email.");
        }

        const isMatch = await bcrypt.compare(password, user.Password);
        if (!isMatch) return null;

        const payload = { userId: user._id, username: user.Username, role: user.Role };
        const token = jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
        return { token, role: user.Role };
    }

    // Lấy danh sách người dùng có phân trang
    async getUserListWithPagination(page, limit) {
        const skip = (page - 1) * limit; // Tính số bản ghi cần bỏ qua [cite: 241]
        
        // Gọi sang Repository để lấy dữ liệu
        const users = await this.userRepository.getUserList(skip, limit); 
        const total = await this.userRepository.countUsers(); // Đếm tổng số user để tính số trang
        
        return { users, total };
    }

    // Xóa người dùng
    async deleteUser(id) {
        return await this.userRepository.deleteUser(id);
    }

    // Cập nhật quyền người dùng
    async updateUserRole(id, role) {
        return await this.userRepository.updateUserRole(id, role); 
    }
}
module.exports = UserService;