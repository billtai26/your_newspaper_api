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
        // 1. Đếm tổng số danh mục để phân trang
        const total = await this.context.collection("category").countDocuments(query);
        
        // 2. Sử dụng Aggregate để đếm số bài viết thuộc danh mục
        const pipeline = [
            { $match: query },
            {
                $lookup: {
                    from: "news",           // Tên collection chứa bài viết
                    localField: "_id",      // Trường ID của danh mục
                    foreignField: "CategoryId", // Trường ID danh mục lưu trong bài viết
                    as: "articles"          // Tên mảng chứa các bài viết tìm được
                }
            },
            {
                $addFields: {
                    NewsCount: { $size: "$articles" } // Tạo trường NewsCount = độ dài mảng articles
                }
            },
            {
                $project: { articles: 0 } // Loại bỏ mảng articles để dữ liệu trả về nhẹ hơn
            },
            { $skip: skip },
            { $limit: take }
        ];

        const data = await this.context.collection("category").aggregate(pipeline).toArray();

        return { data, total };
    }
}
module.exports = CategoryRepository;