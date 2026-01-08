const nodemailer = require('nodemailer');

const sendActivationEmail = async (userEmail, token) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER, // Email của bạn
            pass: process.env.EMAIL_PASS  // App Password 16 ký tự
        }
    });

    const activationUrl = `${process.env.FRONTEND_URL}/activate/${token}`;

    const mailOptions = {
        from: '"Your Newspaper" <no-reply@yournewspaper.com>',
        to: userEmail,
        subject: 'Kích hoạt tài khoản của bạn - Your Newspaper',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        background-color: #f5f7fa;
                        line-height: 1.6;
                        color: #333;
                    }
                    
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        border-radius: 8px;
                        overflow: hidden;
                        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    }
                    
                    .header {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        padding: 40px 20px;
                        text-align: center;
                        color: white;
                    }
                    
                    .header h1 {
                        font-size: 28px;
                        margin-bottom: 10px;
                        font-weight: 600;
                    }
                    
                    .header p {
                        font-size: 14px;
                        opacity: 0.9;
                    }
                    
                    .content {
                        padding: 40px 30px;
                    }
                    
                    .content h2 {
                        font-size: 20px;
                        color: #333;
                        margin-bottom: 15px;
                    }
                    
                    .welcome-text {
                        font-size: 16px;
                        color: #555;
                        margin-bottom: 25px;
                    }
                    
                    .highlight-box {
                        background-color: #f0f4ff;
                        border-left: 4px solid #667eea;
                        padding: 15px;
                        margin: 20px 0;
                        border-radius: 4px;
                    }
                    
                    .button-container {
                        text-align: center;
                        margin: 30px 0;
                    }
                    
                    .activation-button {
                        display: inline-block;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 14px 40px;
                        text-decoration: none;
                        border-radius: 6px;
                        font-weight: 600;
                        font-size: 16px;
                        transition: transform 0.2s, box-shadow 0.2s;
                        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                    }
                    
                    .activation-button:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
                    }
                    
                    .alt-link {
                        margin-top: 20px;
                        font-size: 13px;
                        color: #888;
                    }
                    
                    .alt-link a {
                        color: #667eea;
                        text-decoration: none;
                    }
                    
                    .divider {
                        height: 1px;
                        background-color: #e0e0e0;
                        margin: 30px 0;
                    }
                    
                    .footer {
                        background-color: #f8f9fa;
                        padding: 25px 30px;
                        border-top: 1px solid #e0e0e0;
                        font-size: 12px;
                        color: #888;
                    }
                    
                    .footer-text {
                        margin-bottom: 10px;
                        line-height: 1.8;
                    }
                    
                    .footer-links {
                        text-align: center;
                        margin-top: 15px;
                    }
                    
                    .footer-links a {
                        color: #667eea;
                        text-decoration: none;
                        margin: 0 10px;
                    }
                    
                    .security-note {
                        background-color: #fff3cd;
                        border-left: 4px solid #ffc107;
                        padding: 12px;
                        margin: 20px 0;
                        border-radius: 4px;
                        font-size: 13px;
                        color: #856404;
                    }
                    
                    .step-list {
                        background-color: #f9f9f9;
                        padding: 15px;
                        border-radius: 4px;
                        margin: 15px 0;
                    }
                    
                    .step-list ol {
                        margin-left: 20px;
                    }
                    
                    .step-list li {
                        margin-bottom: 8px;
                        color: #555;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>📰 Your Newspaper</h1>
                        <p>Chào mừng bạn tham gia cộng đồng</p>
                    </div>
                    
                    <div class="content">
                        <h2>Xác nhận tài khoản của bạn</h2>
                        
                        <p class="welcome-text">
                            Chào bạn! Cảm ơn bạn đã đăng ký tài khoản trên <strong>Your Newspaper</strong>. 
                            Để hoàn tất quá trình đăng ký, vui lòng xác nhận địa chỉ email của bạn.
                        </p>
                        
                        <div class="highlight-box">
                            <strong>⏱️ Lưu ý:</strong> Liên kết kích hoạt sẽ hết hạn trong <strong>24 giờ</strong>. 
                            Hãy kích hoạt tài khoản của bạn ngay bây giờ!
                        </div>
                        
                        <div class="button-container">
                            <a href="${activationUrl}" class="activation-button">✓ Kích hoạt tài khoản ngay</a>
                        </div>
                        
                        <div class="security-note">
                            🔒 <strong>Bảo mật:</strong> Nếu bạn không yêu cầu tạo tài khoản này, vui lòng bỏ qua email này hoặc 
                            <a href="mailto:support@yournewspaper.com" style="color: #856404;">liên hệ hỗ trợ</a>.
                        </div>
                        
                        <div class="step-list">
                            <strong>Các bước tiếp theo:</strong>
                            <ol>
                                <li>Nhấp vào nút "Kích hoạt tài khoản ngay" ở trên</li>
                                <li>Hoàn tất thiết lập hồ sơ của bạn</li>
                                <li>Bắt đầu đọc tin tức và nội dung yêu thích</li>
                            </ol>
                        </div>
                    </div>
                    
                    <div class="divider"></div>
                    
                    <div class="footer">
                        <div class="footer-text">
                            <strong>Your Newspaper</strong><br>
                            Nền tảng tin tức hàng đầu<br>
                            Email: support@yournewspaper.com
                        </div>
                        <div class="footer-links">
                            <a href="http://localhost:3000">Trang chủ</a> | 
                            <a href="http://localhost:3000/privacy">Chính sách bảo mật</a> | 
                            <a href="http://localhost:3000/terms">Điều khoản sử dụng</a>
                        </div>
                        <p style="text-align: center; margin-top: 15px; border-top: 1px solid #ddd; padding-top: 15px;">
                            © 2026 Your Newspaper. Tất cả các quyền được bảo lưu.
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    return transporter.sendMail(mailOptions);
};

module.exports = { sendActivationEmail };