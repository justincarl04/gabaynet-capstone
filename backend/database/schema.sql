-- TYPES
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('staff', 'admin', 'super_admin');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'report_status') THEN
        CREATE TYPE report_status AS ENUM ('pending', 'in_progress', 'resolved');
    END IF;
END $$;

-- CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL, 
    description TEXT
);

-- USERS
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,   
    password_hash TEXT NOT NULL,
    role user_role DEFAULT 'staff',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() 
);

-- REPORTS
CREATE TABLE IF NOT EXISTS reports (
    report_id SERIAL PRIMARY KEY,
    handler_id INT REFERENCES users(user_id) ON DELETE SET NULL, 
    category_id INT NOT NULL REFERENCES categories(category_id),
    reporter_contact VARCHAR(255),
    title TEXT NOT NULL, 
    description TEXT,
    image_url TEXT,
    location TEXT,
    status report_status DEFAULT 'pending',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);