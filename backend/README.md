# MindWeave Platform Backend

## Requirements

```
fastapi==0.109.0
uvicorn[standard]==0.27.0
pydantic==2.5.3
pydantic-settings==2.1.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
supabase==2.3.4
groq==0.4.2
nvidia-openai==0.1.2
httpx==0.26.0
python-dotenv==1.0.0
```

## Setup

```bash
# Install dependencies
pip install -r requirements.txt

# Run server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

- `GET /` - Health check
- `GET /api/products` - Get all products
- `POST /api/products` - Create product
- `GET /api/orders` - Get orders
- `POST /api/orders` - Create order
- `POST /api/ai/prompt` - AI Prompt Lab