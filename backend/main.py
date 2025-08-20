from fastapi import FastAPI, HTTPException, Depends, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import sqlite3
import os
import json
from typing import Optional, List, Dict
import asyncio

# Initialize FastAPI app
app = FastAPI(title="CollegeHub API", version="1.0.0")

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
SECRET_KEY = "your-secret-key-change-this-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Database setup
DATABASE_URL = "auth.db"

def init_db():
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    # Users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            college_name TEXT,
            is_student BOOLEAN NOT NULL,
            role TEXT DEFAULT 'student',
            hashed_password TEXT NOT NULL,
            skills TEXT,
            github_profile TEXT,
            profile_completed BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Colleges table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS colleges (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            domain TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Subgroups table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS subgroups (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            description TEXT,
            icon TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # User subgroup memberships
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_subgroups (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            subgroup_id INTEGER,
            joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (subgroup_id) REFERENCES subgroups (id),
            UNIQUE(user_id, subgroup_id)
        )
    """)
    
    # Posts table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            author_id INTEGER,
            subgroup_id INTEGER,
            post_type TEXT DEFAULT 'discussion',
            upvotes INTEGER DEFAULT 0,
            downvotes INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (author_id) REFERENCES users (id),
            FOREIGN KEY (subgroup_id) REFERENCES subgroups (id)
        )
    """)
    
    # Comments table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content TEXT NOT NULL,
            author_id INTEGER,
            post_id INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (author_id) REFERENCES users (id),
            FOREIGN KEY (post_id) REFERENCES posts (id)
        )
    """)
    
    # Projects table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            owner_id INTEGER,
            visibility TEXT DEFAULT 'public',
            tags TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (owner_id) REFERENCES users (id)
        )
    """)
    
    # Project members table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS project_members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER,
            user_id INTEGER,
            role TEXT DEFAULT 'member',
            joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES projects (id),
            FOREIGN KEY (user_id) REFERENCES users (id),
            UNIQUE(project_id, user_id)
        )
    """)
    
    # Tasks table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            project_id INTEGER,
            assignee_id INTEGER,
            status TEXT DEFAULT 'todo',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES projects (id),
            FOREIGN KEY (assignee_id) REFERENCES users (id)
        )
    """)
    
    # Project chat messages table
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

    # Post votes table (tracks per-user votes)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS post_votes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            post_id INTEGER,
            user_id INTEGER,
            vote INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (post_id) REFERENCES posts (id),
            FOREIGN KEY (user_id) REFERENCES users (id),
            UNIQUE(post_id, user_id)
        )
    """)
    
    conn.commit()
    conn.close()

# Initialize database on startup
init_db()

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, WebSocket] = {}
        self.project_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: int):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    async def send_personal_message(self, message: str, user_id: int):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_text(message)

    async def broadcast_to_project(self, message: str, project_id: int):
        if project_id in self.project_connections:
            for connection in self.project_connections[project_id]:
                try:
                    await connection.send_text(message)
                except:
                    # Remove dead connections
                    self.project_connections[project_id].remove(connection)

    def join_project_room(self, websocket: WebSocket, project_id: int):
        if project_id not in self.project_connections:
            self.project_connections[project_id] = []
        self.project_connections[project_id].append(websocket)

manager = ConnectionManager()

# Pydantic models
class UserRegistration(BaseModel):
    name: str
    email: EmailStr
    college_name: Optional[str] = ""
    is_student: bool
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class User(BaseModel):
    id: int
    name: str
    email: str
    college_name: Optional[str]
    is_student: bool
    role: str = "student"
    skills: Optional[str] = None
    github_profile: Optional[str] = None
    profile_completed: bool = False

class ProfileSetup(BaseModel):
    full_name: str
    college: str
    skills: List[str]
    github_profile: Optional[str] = None

class College(BaseModel):
    id: int
    name: str
    domain: Optional[str]
    student_count: int
    project_count: int

class CollegeCreate(BaseModel):
    name: str
    domain: Optional[str] = None

class PostCreate(BaseModel):
    title: str
    content: str
    subgroup_id: int
    post_type: str = "discussion"

class Post(BaseModel):
    id: int
    title: str
    content: str
    author_name: str
    author_college: str
    subgroup_name: str
    post_type: str
    upvotes: int
    downvotes: int
    comment_count: int
    created_at: str

class CommentCreate(BaseModel):
    content: str
    post_id: int

class Comment(BaseModel):
    id: int
    content: str
    author_name: str
    created_at: str

class Subgroup(BaseModel):
    id: int
    name: str
    description: Optional[str]
    icon: Optional[str]
    member_count: int
    post_count: int
    is_joined: bool = False

class ProjectCreate(BaseModel):
    title: str
    description: str
    visibility: str = "public"
    tags: List[str] = []

class Project(BaseModel):
    id: int
    title: str
    description: str
    owner_name: str
    visibility: str
    tags: List[str]
    member_count: int
    task_counts: dict
    created_at: str

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    project_id: int
    assignee_id: Optional[int] = None
    status: str = "todo"

class Task(BaseModel):
    id: int
    title: str
    description: Optional[str]
    project_id: int
    assignee_name: Optional[str]
    status: str
    created_at: str

class ProjectMessage(BaseModel):
    content: str
    project_id: int

class ChatMessage(BaseModel):
    id: int
    content: str
    sender_name: str
    project_id: int
    created_at: str

class AdminStats(BaseModel):
    total_users: int
    total_colleges: int
    total_projects: int
    total_posts: int
    users_by_college: List[dict]
    projects_by_college: List[dict]

# Utility functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_user_by_email(email: str):
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    conn.close()
    return user

def create_user(user_data: UserRegistration):
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()
    hashed_password = get_password_hash(user_data.password)
    
    try:
        cursor.execute("""
            INSERT INTO users (name, email, college_name, is_student, hashed_password)
            VALUES (?, ?, ?, ?, ?)
        """, (user_data.name, user_data.email, user_data.college_name, user_data.is_student, hashed_password))
        conn.commit()
        user_id = cursor.lastrowid
        conn.close()
        return user_id
    except sqlite3.IntegrityError:
        conn.close()
        return None



# API Routes
@app.get("/")
async def root():
    return {"message": "CollegeHub API is running", "status": "healthy"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/register", response_model=dict)
async def register(user_data: UserRegistration):
    # Check if user already exists
    existing_user = get_user_by_email(user_data.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    user_id = create_user(user_data)
    if not user_id:
        raise HTTPException(status_code=400, detail="Failed to create user")
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_data.email}, expires_delta=access_token_expires
    )
    
    return {
        "message": "User registered successfully",
        "access_token": access_token,
        "token_type": "bearer"
    }

@app.post("/login", response_model=Token)
async def login(user_data: UserLogin):
    # Get user from database
    user = get_user_by_email(user_data.email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Verify password
    if not verify_password(user_data.password, user[6]):  # user[6] is hashed_password (correct index)
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_data.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/me", response_model=User)
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = get_user_by_email(email)
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    
    return User(
        id=user[0],
        name=user[1],
        email=user[2],
        college_name=user[3],
        is_student=bool(user[4]),
        skills=user[7] if len(user) > 7 else None,  # user[7] is skills (correct index)
        github_profile=user[8] if len(user) > 8 else None,  # user[8] is github_profile (correct index)
        profile_completed=bool(user[9]) if len(user) > 9 else False  # user[9] is profile_completed (correct index)
    )


def get_user_from_token(credentials: HTTPAuthorizationCredentials):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
    except JWTError:
        return None
    return get_user_by_email(email)

@app.post("/profile-setup")
async def setup_profile(profile_data: ProfileSetup, credentials: HTTPAuthorizationCredentials = Depends(security)):
    # Get current user
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = get_user_by_email(email)
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    
    # Update user profile
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    skills_str = ",".join(profile_data.skills)
    
    cursor.execute("""
        UPDATE users 
        SET name = ?, college_name = ?, skills = ?, github_profile = ?, profile_completed = TRUE
        WHERE email = ?
    """, (profile_data.full_name, profile_data.college, skills_str, profile_data.github_profile, email))
    
    conn.commit()
    conn.close()
    
    return {"message": "Profile updated successfully"}


# Posts endpoints
@app.get("/posts", response_model=List[Post])
async def list_posts(page: int = 1, limit: int = 20, subgroup: Optional[int] = None):
    offset = (page - 1) * limit
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()
    params: List = []
    query = "SELECT p.id, p.title, p.content, u.name, u.college_name, s.name, p.post_type, p.upvotes, p.downvotes, (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as comment_count, p.created_at FROM posts p LEFT JOIN users u ON p.author_id = u.id LEFT JOIN subgroups s ON p.subgroup_id = s.id"
    if subgroup:
        query += " WHERE p.subgroup_id = ?"
        params.append(subgroup)
    query += " ORDER BY p.created_at DESC LIMIT ? OFFSET ?"
    params.extend([limit, offset])
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    posts: List[Post] = []
    for r in rows:
        posts.append(Post(
            id=r[0],
            title=r[1],
            content=r[2],
            author_name=r[3] or 'Unknown',
            author_college=r[4] or '',
            subgroup_name=r[5] or '',
            post_type=r[6] or 'discussion',
            upvotes=r[7] or 0,
            downvotes=r[8] or 0,
            comment_count=r[9] or 0,
            created_at=str(r[10])
        ))
    return posts


@app.post("/posts", response_model=Post)
async def create_post(post: PostCreate, credentials: HTTPAuthorizationCredentials = Depends(security)):
    user = get_user_from_token(credentials)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()
    cursor.execute("INSERT INTO posts (title, content, author_id, subgroup_id, post_type) VALUES (?, ?, ?, ?, ?)", (post.title, post.content, user[0], post.subgroup_id, post.post_type))
    conn.commit()
    post_id = cursor.lastrowid
    # fetch created post
    cursor.execute("SELECT p.id, p.title, p.content, u.name, u.college_name, s.name, p.post_type, p.upvotes, p.downvotes, (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as comment_count, p.created_at FROM posts p LEFT JOIN users u ON p.author_id = u.id LEFT JOIN subgroups s ON p.subgroup_id = s.id WHERE p.id = ?", (post_id,))
    r = cursor.fetchone()
    conn.close()
    return Post(
        id=r[0],
        title=r[1],
        content=r[2],
        author_name=r[3] or 'Unknown',
        author_college=r[4] or '',
        subgroup_name=r[5] or '',
        post_type=r[6] or 'discussion',
        upvotes=r[7] or 0,
        downvotes=r[8] or 0,
        comment_count=r[9] or 0,
        created_at=str(r[10])
    )


@app.put("/posts/{post_id}/vote")
async def vote_post(post_id: int, payload: dict, credentials: HTTPAuthorizationCredentials = Depends(security)):
    # payload expected: {"vote": 1 | -1 | 0}
    vote_val = int(payload.get('vote', 0))
    if vote_val not in (-1, 0, 1):
        raise HTTPException(status_code=400, detail="Invalid vote value")
    user = get_user_from_token(credentials)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")

    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()

    # Check existing vote
    cursor.execute("SELECT vote FROM post_votes WHERE post_id = ? AND user_id = ?", (post_id, user[0]))
    existing = cursor.fetchone()

    try:
        if existing is None:
            if vote_val != 0:
                cursor.execute("INSERT INTO post_votes (post_id, user_id, vote) VALUES (?, ?, ?)", (post_id, user[0], vote_val))
                if vote_val == 1:
                    cursor.execute("UPDATE posts SET upvotes = upvotes + 1 WHERE id = ?", (post_id,))
                else:
                    cursor.execute("UPDATE posts SET downvotes = downvotes + 1 WHERE id = ?", (post_id,))
        else:
            prev = existing[0]
            if vote_val == 0:
                # remove vote
                cursor.execute("DELETE FROM post_votes WHERE post_id = ? AND user_id = ?", (post_id, user[0]))
                if prev == 1:
                    cursor.execute("UPDATE posts SET upvotes = upvotes - 1 WHERE id = ?", (post_id,))
                elif prev == -1:
                    cursor.execute("UPDATE posts SET downvotes = downvotes - 1 WHERE id = ?", (post_id,))
            else:
                # update vote if changed
                if prev != vote_val:
                    cursor.execute("UPDATE post_votes SET vote = ? WHERE post_id = ? AND user_id = ?", (vote_val, post_id, user[0]))
                    if prev == 1 and vote_val == -1:
                        cursor.execute("UPDATE posts SET upvotes = upvotes - 1, downvotes = downvotes + 1 WHERE id = ?", (post_id,))
                    elif prev == -1 and vote_val == 1:
                        cursor.execute("UPDATE posts SET downvotes = downvotes - 1, upvotes = upvotes + 1 WHERE id = ?", (post_id,))
    except Exception as e:
        conn.rollback()
        conn.close()
        raise HTTPException(status_code=500, detail=str(e))

    conn.commit()
    # return updated counts
    cursor.execute("SELECT upvotes, downvotes FROM posts WHERE id = ?", (post_id,))
    counts = cursor.fetchone()
    conn.close()
    return {"upvotes": counts[0], "downvotes": counts[1]}


# Subgroups endpoints
@app.get("/subgroups", response_model=List[Subgroup])
async def list_subgroups(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)):
    user = None
    if credentials:
        user = get_user_from_token(credentials)
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()
    cursor.execute("SELECT s.id, s.name, s.description, s.icon, (SELECT COUNT(*) FROM user_subgroups us WHERE us.subgroup_id = s.id) as member_count, (SELECT COUNT(*) FROM posts p WHERE p.subgroup_id = s.id) as post_count FROM subgroups s ORDER BY s.name ASC")
    rows = cursor.fetchall()
    subgroups: List[Subgroup] = []
    for r in rows:
        is_joined = False
        if user:
            cursor.execute("SELECT 1 FROM user_subgroups WHERE user_id = ? AND subgroup_id = ?", (user[0], r[0]))
            is_joined = cursor.fetchone() is not None
        subgroups.append(Subgroup(id=r[0], name=r[1], description=r[2] or '', icon=r[3] or '', member_count=r[4] or 0, post_count=r[5] or 0, is_joined=is_joined))
    conn.close()
    return subgroups


@app.post("/subgroups/{subgroup_id}/join")
async def join_subgroup(subgroup_id: int, credentials: HTTPAuthorizationCredentials = Depends(security)):
    user = get_user_from_token(credentials)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT OR IGNORE INTO user_subgroups (user_id, subgroup_id) VALUES (?, ?)", (user[0], subgroup_id))
        conn.commit()
        # get new count
        cursor.execute("SELECT COUNT(*) FROM user_subgroups WHERE subgroup_id = ?", (subgroup_id,))
        count = cursor.fetchone()[0]
    except Exception as e:
        conn.rollback()
        conn.close()
        raise HTTPException(status_code=500, detail=str(e))
    conn.close()
    return {"success": True, "member_count": count}


# Comments endpoints
@app.get("/posts/{post_id}/comments", response_model=List[Comment])
async def get_comments(post_id: int):
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()
    cursor.execute("SELECT c.id, c.content, u.name, c.created_at FROM comments c LEFT JOIN users u ON c.author_id = u.id WHERE c.post_id = ? ORDER BY c.created_at ASC", (post_id,))
    rows = cursor.fetchall()
    conn.close()
    comments: List[Comment] = []
    for r in rows:
        comments.append(Comment(id=r[0], content=r[1], author_name=r[2] or 'Unknown', created_at=str(r[3])))
    return comments


@app.post("/posts/{post_id}/comments", response_model=Comment)
async def create_comment(post_id: int, comment: CommentCreate, credentials: HTTPAuthorizationCredentials = Depends(security)):
    user = get_user_from_token(credentials)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO comments (content, author_id, post_id) VALUES (?, ?, ?)", (comment.content, user[0], post_id))
        conn.commit()
        comment_id = cursor.lastrowid
        cursor.execute("SELECT c.id, c.content, u.name, c.created_at FROM comments c LEFT JOIN users u ON c.author_id = u.id WHERE c.id = ?", (comment_id,))
        r = cursor.fetchone()
    except Exception as e:
        conn.rollback()
        conn.close()
        raise HTTPException(status_code=500, detail=str(e))
    conn.close()
    return Comment(id=r[0], content=r[1], author_name=r[2] or 'Unknown', created_at=str(r[3]))

@app.get("/subgroups", response_model=List[Subgroup])
async def get_subgroups(credentials: HTTPAuthorizationCredentials = Depends(security)):
    # Get current user
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = get_user_by_email(email)
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    
    user_id = user[0]
    
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    # Get all subgroups with member counts and user's join status
    cursor.execute("""
        SELECT s.id, s.name, s.description, s.icon,
               COUNT(DISTINCT us.user_id) as member_count,
               COUNT(DISTINCT p.id) as post_count,
               CASE WHEN user_sub.user_id IS NOT NULL THEN 1 ELSE 0 END as is_joined
        FROM subgroups s
        LEFT JOIN user_subgroups us ON s.id = us.subgroup_id
        LEFT JOIN posts p ON s.id = p.subgroup_id
        LEFT JOIN user_subgroups user_sub ON s.id = user_sub.subgroup_id AND user_sub.user_id = ?
        GROUP BY s.id, s.name, s.description, s.icon, user_sub.user_id
        ORDER BY member_count DESC
    """, (user_id,))
    
    subgroups = cursor.fetchall()
    conn.close()
    
    return [
        Subgroup(
            id=sg[0],
            name=sg[1],
            description=sg[2],
            icon=sg[3],
            member_count=sg[4],
            post_count=sg[5],
            is_joined=bool(sg[6])
        )
        for sg in subgroups
    ]

@app.post("/subgroups/{subgroup_id}/join")
async def join_subgroup(subgroup_id: int, credentials: HTTPAuthorizationCredentials = Depends(security)):
    # Get current user
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = get_user_by_email(email)
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    
    user_id = user[0]
    
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            INSERT INTO user_subgroups (user_id, subgroup_id)
            VALUES (?, ?)
        """, (user_id, subgroup_id))
        conn.commit()
        message = "Joined subgroup successfully"
    except sqlite3.IntegrityError:
        # Already joined, so leave
        cursor.execute("""
            DELETE FROM user_subgroups 
            WHERE user_id = ? AND subgroup_id = ?
        """, (user_id, subgroup_id))
        conn.commit()
        message = "Left subgroup successfully"
    
    conn.close()
    return {"message": message}

