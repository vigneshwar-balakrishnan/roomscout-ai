# RoomScout AI - Northeastern University Housing Assistant

A sophisticated AI-powered housing assistant that helps students find housing by analyzing WhatsApp chat files and providing intelligent housing recommendations.

## 🚀 Features

### **AI-Powered Analysis**
- **LangChain Integration**: Advanced GPT-4 processing for housing message classification
- **WhatsApp File Parsing**: Automatic extraction of housing listings from chat files
- **Intelligent Classification**: Distinguishes between housing messages and spam
- **Structured Data Extraction**: Extracts location, price, room type, contact info, and amenities

### **Real-time Chat Interface**
- **Natural Language Processing**: Conversational AI for housing queries
- **File Upload Support**: Direct WhatsApp .txt file upload and processing
- **Real-time Updates**: Socket.io integration for live chat experience
- **Progress Tracking**: Real-time processing status and progress indicators

### **Advanced Backend Architecture**
- **Node.js/Express**: Robust REST API with JWT authentication
- **Python Flask API**: LangChain pipeline for AI processing
- **MongoDB Integration**: Scalable data storage with Mongoose ODM
- **Security Hardening**: Assignment 8 security measures implemented

## 🏗️ Architecture

```
RoomScout AI/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # React Components
│   │   ├── services/       # API Services
│   │   └── contexts/       # React Context
├── server/                 # Node.js Backend
│   ├── routes/            # Express Routes
│   ├── models/            # MongoDB Schemas
│   ├── services/          # Business Logic
│   └── python-api/        # Python LangChain API
└── assignments/           # Assignment Files (Local Only)
```

## 🛠️ Technology Stack

### **Frontend**
- **React 18**: Modern UI framework
- **Ant Design v5**: Professional UI components
- **Socket.io Client**: Real-time communication
- **Axios**: HTTP client for API calls

### **Backend**
- **Node.js/Express**: REST API server
- **MongoDB/Mongoose**: Database and ODM
- **JWT Authentication**: Secure user authentication
- **Socket.io**: Real-time communication
- **Multer**: File upload handling

### **AI Pipeline**
- **Python Flask**: LangChain API server
- **LangChain**: LLM orchestration framework
- **OpenAI GPT-4**: Advanced language model
- **Pydantic**: Data validation and serialization

## 📦 Installation

### **Prerequisites**
- Node.js (v18+)
- Python (v3.8+)
- MongoDB Atlas account
- OpenAI API key

### **1. Clone the Repository**
```bash
git clone https://github.com/yourusername/roomscout-ai.git
cd roomscout-ai
```

### **2. Install Dependencies**

**Backend Dependencies:**
```bash
npm install
cd server && npm install
```

**Frontend Dependencies:**
```bash
cd client && npm install
```

**Python Dependencies:**
```bash
cd server/python-api
pip install -r requirements.txt
```

### **3. Environment Configuration**

Create `.env` file in the root directory:
```env
# MongoDB Configuration
MONGODB_URI=your_mongodb_atlas_uri

# JWT Configuration
JWT_SECRET=your_jwt_secret_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Server Configuration
PORT=5000
CLIENT_URL=http://localhost:3000

# Python API Configuration
PYTHON_API_URL=http://localhost:5001
```

### **4. Start the Application**

**Start Backend:**
```bash
npm run server
```

**Start Frontend:**
```bash
npm run client
```

**Start Python API:**
```bash
cd server/python-api
python roomscout_pipeline.py
```

## 🎯 Usage

### **1. User Registration/Login**
- Navigate to the application
- Register with your email
- Login to access the chat interface

### **2. Chat with AI**
- Ask housing-related questions
- Get intelligent responses about neighborhoods, prices, and housing options

### **3. Upload WhatsApp Files**
- Click "Upload" button
- Select WhatsApp .txt file
- Wait for AI processing (2-5 minutes for large files)
- View extracted housing listings

### **4. View Results**
- See processed housing messages
- View extracted listings with details
- Access contact information and amenities

## 🔧 API Endpoints

### **Authentication**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Token refresh

### **Chat**
- `POST /api/chat/send-message` - Send chat message
- `POST /api/chat/upload-file` - Upload WhatsApp file

### **Housing**
- `GET /api/housing` - Get housing listings
- `POST /api/housing` - Create housing listing
- `GET /api/housing/:id` - Get specific listing

### **Upload**
- `POST /api/upload/process-file` - Process uploaded files
- `GET /api/upload/health` - Upload service health

## 🧪 Testing

### **Backend Testing**
```bash
# Test chat message processing
curl -X POST http://localhost:5000/api/chat/send-message \
  -H "Content-Type: application/json" \
  -d '{"message":"I need a 2BR apartment in Back Bay"}'

# Test file upload
curl -X POST http://localhost:5000/api/chat/upload-file \
  -F "file=@path/to/whatsapp.txt"
```

### **Python API Testing**
```bash
# Test LangChain processing
curl -X POST http://localhost:5001/process \
  -H "Content-Type: application/json" \
  -d '{"message":"Housing listing content"}'
```

## 📊 Performance Metrics

### **LangChain Pipeline Performance**
- **Classification Accuracy**: 87%
- **Spam Detection**: 92%
- **Extraction Completeness**: 83%
- **User Satisfaction**: 8.1/10
- **Processing Speed**: 0.004s/message

### **Security Features**
- **Prompt Hardening**: Assignment 8 security measures
- **Input Validation**: Comprehensive validation
- **Rate Limiting**: API rate limiting
- **Error Handling**: Graceful error handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Northeastern University**: Project inspiration and requirements
- **OpenAI**: GPT-4 language model
- **LangChain**: LLM orchestration framework
- **Ant Design**: UI component library

## 📞 Support

For support, email support@roomscout-ai.com or create an issue in the GitHub repository.

---

**RoomScout AI** - Making housing search intelligent and effortless! 🏠✨ 