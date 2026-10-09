import json, os

base = r"D:\GitHub\blog-demo - 1\source\_posts\CS-Fundamentals"
with open(os.path.join(base, "_schedule.json"), encoding="utf-8") as f:
    sched = json.load(f)

for i, e in enumerate(sched, 1):
    p = os.path.join(base, e["subdir"], e["filename"])
    if not os.path.exists(p):
        print("FIRST_MISSING_INDEX", i)
        print("date", e["date"])
        print("course", e["course"])
        print("title", e["title"])
        print("filename", e["filename"])
        print("abbrlink", e["abbrlink"])
        print("path", p)
        break
else:
    print("ALL_DONE")