@app.get("/posts", response_model=List[Post])
async def get_posts(credentials: HTTPAuthorizationCredentials = Depends(security)):
    # Get current user
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    # Get posts from user's joined subgroups
    cursor.execute("""
        SELECT p.id, p.title, p.content, u.name, u.college_name, s.name, 
               p.post_type, p.upvotes, p.downvotes, 
               COUNT(c.id) as comment_count,
               p.created_at
        FROM posts p
        JOIN users u ON p.author_id = u.id
        JOIN subgroups s ON p.subgroup_id = s.id
        LEFT JOIN comments c ON p.id = c.post_id
        GROUP BY p.id, p.title, p.content, u.name, u.college_name, s.name, 
                 p.post_type, p.upvotes, p.downvotes, p.created_at
        ORDER BY p.created_at DESC
        LIMIT 20
    """)
    
    posts = cursor.fetchall()
    conn.close()
    
    return [
        Post(
            id=post[0],
            title=post[1],
            content=post[2],
            author_name=post[3],
            author_college=post[4] or "Unknown",
            subgroup_name=post[5],
            post_type=post[6],
            upvotes=post[7],
            downvotes=post[8],
            comment_count=post[9],
            created_at=post[10]
        )
        for post in posts
    ]

@app.post("/posts", response_model=dict)
async def create_post(post_data: PostCreate, credentials: HTTPAuthorizationCredentials = Depends(security)):
    # Get current user
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = get_user_by_email(email)
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    
    user_id = user[0]
    
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO posts (title, content, author_id, subgroup_id, post_type)
        VALUES (?, ?, ?, ?, ?)
    """, (post_data.title, post_data.content, user_id, post_data.subgroup_id, post_data.post_type))
    
    conn.commit()
    post_id = cursor.lastrowid
    conn.close()
    
    return {"message": "Post created successfully", "post_id": post_id}

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle real-time messages
            message_data = json.loads(data)
            if message_data["type"] == "project_message":
                # Broadcast to project members
                await manager.broadcast_to_project(data, message_data["project_id"])
    except WebSocketDisconnect:
        manager.disconnect(user_id)

@app.get("/projects", response_model=List[Project])
async def get_projects(credentials: HTTPAuthorizationCredentials = Depends(security)):
    # Get current user
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = get_user_by_email(email)
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    
    user_id = user[0]
    
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    # Get projects where user is owner or member
    cursor.execute("""
        SELECT DISTINCT p.id, p.title, p.description, u.name, p.visibility, p.tags, p.created_at,
               COUNT(DISTINCT pm.user_id) as member_count
        FROM projects p
        JOIN users u ON p.owner_id = u.id
        LEFT JOIN project_members pm ON p.id = pm.project_id
        WHERE p.owner_id = ? OR p.id IN (
            SELECT project_id FROM project_members WHERE user_id = ?
        )
        GROUP BY p.id, p.title, p.description, u.name, p.visibility, p.tags, p.created_at
        ORDER BY p.created_at DESC
    """, (user_id, user_id))
    
    projects = cursor.fetchall()
    
    result = []
    for project in projects:
        # Get task counts
        cursor.execute("""
            SELECT status, COUNT(*) 
            FROM tasks 
            WHERE project_id = ? 
            GROUP BY status
        """, (project[0],))
        
        task_counts = {"todo": 0, "doing": 0, "done": 0}
        for status, count in cursor.fetchall():
            task_counts[status] = count
        
        result.append(Project(
            id=project[0],
            title=project[1],
            description=project[2],
            owner_name=project[3],
            visibility=project[4],
            tags=project[5].split(',') if project[5] else [],
            member_count=project[7],
            task_counts=task_counts,
            created_at=project[6]
        ))
    
    conn.close()
    return result

@app.post("/projects", response_model=dict)
async def create_project(project_data: ProjectCreate, credentials: HTTPAuthorizationCredentials = Depends(security)):
    # Get current user
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = get_user_by_email(email)
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    
    user_id = user[0]
    
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    tags_str = ",".join(project_data.tags)
    
    cursor.execute("""
        INSERT INTO projects (title, description, owner_id, visibility, tags)
        VALUES (?, ?, ?, ?, ?)
    """, (project_data.title, project_data.description, user_id, project_data.visibility, tags_str))
    
    conn.commit()
    project_id = cursor.lastrowid
    
    # Add owner as project member
    cursor.execute("""
        INSERT INTO project_members (project_id, user_id, role)
        VALUES (?, ?, 'owner')
    """, (project_id, user_id))
    
    conn.commit()
    conn.close()
    
    return {"message": "Project created successfully", "project_id": project_id}

# College management endpoints
@app.get("/colleges", response_model=List[College])
async def get_colleges():
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT c.id, c.name, c.domain,
               COUNT(DISTINCT u.id) as student_count,
               COUNT(DISTINCT p.id) as project_count
        FROM colleges c
        LEFT JOIN users u ON c.name = u.college_name
        LEFT JOIN projects p ON p.owner_id IN (
            SELECT id FROM users WHERE college_name = c.name
        )
        GROUP BY c.id, c.name, c.domain
        ORDER BY student_count DESC
    """)
    
    colleges = cursor.fetchall()
    conn.close()
    
    return [
        College(
            id=college[0],
            name=college[1],
            domain=college[2],
            student_count=college[3],
            project_count=college[4]
        )
        for college in colleges
    ]

