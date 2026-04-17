# StockAI
AI system to predict stock prices.

## How to run the project

### Start Backend

Open a terminal in the project folder:

cd StockAI
.\venv\Scripts\Activate.ps1\uvicorn backend.main_api:app --reload

If venv already active:

uvicorn backend.main_api:app --reload


### Start Frontend

Open a new terminal:

cd frontend
npm run dev

If first time running write:
 
npm install
