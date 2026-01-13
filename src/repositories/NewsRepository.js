var ObjectId = require('mongodb').ObjectId; 

class NewsRepository {
    context;
    session;
    
    constructor(context, session = null) {
        this.context = context; 
        this.session = session;
    }

    // Thêm tin tức
    async insertNews(news) {
        var session = this.session;
        // Tự động gán ngày tạo bài viết khi thêm mới
        news.CreatedAt = new Date(); 
        // Đảm bảo CategoryId là ObjectId để lookup hoạt động chính xác
        if (news.CategoryId) news.CategoryId = new ObjectId(news.CategoryId);
        
        return await this.context.collection("news").insertOne(news, { session });
    }

    // Cập nhật tin tức
    async updateNews(news) {
        var session = this.session;
        // Sử dụng updateOne với $set và ObjectId giống mẫu
        return await this.context.collection("news").updateOne(
            { "_id": new ObjectId(news._id) },
            { $set: news },
            { session }
        );
    }

    // Xóa tin tức
    async deleteNews(id) {
        var session = this.session;
        // Sử dụng deleteOne giống mẫu
        return await this.context.collection("news").deleteOne(
            { "_id": new ObjectId(id) },
            { session }
        );
    }

    // Lấy danh sách tin tức
    async getNewsList(skip, take, filters = {}) {
        const { search, categoryId } = filters;
        const query = {};

        if (search) {
            query.Title = { $regex: search, $options: 'i' };
        }

        if (categoryId && categoryId !== "") {
            // SỬA TẠI ĐÂY: Tìm kiếm khớp với cả kiểu String hoặc ObjectId để tránh lỗi dữ liệu cũ/mới
            query.CategoryId = { 
                $in: [categoryId, new ObjectId(categoryId)] 
            };
        }

        const pipeline = [
            { $match: query }, // BƯỚC NÀY THỰC HIỆN VIỆC LỌC
            {
                $lookup: {
                    from: "category",
                    localField: "CategoryId",
                    foreignField: "_id",
                    as: "cat_info"
                }
            },
            { $unwind: { path: "$cat_info", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 1, Title: 1, Author: 1, Content: 1, Image: 1,
                    Views: 1, CreatedAt: 1, CategoryId: 1,
                    CategoryName: "$cat_info.Name"
                }
            },
            { $sort: { CreatedAt: -1 } },
            { $skip: skip },
            { $limit: take }
        ];

        return await this.context.collection("news").aggregate(pipeline).toArray();
    }

    // Đếm tổng số lượng tin tức để tính tổng số trang
    async countNews(filters = {}) {
        const { search, categoryId } = filters;
        const query = {};
        if (search) query.Title = { $regex: search, $options: 'i' };
        
        if (categoryId && categoryId !== "") {
            query.CategoryId = { 
                $in: [categoryId, new ObjectId(categoryId)] 
            };
        }

        return await this.context.collection("news").countDocuments(query);
    }
    
    // Lấy chi tiết 1 tin
    async getNews(id){
        return await this.context.collection("news").findOne({"_id": new ObjectId(id) },{});
    }

    async getNewsById(id) {
        const db = await DatabaseConnection.getDb();
        const { ObjectId } = require('mongodb');
        // Tìm kiếm trong collection 'news' (hoặc tên collection của bạn) theo _id
        return await db.collection("news").findOne({ _id: new ObjectId(id) });
    }
}

module.exports = NewsRepository;