@app.post("/colleges")
async def create_college(college_data: CollegeCreate, credentials: HTTPAuthorizationCredentials = Depends(security)):
    # Verify admin access (simplified for MVP)
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO colleges (name, domain)
        VALUES (?, ?)
    """, (college_data.name, college_data.domain))
    
    conn.commit()
    college_id = cursor.lastrowid
    conn.close()
    
    return {"message": "College created successfully", "college_id": college_id}

# Comments endpoints
@app.get("/posts/{post_id}/comments", response_model=List[Comment])
async def get_post_comments(post_id: int):
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT c.id, c.content, u.name, c.created_at
        FROM comments c
        JOIN users u ON c.author_id = u.id
        WHERE c.post_id = ?
        ORDER BY c.created_at ASC
    """, (post_id,))
    
    comments = cursor.fetchall()
    conn.close()
    
    return [
        Comment(
            id=comment[0],
            content=comment[1],
            author_name=comment[2],
            created_at=comment[3]
        )
        for comment in comments
    ]

@app.post("/comments")
async def create_comment(comment_data: CommentCreate, credentials: HTTPAuthorizationCredentials = Depends(security)):
    # Get current user
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = get_user_by_email(email)
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    
    user_id = user[0]
    
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO comments (content, author_id, post_id)
        VALUES (?, ?, ?)
    """, (comment_data.content, user_id, comment_data.post_id))
    
    conn.commit()
    comment_id = cursor.lastrowid
    conn.close()
    
    return {"message": "Comment created successfully", "comment_id": comment_id}

# Task management endpoints
@app.get("/projects/{project_id}/tasks", response_model=List[Task])
async def get_project_tasks(project_id: int, credentials: HTTPAuthorizationCredentials = Depends(security)):
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT t.id, t.title, t.description, t.project_id, u.name, t.status, t.created_at
        FROM tasks t
        LEFT JOIN users u ON t.assignee_id = u.id
        WHERE t.project_id = ?
        ORDER BY t.created_at DESC
    """, (project_id,))
    
    tasks = cursor.fetchall()
    conn.close()
    
    return [
        Task(
            id=task[0],
            title=task[1],
            description=task[2],
            project_id=task[3],
            assignee_name=task[4],
            status=task[5],
            created_at=task[6]
        )
        for task in tasks
    ]

