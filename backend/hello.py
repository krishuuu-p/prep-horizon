from flask import Flask, jsonify
import mysql.connector
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import os
app = Flask(__name__)
from dotenv import load_dotenv
load_dotenv()
# Configure DB connection

given_test_id = 14

conn = mysql.connector.connect(
    user='root',
    password= os.getenv('MYSQL_PASSWORD'),
    database= 'prep_horizon',
)

questions = pd.read_sql(
    "SELECT id AS question_id, section_id,test_id "
    "FROM questions",
    conn
)
sections = pd.read_sql(
    "SELECT id AS section_id, section_name "
    "FROM sections",
    conn
)

responses = pd.read_sql(
    "SELECT student_id, question_id, marks_obtained "
    "FROM student_responses "
    "WHERE status = 'Answered'",
    conn
)
# <-- updated here: use `name` as student_name, filter to role='student'
users = pd.read_sql(
    "SELECT id AS student_id, username AS student_username, name AS student_name "
    "FROM users "
    "WHERE role = 'student'",
    conn
)

conn.close()
# 2) MERGE TOGETHER
df = (
    responses
    .merge(questions, on="question_id", how="left")
    .merge(sections,  on="section_id",  how="left")
    .merge(users,     on="student_id",  how="inner")  # inner: drop non-students
)

# 3) PIVOT: one column per section_name, summing marks_obtained
pivot = (
    df
    .pivot_table(
        index=["student_username", "student_name"],
        columns="section_name",
        values="marks_obtained",
        aggfunc="sum",
        fill_value=0
    )
    .reset_index()
)
df = df[df["test_id"] == given_test_id]


# 4) COMPUTE TOTAL & ANALYTICS

subject_columns = [c for c in pivot.columns if c not in ( "student_name","student_username")]
pivot["Total"] = pivot[subject_columns].sum(axis=1)
subject_columns.append("Total")

analytics = {}
for subj in subject_columns:
    analytics[subj] = {
        "max": pivot[subj].max(),
        "avg": pivot[subj].mean()
    }
# print(analytics)
# print(pivot)
top_student = pivot.loc[pivot["Total"].idxmax()]
# print(analytics)
# # 5) DRAW STUDENT‑WISE CHARTS
student_charts     = {}
student_pie_charts = {}

for _, row in pivot.iterrows():
    uname, sname = row["student_username"], row["student_name"]
    # print(row)

    # Donut grid
    num_subj = len(subject_columns)
    cols     = min(3, num_subj)
    rows_    = int(np.ceil(num_subj / cols))
    fig, axes = plt.subplots(rows_, cols, figsize=(5*cols, 5*rows_))
    axes = np.array(axes).flatten()
    
    for i, subj in enumerate(subject_columns):
        ax = axes[i]
        ax.set_title(subj, fontsize=16)
        max_a  = 360
        if analytics[subj]["max"] > 0:
            stud_a = max(0, row[subj] / analytics[subj]["max"] * 360)
            avg_a  = max(0, analytics[subj]["avg"] / analytics[subj]["max"] * 360)
        else:
            stud_a = 0
            avg_a  = 0
        width  = 0.2
        # ax.pie([max_a, 0], radius=1,
        #        wedgeprops=dict(width=width, edgecolor="white"),
        #        colors=["lightgray","none"], startangle=90)
        # ax.pie([stud_a, 360-stud_a], radius=1-width,
        #        wedgeprops=dict(width=width, edgecolor="white"),
        #        colors=["C0","none"], startangle=90)
        # ax.pie([avg_a, 360-avg_a], radius=1-2*width,
        #        wedgeprops=dict(width=width, edgecolor="white"),
        #        colors=["C1","none"], startangle=90)
        colors = ["#E94F37", "cyan", "#8F87F1"]
        #max marks
        ax.pie([stud_a, max(0, 360 - stud_a)], radius=1,
            wedgeprops=dict(width=width, edgecolor="white"),
            colors=[colors[1], "none"], startangle=90)
        ax.pie([avg_a, max(0, 360 - avg_a)], radius=1 -  width,
            wedgeprops=dict(width=width, edgecolor="white"),
            colors=[colors[2], "none"], startangle=90)
        ax.pie([max_a, 0], radius=1-2*width,
        wedgeprops=dict(width=width, edgecolor="white"),
        colors=[colors[0], "none"], startangle=90)
        
        ax.text(0,  0.1, f"{(row[subj]):.2f}",ha="center", va="center", fontweight="bold", fontsize=14, color=colors[1])
        ax.text(0, -0.05, f"Avg:{analytics[subj]['avg']:.2f}", ha="center", va="center", fontsize=12, color=colors[2])
        ax.text(0, -0.2, f"Max: {analytics[subj]['max']:.2f}",ha='center', va='center', fontsize=12,color=colors[0])
        ax.set(aspect="equal")
    
    for j in range(i+1, len(axes)):
        fig.delaxes(axes[j])
    
    plt.suptitle(f"{sname} (ID: {uname})", fontsize=18)
    plt.tight_layout(rect=[0,0,1,0.95])
    # path = f"static/student_{uname}.png"
    path = f"static/student_{uname}_test_{given_test_id}.png"

    plt.savefig(path)
    plt.close(fig)
    student_charts[uname] = path

    # Pie chart of subject distribution
    fig, ax = plt.subplots(figsize=(6,6))
    # vals = [row[subj] for subj in subject_columns if subj!="Total"]
    vals = [max(0, row[subj]) for subj in subject_columns if subj != "Total"]

    labs = [subj for subj in subject_columns if subj!="Total"]
    ax.pie(vals, labels=labs, autopct="%1.1f%%", startangle=90)
    ax.set_title(f"Distribution: {sname}", fontsize=16)
    # pie_path = f"static/student_pie_{uname}.png"
    pie_path = f"static/student_pie_{uname}_test_{given_test_id}.png"
    plt.savefig(pie_path)
    plt.close(fig)
    student_pie_charts[uname] = pie_path

# Output summary
# print(pivot.head())
# print("Analytics:", analytics)
# print("Top student:", top_student.to_dict())
