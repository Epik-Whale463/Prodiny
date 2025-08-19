import sqlite3

def migrate_database():
    conn = sqlite3.connect('auth.db')
    cursor = conn.cursor()
    
    try:
        # Add role column to users table
        cursor.execute("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'student'")
        print("Added role column to users table")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print("Role column already exists")
        else:
            print(f"Error adding role column: {e}")
    
    # Check if project_messages table exists, if not create it
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS project_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content TEXT NOT NULL,
            sender_id INTEGER,
            project_id INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (sender_id) REFERENCES users (id),
            FOREIGN KEY (project_id) REFERENCES projects (id)
        )
    """)
    print("Ensured project_messages table exists")
    
    # Check if colleges table exists, if not create it
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS colleges (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            domain TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    print("Ensured colleges table exists")
    
    conn.commit()
    conn.close()
    print("Database migration completed successfully!")

if __name__ == "__main__":
    migrate_database()