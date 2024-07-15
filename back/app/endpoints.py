from flask import Flask, jsonify, request, Blueprint
from flask_cors import CORS
import requests
from flask import send_file
from io import BytesIO

import urllib
import cv2
import numpy as np
from .seemless import blend

app = Blueprint('app', __name__)

def get_image(url, width=224, height=224):
    req = urllib.request.urlopen(url)
    arr = np.asarray(bytearray(req.read()), dtype=np.uint8)
    img = cv2.imdecode(arr, -1)
    img = cv2.resize(img, (width, height))
    return img

@app.route('/blend', methods=['GET', 'POST'])
def get_blend():
    # Get the image from the request
    data = request.json
    img = data.get('image')
    bgimg = data.get('bgImage')
    mask_position = data.get('maskPosition')
    reqImg = get_image(img['url'], img['width'], img['height'])    
    reqBgImg = get_image(bgimg['url'], bgimg['width'], bgimg['height'])
    print(mask_position)
    # Perform the blending
    output = blend(reqImg, reqBgImg, mask_position)
    # Return the blended image
    cv2.imwrite('output.jpg', output)
    _, buffer = cv2.imencode('.png', output)
    byte_io = BytesIO(buffer)

    return send_file(byte_io, mimetype='image/png')