@app.post("/tasks")
async def create_task(task_data: TaskCreate, credentials: HTTPAuthorizationCredentials = Depends(security)):
    # Get current user
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO tasks (title, description, project_id, assignee_id, status)
        VALUES (?, ?, ?, ?, ?)
    """, (task_data.title, task_data.description, task_data.project_id, task_data.assignee_id, task_data.status))
    
    conn.commit()
    task_id = cursor.lastrowid
    conn.close()
    
    return {"message": "Task created successfully", "task_id": task_id}

@app.put("/tasks/{task_id}/status")
async def update_task_status(task_id: int, status: str, credentials: HTTPAuthorizationCredentials = Depends(security)):
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    cursor.execute("""
        UPDATE tasks SET status = ? WHERE id = ?
    """, (status, task_id))
    
    conn.commit()
    conn.close()
    
    return {"message": "Task status updated successfully"}

# Project chat endpoints
@app.get("/projects/{project_id}/messages", response_model=List[ChatMessage])
async def get_project_messages(project_id: int, credentials: HTTPAuthorizationCredentials = Depends(security)):
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT pm.id, pm.content, u.name, pm.project_id, pm.created_at
        FROM project_messages pm
        JOIN users u ON pm.sender_id = u.id
        WHERE pm.project_id = ?
        ORDER BY pm.created_at ASC
        LIMIT 50
    """, (project_id,))
    
    messages = cursor.fetchall()
    conn.close()
    
    return [
        ChatMessage(
            id=msg[0],
            content=msg[1],
            sender_name=msg[2],
            project_id=msg[3],
            created_at=msg[4]
        )
        for msg in messages
    ]

