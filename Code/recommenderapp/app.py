from flask import Flask, jsonify, render_template, request
from flask_cors import CORS, cross_origin
import json
import sys
import time

sys.path.append("../../")
from Code.prediction_scripts.item_based import recommendForNewUser
from search import Search
from comments import Comments

app = Flask(__name__)
app.secret_key = "secret key"

cors = CORS(app, resources={r"/*": {"origins": "*"}})

@app.route("/")
def landing_page():
    return render_template("loading.html")

@app.route("/home")
def redirected():
    return render_template("landing_page.html")

@app.route("/predict", methods=["POST"])
def predict():
    data = json.loads(request.data)  # contains movies
    data1 = data["movie_list"]
    training_data = []
    for movie in data1:
        movie_with_rating = {"title": movie, "rating": 5.0}
        training_data.append(movie_with_rating)
    recommendations = recommendForNewUser(training_data)
    recommendations = recommendations[:5]
    resp = {"recommendations": recommendations}
    return resp


@app.route("/search", methods=["POST"])
def search():
    term = request.form["q"]
    print("term: ", term)

    search = Search()
    filtered_dict = search.resultsTop10(term)

    resp = jsonify(filtered_dict)
    resp.status_code = 200
    return resp

@app.route("/feedback", methods=["POST"])
def feedback():
    # Putting data into experiment_results
    data = json.loads(request.data)
    with open("experiment_results/feedback_{}.csv".format(int(time.time())), "w") as f:
        for key in data.keys():
            f.write("%s - %s\n" % (key, data[key]))
    
    comments = Comments()
    comments.setComments(data)
    return data

@app.route("/comments/<movie>")
def comments(movie):
    comments = Comments()
    movie_entries = comments.getComments(movie)
    return render_template("view_comments.html", movie_entries=movie_entries)


@app.route("/success")
def success():
    return render_template("success.html")

if __name__ == "__main__":
    app.run(port=5000, debug=True)
