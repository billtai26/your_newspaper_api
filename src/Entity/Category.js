class Category {
    _id;
    Name;
    Status; // Thêm trường này: 'Active' hoặc 'Hidden'
    ParentId; // Dùng nếu bạn muốn phân cấp danh mục (ví dụ: Thể thao -> Bóng đá)
    constructor() { }
}
module.exports = Category;