@app.post("/projects/{project_id}/messages")
async def send_project_message(project_id: int, message_data: ProjectMessage, credentials: HTTPAuthorizationCredentials = Depends(security)):
    # Get current user
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = get_user_by_email(email)
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    
    user_id = user[0]
    
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO project_messages (content, sender_id, project_id)
        VALUES (?, ?, ?)
    """, (message_data.content, user_id, project_id))
    
    conn.commit()
    message_id = cursor.lastrowid
    conn.close()
    
    # Broadcast to project members via WebSocket
    await manager.broadcast_to_project(
        json.dumps({
            "type": "new_message",
            "message": {
                "id": message_id,
                "content": message_data.content,
                "sender_name": user[1],  # user name
                "project_id": project_id,
                "created_at": datetime.now().isoformat()
            }
        }),
        project_id
    )
    
    return {"message": "Message sent successfully", "message_id": message_id}

# Admin endpoints
@app.get("/admin/stats", response_model=AdminStats)
async def get_admin_stats(credentials: HTTPAuthorizationCredentials = Depends(security)):
    # Simplified admin check for MVP
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    # Get total counts
    cursor.execute("SELECT COUNT(*) FROM users")
    total_users = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM colleges")
    total_colleges = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM projects")
    total_projects = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM posts")
    total_posts = cursor.fetchone()[0]
    
    # Users by college
    cursor.execute("""
        SELECT college_name, COUNT(*) as count
        FROM users
        WHERE college_name IS NOT NULL
        GROUP BY college_name
        ORDER BY count DESC
    """)
    users_by_college = [{"college": row[0], "count": row[1]} for row in cursor.fetchall()]
    
    # Projects by college
    cursor.execute("""
        SELECT u.college_name, COUNT(p.id) as count
        FROM projects p
        JOIN users u ON p.owner_id = u.id
        WHERE u.college_name IS NOT NULL
        GROUP BY u.college_name
        ORDER BY count DESC
    """)
    projects_by_college = [{"college": row[0], "count": row[1]} for row in cursor.fetchall()]
    
    conn.close()
    
    return AdminStats(
        total_users=total_users,
        total_colleges=total_colleges,
        total_projects=total_projects,
        total_posts=total_posts,
        users_by_college=users_by_college,
        projects_by_college=projects_by_college
    )

# College-specific feed
@app.get("/college/{college_name}/posts", response_model=List[Post])
async def get_college_posts(college_name: str, credentials: HTTPAuthorizationCredentials = Depends(security)):
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT p.id, p.title, p.content, u.name, u.college_name, s.name, 
               p.post_type, p.upvotes, p.downvotes, 
               COUNT(c.id) as comment_count,
               p.created_at
        FROM posts p
        JOIN users u ON p.author_id = u.id
        JOIN subgroups s ON p.subgroup_id = s.id
        LEFT JOIN comments c ON p.id = c.post_id
        WHERE u.college_name = ?
        GROUP BY p.id, p.title, p.content, u.name, u.college_name, s.name, 
                 p.post_type, p.upvotes, p.downvotes, p.created_at
        ORDER BY p.created_at DESC
        LIMIT 20
    """, (college_name,))
    
    posts = cursor.fetchall()
    conn.close()
    
    return [
        Post(
            id=post[0],
            title=post[1],
            content=post[2],
            author_name=post[3],
            author_college=post[4] or "Unknown",
            subgroup_name=post[5],
            post_type=post[6],
            upvotes=post[7],
            downvotes=post[8],
            comment_count=post[9],
            created_at=post[10]
        )
        for post in posts
    ]

