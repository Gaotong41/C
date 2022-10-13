# Copyright (C) 2020-2022 Intel Corporation
#
# SPDX-License-Identifier: MIT

import os
import cv2
import numpy as np
from skimage.measure import approximate_polygon, find_contours
from model_loader import ModelLoader


def to_cvat_mask(box: list, mask):
    xtl, ytl, xbr, ybr = box
    flattened = mask[ytl:ybr + 1, xtl:xbr + 1].flat[:].tolist()
    flattened.extend([xtl, ytl, xbr, ybr])
    return flattened


class ModelHandler:
    def __init__(self, labels):
        base_dir = os.path.abspath(os.environ.get("MODEL_PATH",
            "/opt/nuclio/open_model_zoo/intel/semantic-segmentation-adas-0001/FP32"))
        model_xml = os.path.join(base_dir, "semantic-segmentation-adas-0001.xml")
        model_bin = os.path.join(base_dir, "semantic-segmentation-adas-0001.bin")
        self.model = ModelLoader(model_xml, model_bin)
        self.labels = labels

    def infer(self, image, threshold):
        output_layer = self.model.infer(image)

        results = []
        mask = output_layer[0, 0, :, :]
        width, height = mask.shape

        for i in range(len(self.labels)):
            mask_by_label = np.zeros((width, height), dtype=np.uint8)

            mask_by_label = ((mask == float(i))).astype(np.uint8)
            mask_by_label = cv2.resize(mask_by_label,
                dsize=(image.width, image.height),
                interpolation=cv2.INTER_CUBIC)
            cv2.normalize(mask_by_label, mask_by_label, 0, 255, cv2.NORM_MINMAX)

            contours = find_contours(mask_by_label, 0.8)

            for contour in contours:
                contour = np.flip(contour, axis=1)
                contour = approximate_polygon(contour, tolerance=2.5)

                Xmin = max(0, int(np.min(contour[:,0])))
                Xmax = max(0, int(np.max(contour[:,0])))
                Ymin = max(0, int(np.min(contour[:,1])))
                Ymax = max(0, int(np.max(contour[:,1])))
                if len(contour) < 3 or Xmax - Xmin < 4 or Ymax - Ymin < 4:
                    continue

                cvat_mask = to_cvat_mask((Xmin, Ymin, Xmax, Ymax), mask_by_label)

                results.append({
                    "confidence": None,
                    "label": self.labels.get(i, "unknown"),
                    "points": contour.ravel().tolist(),
                    "mask": cvat_mask,
                    "type": "mask",
                })

        return results
