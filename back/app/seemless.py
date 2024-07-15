import cv2
from ultralytics import YOLO    # SAM, FastSAM
import supervision as sv
import numpy as np
import math
import copy
import json
import os
from tqdm import tqdm
import matplotlib.pyplot as plt
import torch




def get_frame_masks(image: str | np.ndarray, mask_class: str = 'segmentation', save_masks: bool = True):
    torch.cuda.set_device(0)
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    print(f'Using device: {device}')

    MODEL = YOLO("yolov8x-seg.pt")    # SAM, FastSAM
    MODEL.to(device)

    if isinstance(image, str):
        image = cv2.imread(image)
    
    assert isinstance(image, np.ndarray), f'Expected str or np.ndarray, got {type(image)}'

    result = MODEL(image, verbose=False)[0]
    detections = sv.Detections.from_ultralytics(result)

    # Initialize an empty mask with the same dimensions as the image but only one channel for gray scale
    union_mask = np.zeros((image.shape[0], image.shape[1]), dtype=np.uint8)

    # segmentation mask
    seg_mask_list = []
    for i, mask in enumerate(detections.mask):
        mask = mask.astype('uint8')
        
        mask = cv2.normalize(mask, None, alpha=0, beta=255, norm_type=cv2.NORM_MINMAX)

        # Convert to grayscale if it is not already
        if len(mask.shape) > 2 and mask.shape[2] > 1:
            mask = cv2.cvtColor(mask, cv2.COLOR_BGR2GRAY)
        
        kernel = np.ones((5, 5), np.uint8)
        dilated_mask = cv2.dilate(mask, kernel, iterations=1)
        #seg_mask_list.append(dilated_mask)

        # Accumulate the mask using bitwise OR
        union_mask = cv2.bitwise_or(union_mask, dilated_mask)

    _, union_mask = cv2.threshold(union_mask, 1, 255, cv2.THRESH_BINARY)
    seg_mask_list.append(union_mask)
    # Save the union of all masks if required

    return union_mask


def source_img__target_img(source: str, target: str):
    source_img = cv2.cvtColor(source, cv2.COLOR_BGR2RGB)

    source_mask = get_frame_masks(source_img)
    return source_mask

def seamless_clone(source, target, mask_, center_coordinates):
    # Load the source, target, and mask images
    src = source
    dst = target
    mask = mask_


    if src is None or dst is None or mask is None:
        raise Exception("One or more images did not load. Check file paths and image files.")
    
    # Ensure the mask is binary
    _, mask = cv2.threshold(mask, 1, 255, cv2.THRESH_BINARY)

    # Perform seamless cloning
    output = cv2.seamlessClone(src, dst, mask, center_coordinates, cv2.NORMAL_CLONE)
    
    return output

def blend(src, trg, mask_):
    print(torch.cuda.is_available())
    mask = source_img__target_img(src, trg)
    out = seamless_clone(src, trg, mask, (int(mask_['x']), int(mask_['y'])))
    return out