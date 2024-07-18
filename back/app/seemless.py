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

import concurrent.futures

def get_blended_source(src_img: np.ndarray, mask_list: np.ndarray, target_img: np.ndarray):
    result = target_img.copy()

    num_patches = 0
    for zone, src_patch, mask_patch, target_patch in get_patches(src_img, mask_list, target_img):
        target_top, target_left, target_bottom, target_right = zone
    
        blend_patch = do_blending(src_patch, mask_patch, target_patch)
        result[target_top:target_bottom, target_left:target_right, :] = blend_patch.copy()

        im_list = [(src_patch, 'source'), (mask_patch, 'mask'), (target_patch, 'target'), (blend_patch, 'blend')]
        
    return (result * 255).astype('uint8')

def get_video_masks(video_path: str, shape: tuple = None):
    cap = cv2.VideoCapture(video_path)
    n_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    with concurrent.futures.ThreadPoolExecutor() as executor:
        futures = []
        for _ in range(n_frames):
            ret, frame = cap.read()
            if not ret:
                break
            if shape is not None:
                frame = cv2.resize(frame, shape[:2][::-1])
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            frame = frame.astype('double') / 255.0
            futures.append(executor.submit(get_frame_masks, frame))

        for future in concurrent.futures.as_completed(futures):
            yield future.result()
    
    cap.release()

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

def source_video__target_img_test(source_path: str, background: np.ndarray, mask_):
    # Preprocesing of image target
    target_img = background
    target_img = target_img.astype('double') / 255.0
    

    # TODO: ajustar el tama;o de source y target a un valor razonable
    # Obtaining shape of target img to reshaping
    target_shape = target_img.shape
    process_shape = (target_shape[0] // 5, target_shape[1] // 5, target_shape[2])

    target_img = cv2.resize(target_img, process_shape[:2][::-1])
    
    output = get_video_masks(source_path, shape=process_shape)
    return output

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

def blend(src, trg, mask_, mode):
    print(torch.cuda.is_available())
    if mode == 'img-img':
        mask = source_img__target_img(src, trg)
        out = seamless_clone(src, trg, mask, (int(mask_['x']), int(mask_['y'])))
        return out
    elif mode == 'video-img':
        masks = source_video__target_img_test(src, trg, mask_)
        out = []
        for mask in masks:
            out.append(seamless_clone(src, trg, mask, (int(mask_['x']), int(mask_['y']))))
        # Convert the list of output images to a video
        output_video = cv2.VideoWriter('output_video.mp4', cv2.VideoWriter_fourcc(*'mp4v'), 30, (out[0].shape[1], out[0].shape[0]))

        for frame in out:
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            output_video.write(frame)

        output_video.release()
        return out