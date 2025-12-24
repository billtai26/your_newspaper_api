class Category {
    _id;
    Name;
    ParentId; // Dùng nếu bạn muốn phân cấp danh mục (ví dụ: Thể thao -> Bóng đá)
    constructor() { }
}
module.exports = Category;
