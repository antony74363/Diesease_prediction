from flask import Flask,request, url_for, redirect, render_template
import pickle
import numpy as np

app = Flask(__name__)

model=pickle.load(open('diabetes_trained_model.pkl','rb'))


@app.route('/')
def hello_world():
    return render_template("index.html")


@app.route('/predict',methods=['POST','GET'])
def predict():
    try:
        int_features = [float(x) for x in request.form.values()]
        final = [np.array(int_features)]
        print(final)
        prediction = model.predict_proba(final)
        output = '{0:.{1}f}'.format(prediction[0][1], 3)
        print(type(output))
        if (output[0] == str(0)):
             return render_template('index.html',pred='Probability of diabetes is {}. You are safe dawg ......for now atleast...'.format(output),bhai="kuch karna hain iska ab?")
        else:
             return render_template('index.html',pred='Your Forest is safe.\n Probability of fire occuring is {}'.format(output),bhai="Your Forest is Safe for now")
    except Exception as e:
        return render_template('index.html', pred='Error: {}'.format(e), bhai="Please check your input values.")


if __name__ == '__main__':
    app.run(debug=True)