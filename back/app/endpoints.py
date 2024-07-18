from flask import Flask, jsonify, request, Blueprint
from flask_cors import CORS
import requests
from flask import send_file
from io import BytesIO

import urllib
import cv2
import numpy as np
from .seemless import blend, get_frame_masks


app = Blueprint('app', __name__)

IMG_EXTENSIONS = ['png', 'jpg', 'jpeg']
VIDEO_EXTENSIONS = ['mp4', 'avi']




def get_image(url, width=224, height=224, MODE = "img-img"):
    req = urllib.request.urlopen(url)
    content_type = req.headers.get('Content-Type')
    file_extension = content_type.split('/')[-1]
    if file_extension in VIDEO_EXTENSIONS:
        
        if MODE == 'img-img':
            MODE = "video-img"
        else:
            MODE = 'video-video'
        return url, MODE
        

    if file_extension in IMG_EXTENSIONS:
        arr = np.asarray(bytearray(req.read()), dtype=np.uint8)
        img = cv2.imdecode(arr, -1)
        img = cv2.resize(img, (width, height))
        return img, MODE

@app.route('/blend', methods=['GET', 'POST'])
def get_blend():
    # Get the image from the request
    data = request.json
    img = data.get('image')
    bgimg = data.get('bgImage')
    mask_position = data.get('maskPosition')
    reqImg, MODE = get_image(img['url'], img['width'], img['height'], "img-img")    
    reqBgImg, MODE = get_image(bgimg['url'], bgimg['width'], bgimg['height'], MODE)
    # Perform the blending
    output = blend(reqBgImg, reqImg, mask_position, MODE)
    # Return the blended image
    cv2.imwrite('output.jpg', output)
    _, buffer = cv2.imencode('.png', output)
    byte_io = BytesIO(buffer)

    return send_file(byte_io, mimetype='image/png')