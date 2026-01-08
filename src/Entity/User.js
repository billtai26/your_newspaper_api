class User {
    _id;
    Username;
    Password; // Sẽ lưu dạng mã hóa (hash)
    Role;     // 'admin' hoặc 'user'
    Email;
    // Thêm vào schema trong User.js
    isActive = false; 
    activationToken = null;
    constructor() {}
}
module.exports = User;
