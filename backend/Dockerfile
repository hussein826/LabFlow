# 1. Use an official Python image
FROM python:3.11-slim

# 2. Set the folder inside the "box" where our code will live
WORKDIR /app

# 3. Prevent Python from buffering logs (makes debugging easier)
ENV PYTHONUNBUFFERED=1

# 4. Install system tools needed for PostgreSQL
RUN apt-get update && apt-get install -y libpq-dev gcc && rm -rf /var/lib/apt/lists/*

# 5. Copy our requirements and install them
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 6. Copy all our backend code into the "box"
COPY . .

# 7. The command to start the server inside Docker
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]