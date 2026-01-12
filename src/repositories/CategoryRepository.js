var ObjectId = require('mongodb').ObjectId;

class CategoryRepository {
    constructor(context, session = null) {
        this.context = context;
        this.session = session;
    }

    // Thêm danh mục mới
    async insertCategory(category) {
        var session = this.session;
        return await this.context.collection("category").insertOne(category, { session });
    }

    // Cập nhật danh mục
    async updateCategory(category) {
        var session = this.session;
        return await this.context.collection("category").updateOne(
            { "_id": new ObjectId(category._id) }, 
            { $set: { 
                Name: category.Name, 
                ParentId: category.ParentId,
                Status: category.Status
             } }, 
            { session }
        ); 
    }

    // Xóa danh mục
    async deleteCategory(id) {
        var session = this.session;
        return await this.context.collection("category").deleteOne({ "_id": new ObjectId(id) }, { session }); 
    }

    // Lấy danh sách danh mục có phân trang
    async getCategoryList(skip, take, query = {}) {
        // 1. Đếm tổng số danh mục thỏa mãn điều kiện
        const total = await this.context.collection("category").countDocuments(query);
        
        // 2. Lấy dữ liệu trang hiện tại
        const cursor = await this.context.collection("category")
            .find(query)
            .skip(skip)
            .limit(take);
        const data = await cursor.toArray();

        // TRẢ VỀ ĐỐI TƯỢNG (Thay vì mảng)
        return { data, total };
    }
}
module.exports = CategoryRepository;