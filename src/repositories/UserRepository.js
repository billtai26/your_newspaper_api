var ObjectId = require('mongodb').ObjectId;

class UserRepository {
    context;
    session;

    constructor(context, session = null) {
        this.context = context;
        this.session = session;
    }

    async createUser(user) {
        // Mặc định role là user nếu không có
        if (!user.Role) user.Role = 'user';
        return await this.context.collection("users").insertOne(user, { session: this.session });
    }

    async findUserByUsername(username) {
        return await this.context.collection("users").findOne({ "Username": username });
    }

    // Lấy danh sách user kèm phân trang [cite: 242]
    async getUserList(skip, limit) {
        return await this.context.collection("users").find({}, { projection: { Password: 0 } }) // Không lấy password
            .skip(skip)
            .limit(limit)
            .toArray();
    }

    // Đếm tổng số user
    async countUsers() {
        return await this.context.collection("users").countDocuments();
    }

    // Xóa user theo ID
    async deleteUser(id) {
        return await this.context.collection("users").deleteOne({ "_id": new ObjectId(id) });
    }

    // Cập nhật Role
    async updateUserRole(id, role) {
        return await this.context.collection("users").updateOne(
            { "_id": new ObjectId(id) },
            { $set: { Role: role } }
        );
    }
}
module.exports = UserRepository;
