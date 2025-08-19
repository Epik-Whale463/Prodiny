import sqlite3
from datetime import datetime

def seed_database():
    conn = sqlite3.connect('auth.db')
    cursor = conn.cursor()
    
    # Clear existing data
    cursor.execute("DELETE FROM user_subgroups")
    cursor.execute("DELETE FROM comments")
    cursor.execute("DELETE FROM posts")
    cursor.execute("DELETE FROM subgroups")
    cursor.execute("DELETE FROM project_members")
    cursor.execute("DELETE FROM project_messages")
    cursor.execute("DELETE FROM tasks")
    cursor.execute("DELETE FROM projects")
    cursor.execute("DELETE FROM colleges")
    cursor.execute("DELETE FROM users")
    
    # Insert colleges
    colleges = [
        ("Massachusetts Institute of Technology", "mit.edu"),
        ("Stanford University", "stanford.edu"),
        ("University of California, Berkeley", "berkeley.edu"),
        ("Carnegie Mellon University", "cmu.edu"),
        ("California Institute of Technology", "caltech.edu"),
        ("Harvard University", "harvard.edu"),
        ("University of Washington", "uw.edu"),
        ("Georgia Institute of Technology", "gatech.edu"),
        ("University of Illinois Urbana-Champaign", "illinois.edu"),
        ("Cornell University", "cornell.edu"),
        ("Vellore Institute of Technology", "vit.ac.in"),
        ("Indian Institute of Technology Delhi", "iitd.ac.in"),
        ("Indian Institute of Technology Bombay", "iitb.ac.in")
    ]
    
    for name, domain in colleges:
        cursor.execute("""
            INSERT INTO colleges (name, domain)
            VALUES (?, ?)
        """, (name, domain))
    
    # Insert sample subgroups
    subgroups = [
        ("AI & Machine Learning", "Artificial Intelligence, ML, Deep Learning discussions", "🤖"),
        ("Web Development", "Frontend, Backend, Full-stack development", "💻"),
        ("Mobile Development", "iOS, Android, React Native, Flutter", "📱"),
        ("Data Science", "Data Analysis, Visualization, Statistics", "📊"),
        ("Cybersecurity", "Security, Ethical Hacking, Privacy", "🔒"),
        ("Game Development", "Unity, Unreal, Indie Games", "🎮"),
        ("DevOps", "CI/CD, Cloud, Infrastructure", "⚙️"),
        ("UI/UX Design", "User Interface, User Experience Design", "🎨"),
        ("Blockchain", "Cryptocurrency, Smart Contracts, DeFi", "⛓️"),
        ("Robotics", "Hardware, Automation, IoT", "🤖"),
        ("Competitive Programming", "Algorithms, Data Structures, Contests", "🏆"),
        ("Open Source", "Contributing to open source projects", "🌟")
    ]
    
    for name, desc, icon in subgroups:
        cursor.execute("""
            INSERT INTO subgroups (name, description, icon)
            VALUES (?, ?, ?)
        """, (name, desc, icon))
    
    # Insert sample users with different colleges
    users = [
        ("Alice Johnson", "alice@mit.edu", "Massachusetts Institute of Technology", True, "student", "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VJWZp/k/K", "Python,JavaScript,React,Machine Learning", "https://github.com/alice"),
        ("Bob Smith", "bob@stanford.edu", "Stanford University", True, "student", "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VJWZp/k/K", "Java,Spring,AWS,DevOps", "https://github.com/bob"),
        ("Carol Davis", "carol@berkeley.edu", "University of California, Berkeley", True, "student", "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VJWZp/k/K", "Machine Learning,Python,TensorFlow,Data Science", "https://github.com/carol"),
        ("David Wilson", "david@cmu.edu", "Carnegie Mellon University", True, "student", "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VJWZp/k/K", "C++,Algorithms,Competitive Programming,Game Development", "https://github.com/david"),
        ("Eve Brown", "eve@caltech.edu", "California Institute of Technology", True, "student", "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VJWZp/k/K", "UI/UX,Figma,Design Systems,Frontend", "https://github.com/eve"),
        ("Frank Miller", "frank@vit.ac.in", "Vellore Institute of Technology", True, "student", "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VJWZp/k/K", "Blockchain,Solidity,Web3,Cryptocurrency", "https://github.com/frank"),
        ("Grace Lee", "grace@iitd.ac.in", "Indian Institute of Technology Delhi", True, "student", "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VJWZp/k/K", "Robotics,IoT,Arduino,Embedded Systems", "https://github.com/grace"),
        ("Henry Chen", "henry@mit.edu", "Massachusetts Institute of Technology", True, "faculty", "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VJWZp/k/K", "Computer Vision,Deep Learning,Research", "https://github.com/henry"),
        ("Admin User", "admin@collegehub.com", "CollegeHub", False, "admin", "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VJWZp/k/K", "Platform Management,Analytics", None)
    ]
    
    for name, email, college, is_student, role, password, skills, github in users:
        cursor.execute("""
            INSERT INTO users (name, email, college_name, is_student, role, hashed_password, skills, github_profile, profile_completed)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)
        """, (name, email, college, is_student, role, password, skills, github))
    
    # Get user IDs
    cursor.execute("SELECT id FROM users ORDER BY id")
    user_ids = [row[0] for row in cursor.fetchall()]
    
    # Get subgroup IDs
    cursor.execute("SELECT id FROM subgroups ORDER BY id")
    subgroup_ids = [row[0] for row in cursor.fetchall()]
    
    # Add users to subgroups
    memberships = [
        (user_ids[0], subgroup_ids[0]),  # Alice -> AI
        (user_ids[0], subgroup_ids[1]),  # Alice -> Web Dev
        (user_ids[1], subgroup_ids[1]),  # Bob -> Web Dev
        (user_ids[1], subgroup_ids[6]),  # Bob -> DevOps
        (user_ids[2], subgroup_ids[0]),  # Carol -> AI
        (user_ids[2], subgroup_ids[3]),  # Carol -> Data Science
        (user_ids[3], subgroup_ids[0]),  # David -> AI
        (user_ids[3], subgroup_ids[5]),  # David -> Game Dev
        (user_ids[3], subgroup_ids[10]), # David -> Competitive Programming
        (user_ids[4], subgroup_ids[7]),  # Eve -> UI/UX
        (user_ids[4], subgroup_ids[1]),  # Eve -> Web Dev
        (user_ids[5], subgroup_ids[8]),  # Frank -> Blockchain
        (user_ids[5], subgroup_ids[1]),  # Frank -> Web Dev
        (user_ids[6], subgroup_ids[9]),  # Grace -> Robotics
        (user_ids[6], subgroup_ids[0]),  # Grace -> AI
        (user_ids[7], subgroup_ids[0]),  # Henry -> AI
        (user_ids[7], subgroup_ids[3]),  # Henry -> Data Science
    ]
    
    for user_id, subgroup_id in memberships:
        cursor.execute("""
            INSERT INTO user_subgroups (user_id, subgroup_id)
            VALUES (?, ?)
        """, (user_id, subgroup_id))
    
    # Insert sample posts
    posts = [
        ("Getting Started with Machine Learning", "What are the best resources for beginners in ML? I'm particularly interested in computer vision applications.", user_ids[0], subgroup_ids[0], "discussion"),
        ("React vs Vue in 2024", "Which framework should I choose for my next project? Looking at performance and learning curve.", user_ids[1], subgroup_ids[1], "discussion"),
        ("Looking for ML Project Partners", "Working on a computer vision project for autonomous vehicles, need teammates with Python/TensorFlow experience!", user_ids[2], subgroup_ids[0], "project_idea"),
        ("Best Practices for API Design", "Share your thoughts on RESTful API design patterns. What about GraphQL vs REST?", user_ids[1], subgroup_ids[1], "discussion"),
        ("Data Visualization Tools Comparison", "Comparing D3.js, Chart.js, and Plotly for interactive dashboards", user_ids[2], subgroup_ids[3], "discussion"),
        ("Blockchain Development Resources", "Starting with smart contract development. Any good tutorials for Solidity?", user_ids[5], subgroup_ids[8], "discussion"),
        ("IoT Project Ideas for Students", "Looking for interesting IoT projects that can be completed in a semester", user_ids[6], subgroup_ids[9], "project_idea"),
        ("Competitive Programming Study Group", "Anyone interested in forming a CP study group? We can practice together!", user_ids[3], subgroup_ids[10], "project_idea"),
        ("Open Source Contribution Guide", "How to get started with contributing to open source projects as a student?", user_ids[0], subgroup_ids[11], "discussion"),
        ("UI/UX Design Trends 2024", "What are the latest design trends we should be aware of?", user_ids[4], subgroup_ids[7], "discussion")
    ]
    
    import random
    for title, content, author_id, subgroup_id, post_type in posts:
        cursor.execute("""
            INSERT INTO posts (title, content, author_id, subgroup_id, post_type, upvotes, downvotes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (title, content, author_id, subgroup_id, post_type, 
              random.randint(3, 15), random.randint(0, 3)))
    
    # Insert sample comments
    cursor.execute("SELECT id FROM posts ORDER BY id")
    post_ids = [row[0] for row in cursor.fetchall()]
    
    comments = [
        ("I recommend starting with Andrew Ng's course on Coursera!", user_ids[2], post_ids[0]),
        ("Also check out fast.ai - great for practical applications", user_ids[7], post_ids[0]),
        ("React has better job market, but Vue is easier to learn", user_ids[4], post_ids[1]),
        ("I'd be interested in joining! I have experience with OpenCV", user_ids[0], post_ids[2]),
        ("GraphQL is great for complex data requirements", user_ids[5], post_ids[3]),
        ("D3.js is powerful but has a steep learning curve", user_ids[2], post_ids[4]),
        ("CryptoZombies is an excellent interactive tutorial", user_ids[0], post_ids[5]),
        ("Smart home automation projects are always interesting", user_ids[3], post_ids[6]),
        ("Count me in! I'm preparing for ICPC", user_ids[0], post_ids[7]),
        ("Start with good first issues on GitHub", user_ids[1], post_ids[8])
    ]
    
    for content, author_id, post_id in comments:
        cursor.execute("""
            INSERT INTO comments (content, author_id, post_id)
            VALUES (?, ?, ?)
        """, (content, author_id, post_id))
    
    # Insert sample projects
    projects = [
        ("AI Study Group Platform", "Building a comprehensive platform for AI study groups and resource sharing with real-time collaboration features", user_ids[0], "public", "AI,Education,React,Node.js"),
        ("Campus Food Delivery App", "Mobile app for food delivery within campus with real-time tracking and payment integration", user_ids[1], "college_only", "Mobile,React Native,Node.js,MongoDB"),
        ("Open Source ML Library", "Contributing to machine learning tools specifically designed for student projects and learning", user_ids[2], "public", "Python,Machine Learning,Open Source,TensorFlow"),
        ("Game Development Workshop", "Interactive workshop series teaching game development to beginners using Unity", user_ids[3], "public", "Unity,C#,Education,Game Development"),
        ("Design System for Students", "Creating a comprehensive design system and component library for student projects", user_ids[4], "public", "Design,Figma,React,Storybook"),
        ("Blockchain Voting System", "Secure and transparent voting system using blockchain technology for student elections", user_ids[5], "college_only", "Blockchain,Solidity,Web3,Security"),
        ("Smart Campus IoT Network", "IoT sensor network for monitoring campus facilities and environmental conditions", user_ids[6], "college_only", "IoT,Arduino,Python,Data Analytics"),
        ("Competitive Programming Platform", "Platform for hosting programming contests and practice sessions", user_ids[3], "public", "Algorithms,Data Structures,Web Development,Database")
    ]
    
    for title, desc, owner_id, visibility, tags in projects:
        cursor.execute("""
            INSERT INTO projects (title, description, owner_id, visibility, tags)
            VALUES (?, ?, ?, ?, ?)
        """, (title, desc, owner_id, visibility, tags))
    
    # Get project IDs
    cursor.execute("SELECT id FROM projects ORDER BY id")
    project_ids = [row[0] for row in cursor.fetchall()]
    
    # Add project members
    project_memberships = [
        (project_ids[0], user_ids[0], 'owner'),
        (project_ids[0], user_ids[2], 'member'),
        (project_ids[0], user_ids[4], 'member'),
        (project_ids[1], user_ids[1], 'owner'),
        (project_ids[1], user_ids[4], 'member'),
        (project_ids[2], user_ids[2], 'owner'),
        (project_ids[2], user_ids[0], 'member'),
        (project_ids[2], user_ids[7], 'member'),
        (project_ids[3], user_ids[3], 'owner'),
        (project_ids[3], user_ids[0], 'member'),
        (project_ids[4], user_ids[4], 'owner'),
        (project_ids[4], user_ids[1], 'member'),
        (project_ids[5], user_ids[5], 'owner'),
        (project_ids[5], user_ids[1], 'member'),
        (project_ids[6], user_ids[6], 'owner'),
        (project_ids[6], user_ids[2], 'member'),
        (project_ids[7], user_ids[3], 'owner'),
        (project_ids[7], user_ids[0], 'member'),
    ]
    
    for project_id, user_id, role in project_memberships:
        cursor.execute("""
            INSERT INTO project_members (project_id, user_id, role)
            VALUES (?, ?, ?)
        """, (project_id, user_id, role))
    
    # Insert sample tasks
    tasks = [
        ("Set up project repository", "Initialize Git repo and basic project structure", project_ids[0], user_ids[0], "done"),
        ("Design user interface mockups", "Create wireframes and mockups for main pages", project_ids[0], user_ids[4], "doing"),
        ("Implement user authentication", "Set up login/signup functionality with JWT", project_ids[0], user_ids[0], "todo"),
        ("Set up real-time chat", "Implement WebSocket-based chat system", project_ids[0], user_ids[2], "todo"),
        ("Research food delivery APIs", "Find suitable APIs for restaurant data", project_ids[1], user_ids[1], "doing"),
        ("Create mobile app wireframes", "Design mobile-first user interface", project_ids[1], user_ids[4], "done"),
        ("Implement payment integration", "Set up Stripe/PayPal payment processing", project_ids[1], user_ids[1], "todo"),
        ("Write ML model documentation", "Document the training process and model architecture", project_ids[2], user_ids[2], "doing"),
        ("Create tutorial content", "Develop step-by-step Unity tutorials", project_ids[3], user_ids[3], "todo"),
        ("Design component library", "Create reusable UI components", project_ids[4], user_ids[4], "doing"),
        ("Smart contract development", "Implement voting logic in Solidity", project_ids[5], user_ids[5], "todo"),
        ("Sensor data collection", "Set up IoT sensors for data gathering", project_ids[6], user_ids[6], "doing"),
        ("Algorithm implementation", "Implement core judging algorithms", project_ids[7], user_ids[3], "todo")
    ]
    
    for title, desc, project_id, assignee_id, status in tasks:
        cursor.execute("""
            INSERT INTO tasks (title, description, project_id, assignee_id, status)
            VALUES (?, ?, ?, ?, ?)
        """, (title, desc, project_id, assignee_id, status))
    
    # Insert sample project messages
    messages = [
        ("Hey team! Just set up the initial project structure. Check it out!", user_ids[0], project_ids[0]),
        ("Great work! I'll start on the UI mockups tomorrow", user_ids[4], project_ids[0]),
        ("Should we use Socket.io for the real-time features?", user_ids[2], project_ids[0]),
        ("I think Socket.io would be perfect for our use case", user_ids[0], project_ids[0]),
        ("Mobile wireframes are ready for review!", user_ids[4], project_ids[1]),
        ("Looks good! Let's discuss the payment flow", user_ids[1], project_ids[1]),
        ("Updated the model documentation with latest results", user_ids[2], project_ids[2]),
        ("The accuracy improvements look promising!", user_ids[7], project_ids[2]),
        ("First tutorial draft is complete", user_ids[3], project_ids[3]),
        ("Component library structure is taking shape", user_ids[4], project_ids[4])
    ]
    
    for content, sender_id, project_id in messages:
        cursor.execute("""
            INSERT INTO project_messages (content, sender_id, project_id)
            VALUES (?, ?, ?)
        """, (content, sender_id, project_id))
    
    conn.commit()
    conn.close()
    print("Database seeded successfully with comprehensive MVP data!")

if __name__ == "__main__":
    seed_database()