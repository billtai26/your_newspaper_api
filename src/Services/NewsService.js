var DatabaseConnection = require(global.__basedir + '/src/Database/Database'); 
var Config = require(global.__basedir + "/src/configs/config"); 
var NewsRepository = require(global.__basedir + "/src/repositories/NewsRepository");

class NewsService {
    newsRepository;
    session;
    client;
    database;

    constructor() {
        this.client = DatabaseConnection.getMongoClient();
        this.session = this.client.startSession();
        this.database = this.client.db(Config.mongodb.database); 
        
        // Bắt đầu transaction
        this.session.startTransaction(); // [cite: 115]
        this.newsRepository = new NewsRepository(this.database, this.session); 
    }

    async insertNews(news) {
        try {
            var result = await this.newsRepository.insertNews(news);
            await this.session.commitTransaction(); 
            this.session.endSession(); 
            return true;
        } catch (error) {
            await this.session.abortTransaction();
            this.session.endSession(); 
            return false;
        }
    }

    async updateNews(news) {
        try {
            var result = await this.newsRepository.updateNews(news);
            await this.session.commitTransaction();
            this.session.endSession();
            return result;
        } catch(error) {
            await this.session.abortTransaction();
            this.session.endSession();
            return false;
        }
    }

    async deleteNews(id) {
        try {
            var result = await this.newsRepository.deleteNews(id);
            await this.session.commitTransaction(); 
            this.session.endSession(); 
            return result;
        } catch(error) {
            await this.session.abortTransaction();
            this.session.endSession();
            return false;
        }
    }

    async getNewsList() {
        // Lấy 100 tin đầu tiên
        var list = await this.newsRepository.getNewsList(0, 100);
        return list;
    }

    async getNewsWithPagination(page, limit) {
        try {
            // Chuyển đổi sang kiểu số và đặt giá trị mặc định
            const currentPage = parseInt(page) || 1;
            const itemsPerPage = parseInt(limit) || 10;
            
            // Tính số bản ghi cần bỏ qua
            const skip = (currentPage - 1) * itemsPerPage;

            // Gọi repository để lấy dữ liệu và tổng số bản ghi
            const [newsList, totalItems] = await Promise.all([
                this.newsRepository.getNewsList(skip, itemsPerPage),
                this.newsRepository.countNews()
            ]);

            const totalPages = Math.ceil(totalItems / itemsPerPage);

            return {
                data: newsList,
                pagination: {
                    totalItems,
                    totalPages,
                    currentPage,
                    itemsPerPage
                }
            };
        } catch (error) {
            console.error("Lỗi phân trang:", error);
            throw error;
        } finally {
            this.session.endSession();
        }
    }

    async getNewsById(id) {
        try {
            // Gọi hàm getNews đã có trong NewsRepository
            const result = await this.newsRepository.getNews(id);
            
            // Vì constructor của bạn startTransaction nên phải commit/abort trước khi endSession
            await this.session.commitTransaction(); 
            return result;
        } catch (error) {
            console.error("Lỗi lấy chi tiết tin:", error);
            await this.session.abortTransaction();
            throw error;
        } finally {
            this.session.endSession();
        }
    }
}
module.exports = NewsService;