@app.get("/college/{college_name}/projects", response_model=List[Project])
async def get_college_projects(college_name: str, credentials: HTTPAuthorizationCredentials = Depends(security)):
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT DISTINCT p.id, p.title, p.description, u.name, p.visibility, p.tags, p.created_at,
               COUNT(DISTINCT pm.user_id) as member_count
        FROM projects p
        JOIN users u ON p.owner_id = u.id
        LEFT JOIN project_members pm ON p.id = pm.project_id
        WHERE u.college_name = ? AND (p.visibility = 'public' OR p.visibility = 'college_only')
        GROUP BY p.id, p.title, p.description, u.name, p.visibility, p.tags, p.created_at
        ORDER BY p.created_at DESC
    """, (college_name,))
    
    projects = cursor.fetchall()
    
    result = []
    for project in projects:
        # Get task counts
        cursor.execute("""
            SELECT status, COUNT(*) 
            FROM tasks 
            WHERE project_id = ? 
            GROUP BY status
        """, (project[0],))
        
        task_counts = {"todo": 0, "doing": 0, "done": 0}
        for status, count in cursor.fetchall():
            task_counts[status] = count
        
        result.append(Project(
            id=project[0],
            title=project[1],
            description=project[2],
            owner_name=project[3],
            visibility=project[4],
            tags=project[5].split(',') if project[5] else [],
            member_count=project[7],
            task_counts=task_counts,
            created_at=project[6]
        ))
    
    conn.close()
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)