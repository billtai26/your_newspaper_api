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
            { $set: { Name: category.Name, ParentId: category.ParentId } }, 
            { session }
        ); 
    }

    // Xóa danh mục
    async deleteCategory(id) {
        var session = this.session;
        return await this.context.collection("category").deleteOne({ "_id": new ObjectId(id) }, { session }); 
    }

    // Lấy danh sách danh mục có phân trang
    async getCategoryList(skip, take) {
        const cursor = await this.context.collection("category").find({}, {}).skip(skip).limit(take);
        return await cursor.toArray();
    }
}
module.exports = CategoryRepository;