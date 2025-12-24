class User {
    _id;
    Username;
    Password; // Sẽ lưu dạng mã hóa (hash)
    Role;     // 'admin' hoặc 'user'
    Email;
    constructor() {}
}
module.exports = User;
