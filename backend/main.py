from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from pydantic import BaseModel
import hashlib

app = FastAPI()

# ---------------- CORS ----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- MongoDB ----------------

MONGO_URI = "mongodb+srv://alokmehta833_db_user:EXKlXHR2LKLG1wry@cluster0.i08ajsr.mongodb.net/gamefield?appName=Cluster0"

client = MongoClient(MONGO_URI)
db = client["quiz_app"]
users = db["users"]

# ---------------- Models ----------------
class AuthData(BaseModel):
    username: str
    password: str

# ---------------- HELPERS ----------------

def calculate_level(score: int) -> int:
    if score <= 20:
        return 1
    elif score <= 40:
        return 2
    elif score <= 60:
        return 3
    else:
        return 4


def calculate_badges(level: int):
    badges = []

    if level >= 1:
        badges.append("Eco Beginner")
    if level >= 2:
        badges.append("Green Learner")
    if level >= 3:
        badges.append("Eco Warrior")
    if level >= 4:
        badges.append("Sustainability Master")

    return badges

def add_activity(user, text, points=0):
    activity = user.get("recentActivity", [])

    activity.insert(0, {
        "text": text,
        "points": points
    })

    return activity[:5]   # keep last 5 only


def hash_password(password: str):
    return hashlib.sha256(password.encode()).hexdigest()

# ---------------- Signup ----------------
@app.post("/signup")
def signup(data: AuthData):
    if users.find_one({"username": data.username}):
        raise HTTPException(status_code=400, detail="User already exists")

    user = {
        "username": data.username,
        "password": hash_password(data.password),
        "score": 0,
        "level": 1,
        "badges": [],
        "notifications": 0,
        "streak": 0,
        "carbonSaved": 0,
        "recentActivity": [],
        "subjectCertificates": [],
        "levelCertificates": []
    }

    users.insert_one(user)

    # ❗ remove non-JSON fields
    user.pop("password", None)
    user.pop("_id", None)

    return {
        "success": True,
        "user": user
    }

# ---------------- Login ----------------
@app.post("/login")
def login(data: AuthData):
    user = users.find_one({"username": data.username})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user["password"] != hash_password(data.password):
        raise HTTPException(status_code=401, detail="Wrong password")

    user.pop("password", None)
    user.pop("_id", None)

    return {
        "success": True,
        "user": user
    }


# ---------------- Get User ----------------
@app.get("/user/{username}")
def get_user(username: str):
    user = users.find_one({"username": username})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # --------------------
    # CORE CALCULATIONS
    # --------------------
    score = user.get("score", 0)
    old_level = user.get("level", 1)
    old_rank = user.get("rank", None)

    level = calculate_level(score)
    badges = calculate_badges(level)

    # Rank calculation
    rank = users.count_documents({"score": {"$gt": score}}) + 1

    # --------------------
    # RECENT ACTIVITY LOGIC
    # --------------------
    recent_activity = user.get("recentActivity", [])

    # Level up activity
    if level > old_level:
        recent_activity.insert(0, {
            "text": f"Level Up! Reached Level {level}",
            "points": 0
        })

    # Rank improvement activity
    if old_rank and rank < old_rank:
        recent_activity.insert(0, {
            "text": f"Rank improved to #{rank}",
            "points": 0
        })

    # keep only last 5
    recent_activity = recent_activity[:5]

    # --------------------
    # PERSIST EVERYTHING
    # --------------------
    users.update_one(
        {"username": username},
        {"$set": {
            "level": level,
            "badges": badges,
            "rank": rank,
            "recentActivity": recent_activity
        }}
    )

    # --------------------
    # RESPONSE
    # --------------------
    return {
        "username": user["username"],
        "score": score,
        "level": level,
        "rank": rank,

        "badges": badges,
        "notifications": user.get("notifications", 0),
        "streak": user.get("streak", 0),
        "carbonSaved": user.get("carbonSaved", 0),
        "recentActivity": recent_activity,

        "subjectCertificates": user.get("subjectCertificates", []),
        "levelCertificates": user.get("levelCertificates", [])
    }



# ---------------- Quiz Submit ----------------
@app.post("/quiz/submit")
def submit_quiz(data: dict):
    username = data["username"]
    domain = data["domain"]
    quiz_score = data["score"]

    user = users.find_one({"username": username})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    old_score = user.get("score", 0)
    old_level = user.get("level", 1)

    total_score = old_score + quiz_score
    level = calculate_level(total_score)
    badges = calculate_badges(level)

    # ---- Certificates ----
    subject_certs = set(user.get("subjectCertificates", []))
    new_subject = domain not in subject_certs
    subject_certs.add(domain)

    level_certs = set(user.get("levelCertificates", []))
    for i in range(1, level + 1):
        level_certs.add(i)

    # ---- Activity ----
    activity = user.get("recentActivity", [])

    activity = add_activity(
        user,
        f"Completed {domain} quiz",
        quiz_score
    )

    if level > old_level:
        activity = add_activity(
            {"recentActivity": activity},
            f"Level Up! Reached Level {level}"
        )

    if new_subject:
        activity = add_activity(
            {"recentActivity": activity},
            f"Earned certificate in {domain}"
        )

    users.update_one(
        {"username": username},
        {"$set": {
            "score": total_score,
            "level": level,
            "badges": badges,
            "recentActivity": activity,
            "subjectCertificates": list(subject_certs),
            "levelCertificates": list(level_certs)
        }}
    )

    return {"success": True}

# ---------------- LEADERBOARD ----------------
@app.get("/leaderboard")
def leaderboard():
    cursor = users.find(
        {},
        {
            "_id": 0,
            "username": 1,
            "score": 1,
            "level": 1,
            "subjectCertificates": 1,
            "levelCertificates": 1
        }
    ).sort("score", -1)

    leaderboard = []
    for user in cursor:
        leaderboard.append({
            "username": user.get("username"),
            "score": user.get("score", 0),
            "level": user.get("level", 1),
            "subjectCertificates": user.get("subjectCertificates", []),
            "levelCertificates": user.get("levelCertificates", [])
        })

    return leaderboard

@app.get("/certificates/{username}")
def get_certificates(username: str):
    user = users.find_one({"username": username})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "username": username,
        "subjectCertificates": user.get("subjectCertificates", []),
        "levelCertificates": user.get("levelCertificates", [])
    }

@app.get("/profile/{username}")
def get_profile(username: str):
    user = users.find_one({"username": username})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    score = user.get("score", 0)
    level = calculate_level(score)
    badges = calculate_badges(level)
    rank = users.count_documents({"score": {"$gt": score}}) + 1

    return {
        "username": user["username"],
        "score": score,
        "level": level,
        "rank": rank,
        "badges": badges,
        "streak": user.get("streak", 0),
        "carbonSaved": user.get("carbonSaved", 0),
        "subjectCertificates": user.get("subjectCertificates", []),
        "levelCertificates": user.get("levelCertificates", [])
    }


