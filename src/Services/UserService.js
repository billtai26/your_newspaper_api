const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const DatabaseConnection = require('../Database/Database');
const UserRepository = require('../repositories/UserRepository');
const config = require(global.__basedir + "/src/configs/config"); // Check lại đường dẫn config

class UserService {
    constructor() {
        this.client = DatabaseConnection.getMongoClient();
        this.database = this.client.db(config.mongodb.database);
        this.userRepository = new UserRepository(this.database);
    }

    // Đăng ký
    async register(user) {
        // 1. Kiểm tra user tồn tại chưa
        const existingUser = await this.userRepository.findUserByUsername(user.Username);
        if (existingUser) {
            throw new Error("Username đã tồn tại");
        }

        // 2. Mã hóa mật khẩu
        const salt = await bcrypt.genSalt(10);
        user.Password = await bcrypt.hash(user.Password, salt);

        // 3. Lưu vào DB
        return await this.userRepository.createUser(user);
    }

    // Đăng nhập
    async login(username, password) {
        // 1. Tìm user
        const user = await this.userRepository.findUserByUsername(username);
        if (!user) {
            return null; // Sai username
        }

        // 2. Kiểm tra mật khẩu
        const isMatch = await bcrypt.compare(password, user.Password);
        if (!isMatch) {
            return null; // Sai password
        }

        // 3. Tạo Token (Payload chứa thông tin user và role)
        const payload = {
            userId: user._id,
            username: user.Username,
            role: user.Role
        };

        const token = jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn || 3600 });
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