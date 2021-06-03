# Copyright (C) 2020 Intel Corporation
#
# SPDX-License-Identifier: MIT


import io
import os
import os.path as osp
import random
import shutil
import tempfile
import xml.etree.ElementTree as ET
import json
import zipfile
from collections import defaultdict
from enum import Enum
from glob import glob
from io import BytesIO
from unittest import mock
import copy
from shutil import copyfile

import av
import numpy as np
from pdf2image import convert_from_bytes
from django.conf import settings
from django.contrib.auth.models import Group, User
from django.http import HttpResponse
from PIL import Image
from pycocotools import coco as coco_loader
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from cvat.apps.engine.models import (AttributeSpec, AttributeType, Data, Job, Project,
    Segment, StatusChoice, Task, Label, StorageMethodChoice, StorageChoice)
from cvat.apps.engine.media_extractors import ValidateDimension
from cvat.apps.engine.models import DimensionType
from utils.dataset_manifest import ImageManifestManager, VideoManifestManager
import cvat.apps.dataset_manager as dm
from cvat.apps.dataset_manager.bindings import CvatTaskDataExtractor, TaskData
from cvat.apps.dataset_manager.task import TaskAnnotation
from cvat.apps.dataset_manager.annotation import TrackManager
from cvat.apps.engine.models import Task
from datumaro.util.test_utils import TestDir

CREATE_ACTION = "create"
UPDATE_ACTION = "update"
DELETE_ACTION = "delete"

TEST_DATA_ROOT = "/tmp/cvat"

class ForceLogin:
    def __init__(self, user, client):
        self.user = user
        self.client = client

    def __enter__(self):
        if self.user:
            self.client.force_login(self.user,
                backend='django.contrib.auth.backends.ModelBackend')

        return self

    def __exit__(self, exception_type, exception_value, traceback):
        if self.user:
            self.client.logout()

class _DbTestBase(APITestCase):
    def setUp(self):
        self.client = APIClient()

    @classmethod
    def setUpTestData(cls):
        cls.create_db_users()

    @classmethod
    def create_db_users(cls):
        (group_admin, _) = Group.objects.get_or_create(name="admin")
        (group_user, _) = Group.objects.get_or_create(name="user")

        user_admin = User.objects.create_superuser(username="admin", email="",
            password="admin")
        user_admin.groups.add(group_admin)
        user_dummy = User.objects.create_user(username="user", password="user")
        user_dummy.groups.add(group_user)

        cls.admin = user_admin
        cls.user = user_dummy

    def _put_api_v1_task_id_annotations(self, tid, data):
        with ForceLogin(self.admin, self.client):
            response = self.client.put("/api/v1/tasks/%s/annotations" % tid,
                                       data=data, format="json")

        return response

    def _put_api_v1_job_id_annotations(self, jid, data):
        with ForceLogin(self.admin, self.client):
            response = self.client.put("/api/v1/jobs/%s/annotations" % jid,
                                       data=data, format="json")

        return response

    def _patch_api_v1_task_id_annotations(self, tid, data, action, user):
        with ForceLogin(user, self.client):
            response = self.client.patch(
                "/api/v1/tasks/{}/annotations?action={}".format(tid, action),
                data=data, format="json")

        return response

    def _patch_api_v1_job_id_annotations(self, jid, data, action, user):
        with ForceLogin(user, self.client):
            response = self.client.patch(
                "/api/v1/jobs/{}/annotations?action={}".format(jid, action),
                data=data, format="json")

        return response

    def _create_task(self, data, image_data):
        with ForceLogin(self.user, self.client):
            response = self.client.post('/api/v1/tasks', data=data, format="json")
            assert response.status_code == status.HTTP_201_CREATED, response.status_code
            tid = response.data["id"]

            response = self.client.post("/api/v1/tasks/%s/data" % tid,
                data=image_data)
            assert response.status_code == status.HTTP_202_ACCEPTED, response.status_code

            response = self.client.get("/api/v1/tasks/%s" % tid)
            task = response.data

        return task

    @staticmethod
    def _get_tmp_annotation(task, tmp_annotations):
        for item in tmp_annotations:
            if item in ["tags", "shapes", "tracks"]:
                for index_elem, _ in enumerate(tmp_annotations[item]):
                    tmp_annotations[item][index_elem]["label_id"] = task["labels"][0]["id"]

                    for index_attribute, attribute in enumerate(task["labels"][0]["attributes"]):
                        spec_id = task["labels"][0]["attributes"][index_attribute]["id"]

                        value = attribute["default_value"]

                        if item == "tracks" and attribute["mutable"]:
                            for index_shape, _ in enumerate(tmp_annotations[item][index_elem]["shapes"]):
                                tmp_annotations[item][index_elem]["shapes"][index_shape]["attributes"].append({
                                    "spec_id": spec_id,
                                    "value": value,
                                })
                        else:
                            tmp_annotations[item][index_elem]["attributes"].append({
                                "spec_id": spec_id,
                                "value": value,
                            })
        return tmp_annotations

    def _get_jobs(self, task_id):
        with ForceLogin(self.admin, self.client):
            response = self.client.get("/api/v1/tasks/{}/jobs".format(task_id))
        return response.data

    def _get_request(self, path, user):
        with ForceLogin(user, self.client):
            response = self.client.get(path)
        return response

    def _get_request_with_data(self, path, data, user):
        with ForceLogin(user, self.client):
            response = self.client.get(path, data)
        return response

    def _delete_request(self, path, user):
        with ForceLogin(user, self.client):
            response = self.client.delete(path)
        return response

    def _download_file(self, url, data, user, file_name):
        for _ in range(5):
            response = self._get_request_with_data(url, data, user)
            if response.status_code == status.HTTP_200_OK:
                content = BytesIO(b"".join(response.streaming_content))
                with open(file_name, "wb") as f:
                    f.write(content.getvalue())
                break
        return response

    def _upload_file(self, url, binary_file, user):
        with ForceLogin(user, self.client):
            for _ in range(5):
                response = self.client.put(url, {"annotation_file": binary_file})
                if response.status_code == status.HTTP_201_CREATED:
                    break
            return response

    def _generate_url_dump_tasks_annotations(self, task_id):
        return f"/api/v1/tasks/{task_id}/annotations"

    def _generate_url_upload_tasks_annotations(self, task_id, upload_format_name):
        return f"/api/v1/tasks/{task_id}/annotations?format={upload_format_name}"

    def _generate_url_dump_job_annotations(self, job_id):
        return f"/api/v1/jobs/{job_id}/annotations"

    def _generate_url_upload_job_annotations(self, job_id, upload_format_name):
        return f"/api/v1/jobs/{job_id}/annotations?format={upload_format_name}"

    def _generate_url_dump_dataset(self, task_id):
        return f"/api/v1/tasks/{task_id}/dataset"

    def _remove_annotations(self, tid):
        response = self._delete_request(f"/api/v1/tasks/{tid}/annotations", self.admin)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        return response

    def _dump_api_v1_tasks_id_annotations(self, url, data, user):
        with ForceLogin(user, self.client):
            response = self.client.get(url, data)
        return response

    def _upload_api_v1_tasks_id_annotations(self, url, data, user):
        with ForceLogin(user, self.client):
            response = self.client.put(url, data)
        return response

    def _delete_task(self, tid):
        response = self._delete_request('/api/v1/tasks/{}'.format(tid), self.admin)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        return response

    def _get_dumped_annotation(self, content, format_name):
        def etree_to_dict(t):
            d = {t.tag: {} if t.attrib else None}
            children = list(t)
            if children:
                dd = defaultdict(list)
                for dc in map(etree_to_dict, children):
                    for k, v in dc.items():
                        dd[k].append(v)
                d = {t.tag: {k: v[0] if len(v) == 1 else v
                             for k, v in dd.items()}}
            if t.attrib:
                d[t.tag].update(('@' + k, v)
                                for k, v in t.attrib.items())
            if t.text:
                text = t.text.strip()
                if children or t.attrib:
                    if text:
                        d[t.tag]['#text'] = text
                else:
                    d[t.tag] = text
            return d
        ann_data = {}
        if format_name == "Velodyne Points Format 1.0":
            with tempfile.TemporaryDirectory() as tmp_dir:
                zipfile.ZipFile(content).extractall(tmp_dir)
                xmls = glob(osp.join(tmp_dir, '**', '*.xml'), recursive=True)
                self.assertTrue(xmls)
                for xml in xmls:
                    xmlroot = ET.parse(xml).getroot()
                    print(xmlroot)
                    ann_data = etree_to_dict(xmlroot)
        elif format_name == "Point Cloud Format 1.0":
            with tempfile.TemporaryDirectory() as tmp_dir:
                zipfile.ZipFile(content).extractall(tmp_dir)
                jsons = glob(osp.join(tmp_dir, '**', '*.json'), recursive=True)
                self.assertTrue(jsons)
                for json_file in jsons:
                    with open(json_file) as f:
                        tmp_data = json.load(f)
                    if "key_id_map.json" in json_file:
                        ann_data["key_id_map"] = tmp_data
                    if "meta.jsom" in json_file:
                        ann_data["meta"] = tmp_data
                    if "ann/000001.pcd.json" in json_file:
                        ann_data["ann"] = tmp_data
        return ann_data


class Task3DTest(_DbTestBase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls._image_sizes = {}
        cls.pointcloud_pcd_filename = "test_canvas3d.zip"
        cls.tmp_pointcloud_pcd_path = osp.join(TEST_DATA_ROOT, cls.pointcloud_pcd_filename)
        cls.pointcloud_pcd_path = osp.join(os.path.dirname(__file__), 'assets', cls.pointcloud_pcd_filename)
        image_sizes = []
        zip_file = zipfile.ZipFile(cls.pointcloud_pcd_path )
        for info in zip_file.namelist():
            if info.rsplit(".", maxsplit=1)[-1] == "pcd":
                with zip_file.open(info, "r") as file:
                    data = ValidateDimension.get_pcd_properties(file)
                    image_sizes.append((int(data["WIDTH"]), int(data["HEIGHT"])))
        cls.task = {
            "name": "my task #1",
            "owner_id": 1,
            "assignee_id": 2,
            "overlap": 0,
            "segment_size": 100,
            "labels": [
                {"name": "car",
                 "attributes": [
                     {
                         "name": "model",
                         "mutable": False,
                         "input_type": "select",
                         "default_value": "mazda",
                         "values": ["bmw", "mazda", "renault"]
                     },
                     {
                         "name": "parked",
                         "mutable": True,
                         "input_type": "checkbox",
                         "default_value": "false"
                     },
                 ]
                 },
                {"name": "person"},
            ]
        }
        cls.cuboid_example = {
            "version": 0,
            "tags": [],
            "shapes": [
                {
                    "type": "cuboid",
                    "occluded": False,
                    "z_order": 0,
                    "points": [0.106, 0.202, -0.268, 0, -0.149, 0, 4.843, 4.483, 4.125],
                    "frame": 0,
                    "label_id": None,
                    "group": 0,
                    "source": "manual",
                    "attributes": []
                },
            ],
            "tracks": []
        }
        cls._image_sizes[cls.pointcloud_pcd_filename] = image_sizes
        cls.expected_action = {
            cls.admin: {'name': 'admin', 'code': status.HTTP_200_OK, 'annotation_changed': True},
            cls.user: {'name': 'user', 'code': status.HTTP_200_OK, 'annotation_changed': True},
            None: {'name': 'none', 'code': status.HTTP_401_UNAUTHORIZED, 'annotation_changed': False},
        }
        cls.expected_dump_upload = {
            cls.admin: {'name': 'admin', 'code': status.HTTP_200_OK, 'create code': status.HTTP_201_CREATED,
                         'accept code': status.HTTP_202_ACCEPTED, 'file_exists': True, 'annotation_loaded': True},
            cls.user: {'name': 'user', 'code': status.HTTP_200_OK, 'create code': status.HTTP_201_CREATED,
                        'accept code': status.HTTP_202_ACCEPTED, 'file_exists': True, 'annotation_loaded': True},
            None: {'name': 'none', 'code': status.HTTP_401_UNAUTHORIZED, 'create code': status.HTTP_401_UNAUTHORIZED,
                   'accept code': status.HTTP_401_UNAUTHORIZED, 'file_exists': False, 'annotation_loaded': False},
        }

    def copy_pcd_file_and_get_task_data(self, test_dir):
        tmp_file = osp.join(test_dir, self.pointcloud_pcd_filename)
        copyfile(self.pointcloud_pcd_path, tmp_file)
        task_data = {
            "client_files[0]": open(tmp_file, 'rb'),
            "image_quality": 100,
        }
        return task_data

    def test_api_v1_create_annotation_in_job(self):
        with TestDir() as test_dir:
            task_data = self.copy_pcd_file_and_get_task_data(test_dir)
            task = self._create_task(self.task, task_data)
            task_id = task["id"]
            annotation = self._get_tmp_annotation(task, self.cuboid_example)

            for user, edata in list(self.expected_action.items()):
                with self.subTest(format=edata["name"]):
                    response = self._patch_api_v1_task_id_annotations(task_id, annotation, CREATE_ACTION, user)
                    self.assertEqual(response.status_code, edata["code"])
                    if edata["annotation_changed"]:
                        task_ann = TaskAnnotation(task_id)
                        task_ann.init_from_db()
                        task_shape = task_ann.data["shapes"][0]
                        task_shape.pop("id")
                        self.assertEqual(task_shape, self.cuboid_example["shapes"][0])
                        self._remove_annotations(task_id)

    def test_api_v1_update_annotation_in_task(self):
        with TestDir() as test_dir:
            task_data = self.copy_pcd_file_and_get_task_data(test_dir)
            task = self._create_task(self.task, task_data)
            task_id = task["id"]
            annotation = self._get_tmp_annotation(task, self.cuboid_example)
            response = self._put_api_v1_task_id_annotations(task_id, annotation)
            self.assertEqual(response.status_code, status.HTTP_200_OK)

            for user, edata in list(self.expected_action.items()):
                with self.subTest(format=edata["name"]):
                    task_ann_prev = TaskAnnotation(task_id)
                    task_ann_prev.init_from_db()
                    annotation["shapes"][0]["points"] = [x + 0.1 for x in annotation["shapes"][0]["points"]]
                    annotation["shapes"][0]["id"] = task_ann_prev.data["shapes"][0]["id"]
                    response = self._patch_api_v1_task_id_annotations(task_id, annotation, UPDATE_ACTION, user)
                    self.assertEqual(response.status_code, edata["code"], task_id)

                    if edata["annotation_changed"]:
                        task_ann = TaskAnnotation(task_id)
                        task_ann.init_from_db()
                        self.assertEqual(task_ann.data["shapes"], annotation["shapes"])

    def test_api_v1_delete_annotation_in_task(self):
        with TestDir() as test_dir:
            task_data = self.copy_pcd_file_and_get_task_data(test_dir)
            task = self._create_task(self.task, task_data)
            task_id = task["id"]
            annotation = self._get_tmp_annotation(task, self.cuboid_example)

            for user, edata in list(self.expected_action.items()):
                with self.subTest(format=edata["name"]):
                    response = self._patch_api_v1_task_id_annotations(task_id, annotation, CREATE_ACTION, self.admin)
                    self.assertEqual(response.status_code, status.HTTP_200_OK)
                    task_ann_prev = TaskAnnotation(task_id)
                    task_ann_prev.init_from_db()
                    annotation["shapes"][0]["id"] = task_ann_prev.data["shapes"][0]["id"]

                    response = self._patch_api_v1_task_id_annotations(task_id, annotation, DELETE_ACTION, user)
                    self.assertEqual(response.status_code, edata["code"])

                    if edata["annotation_changed"]:
                        task_ann = TaskAnnotation(task_id)
                        task_ann.init_from_db()
                        self.assertTrue(len(task_ann.data["shapes"]) == 0)

    def test_api_v1_create_annotation_in_jobs(self):
        with TestDir() as test_dir:
            task_data = self.copy_pcd_file_and_get_task_data(test_dir)
            task = self._create_task(self.task, task_data)
            task_id = task["id"]
            annotation = self._get_tmp_annotation(task, self.cuboid_example)
            jobs = self._get_jobs(task_id)
            for user, edata in list(self.expected_action.items()):
                with self.subTest(format=edata["name"]):
                    response = self._patch_api_v1_job_id_annotations(jobs[0]["id"], annotation, CREATE_ACTION, user)
                    self.assertEqual(response.status_code, edata["code"])

                    task_ann = TaskAnnotation(task_id)
                    task_ann.init_from_db()
                    if len(task_ann.data["shapes"]):
                        task_shape = task_ann.data["shapes"][0]
                        task_shape.pop("id")
                        self.assertEqual(task_shape, self.cuboid_example["shapes"][0])

    def test_api_v1_update_annotation_in_job(self):
        with TestDir() as test_dir:
            task_data = self.copy_pcd_file_and_get_task_data(test_dir)
            task = self._create_task(self.task, task_data)
            task_id = task["id"]
            jobs = self._get_jobs(task_id)
            annotation = self._get_tmp_annotation(task, self.cuboid_example)

            response = self._put_api_v1_task_id_annotations(task_id, annotation)
            self.assertEqual(response.status_code, status.HTTP_200_OK)

            for user, edata in list(self.expected_action.items()):
                with self.subTest(format=edata["name"]):
                    task_ann_prev = TaskAnnotation(task_id)
                    task_ann_prev.init_from_db()

                    annotation["shapes"][0]["points"] = [x + 0.1 for x in annotation["shapes"][0]["points"]]
                    annotation["shapes"][0]["id"] = task_ann_prev.data["shapes"][0]["id"]

                    response = self._patch_api_v1_job_id_annotations(jobs[0]["id"], annotation, UPDATE_ACTION, user)
                    self.assertEqual(response.status_code, edata["code"])

                    if edata["annotation_changed"]:
                        task_ann = TaskAnnotation(task_id)
                        task_ann.init_from_db()
                        self.assertEqual(task_ann.data["shapes"], annotation["shapes"])

    def test_api_v1_delete_annotation_in_job(self):
        with TestDir() as test_dir:
            task_data = self.copy_pcd_file_and_get_task_data(test_dir)
            task = self._create_task(self.task, task_data)
            task_id = task["id"]
            jobs = self._get_jobs(task_id)
            annotation = self._get_tmp_annotation(task, self.cuboid_example)

            for user, edata in list(self.expected_action.items()):
                with self.subTest(format=edata["name"]):
                    response = self._patch_api_v1_job_id_annotations(jobs[0]["id"], annotation, CREATE_ACTION, self.admin)
                    self.assertEqual(response.status_code, status.HTTP_200_OK)

                    task_ann_prev = TaskAnnotation(task_id)
                    task_ann_prev.init_from_db()
                    annotation["shapes"][0]["id"] = task_ann_prev.data["shapes"][0]["id"]
                    response = self._patch_api_v1_job_id_annotations(jobs[0]["id"], annotation, DELETE_ACTION, user)
                    self.assertEqual(response.status_code, edata["code"])

                    if edata["annotation_changed"]:
                        task_ann = TaskAnnotation(task_id)
                        task_ann.init_from_db()
                        self.assertTrue(len(task_ann.data["shapes"]) == 0)

    def test_api_v1_dump_and_upload_annotation(self):
        format_names = ["Point Cloud Format 1.0", "Velodyne Points Format 1.0"]
        with TestDir() as test_dir:
            task_data = self.copy_pcd_file_and_get_task_data(test_dir)
            task = self._create_task(self.task, task_data)
            task_id = task["id"]
            annotation = self._get_tmp_annotation(task, self.cuboid_example)
            response = self._put_api_v1_task_id_annotations(task_id, annotation)
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            task_ann_prev = TaskAnnotation(task_id)
            task_ann_prev.init_from_db()

            for format_name in format_names:
                for user, edata in list(self.expected_dump_upload.items()):
                    with self.subTest(format=f"{format_names}_{edata['name']}_dump"):
                        url = self._generate_url_dump_tasks_annotations(task_id)
                        file_name = osp.join(test_dir, f"{format_name}_{edata['name']}.zip")

                        data = {
                            "format": format_name,
                        }
                        response = self._dump_api_v1_tasks_id_annotations(url, data, user)
                        self.assertEqual(response.status_code, edata['accept code'])
                        response = self._dump_api_v1_tasks_id_annotations(url, data, user)
                        self.assertEqual(response.status_code, edata['create code'])
                        data = {
                            "format": format_name,
                            "action": "download",
                        }
                        response = self._dump_api_v1_tasks_id_annotations(url, data, user)
                        self.assertEqual(response.status_code, edata['code'])
                        if response.status_code == status.HTTP_200_OK:
                            content = io.BytesIO(b"".join(response.streaming_content))
                            with open(file_name, "wb") as f:
                                f.write(content.getvalue())
                        self.assertEqual(osp.exists(file_name), edata['file_exists'])

            self._remove_annotations(task_id)
            with self.subTest(format=f"{format_names}_upload"):
                file_name = osp.join(test_dir, f"{format_name}_admin.zip")
                url = self._generate_url_upload_tasks_annotations(task_id, format_name)

                with open(file_name, 'rb') as binary_file:
                    response = self._upload_api_v1_tasks_id_annotations(url, {"annotation_file": binary_file}, user)
                    self.assertEqual(response.status_code, edata['accept code'])
                    response = self._upload_api_v1_tasks_id_annotations(url, {}, user)
                    self.assertEqual(response.status_code, edata['create code'])
                task_ann = TaskAnnotation(task_id)
                task_ann.init_from_db()
                #self.assertEqual(task_ann_prev.data, task_ann.data)

    def test_api_v1_rewrite_annotation(self):
        format_names = ["Point Cloud Format 1.0", "Velodyne Points Format 1.0"]
        with TestDir() as test_dir:
            task_data = self.copy_pcd_file_and_get_task_data(test_dir)
            task = self._create_task(self.task, task_data)
            task_id = task["id"]
            for format_name in format_names:
                with self.subTest(format=f"{format_names}"):
                    annotation = self._get_tmp_annotation(task, self.cuboid_example)
                    response = self._put_api_v1_task_id_annotations(task_id, annotation)
                    self.assertEqual(response.status_code, status.HTTP_200_OK)
                    task_ann_prev = TaskAnnotation(task_id)
                    task_ann_prev.init_from_db()
                    url = self._generate_url_dump_tasks_annotations(task_id)
                    file_name = osp.join(test_dir, f"{format_name}.zip")
                    data = {
                        "format": format_name,
                    }
                    response = self._dump_api_v1_tasks_id_annotations(url, data, self.admin)
                    self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
                    response = self._dump_api_v1_tasks_id_annotations(url, data, self.admin)
                    self.assertEqual(response.status_code, status.HTTP_201_CREATED)
                    data = {
                        "format": format_name,
                        "action": "download",
                    }
                    response = self._dump_api_v1_tasks_id_annotations(url, data, self.admin)
                    self.assertEqual(response.status_code, status.HTTP_200_OK)
                    if response.status_code == status.HTTP_200_OK:
                        content = io.BytesIO(b"".join(response.streaming_content))
                        with open(file_name, "wb") as f:
                            f.write(content.getvalue())
                    self.assertTrue(osp.exists(file_name))

                    self._remove_annotations(task_id)
                    # rewrite annotation
                    annotation = self._get_tmp_annotation(task, self.cuboid_example)
                    annotation["shapes"][0]["points"] = [0, 0, 0, 0, 0, 0, 0, 0, 0]
                    response = self._put_api_v1_task_id_annotations(task_id, annotation)
                    self.assertEqual(response.status_code, status.HTTP_200_OK)

                    file_name = osp.join(test_dir, f"{format_name}.zip")
                    url = self._generate_url_upload_tasks_annotations(task_id, format_name)

                    with open(file_name, 'rb') as binary_file:
                        response = self._upload_api_v1_tasks_id_annotations(url, {"annotation_file": binary_file}, self.admin)
                        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
                        response = self._upload_api_v1_tasks_id_annotations(url, {}, self.admin)
                        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
                    task_ann = TaskAnnotation(task_id)
                    task_ann.init_from_db()
                    #self.assertEqual(task_ann_prev.data, task_ann.data)
                    self._remove_annotations(task_id)

    def test_api_v1_dump_and_upload_empty_annotation(self):
        format_names = ["Point Cloud Format 1.0", "Velodyne Points Format 1.0"]
        with TestDir() as test_dir:
            task_data = self.copy_pcd_file_and_get_task_data(test_dir)
            task = self._create_task(self.task, task_data)
            task_id = task["id"]
            for format_name in format_names:
                with self.subTest(format=f"{format_names}"):
                    url = self._generate_url_dump_tasks_annotations(task_id)
                    file_name = osp.join(test_dir, f"{format_name}.zip")
                    data = {
                        "format": format_name,
                    }
                    response = self._dump_api_v1_tasks_id_annotations(url, data, self.admin)
                    self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
                    response = self._dump_api_v1_tasks_id_annotations(url, data, self.admin)
                    self.assertEqual(response.status_code, status.HTTP_201_CREATED)
                    data = {
                        "format": format_name,
                        "action": "download",
                    }
                    response = self._dump_api_v1_tasks_id_annotations(url, data, self.admin)
                    self.assertEqual(response.status_code, status.HTTP_200_OK)
                    if response.status_code == status.HTTP_200_OK:
                        content = io.BytesIO(b"".join(response.streaming_content))
                        with open(file_name, "wb") as f:
                            f.write(content.getvalue())
                    self.assertTrue(osp.exists(file_name))

                    file_name = osp.join(test_dir, f"{format_name}.zip")
                    url = self._generate_url_upload_tasks_annotations(task_id, format_name)

                    with open(file_name, 'rb') as binary_file:
                        response = self._upload_api_v1_tasks_id_annotations(url, {"annotation_file": binary_file},
                                                                            self.admin)
                        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
                        response = self._upload_api_v1_tasks_id_annotations(url, {}, self.admin)
                        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

                    response = self._get_request(f"/api/v1/tasks/{task_id}/annotations", self.admin)
                    # self.assertEqual(len(response.data["shapes"]), 2)
                    # self.assertEqual(task_ann_prev.data, task_ann.data)

    def test_api_v1_dump_and_upload_tag_annotation(self):
        format_names = ["Point Cloud Format 1.0", "Velodyne Points Format 1.0"]
        with TestDir() as test_dir:
            task_data = self.copy_pcd_file_and_get_task_data(test_dir)
            task = self._create_task(self.task, task_data)
            task_id = task["id"]
            for format_name in format_names:
                with self.subTest(format=f"{format_names}"):
                    cuboid_example = {
                        "version": 0,
                        "tags": [
                            {
                                "frame": 0,
                                "label_id": None,
                                "group": 0,
                                "source": "manual",
                                "attributes": []
                              }
                        ],
                        "shapes": [
                            {
                                "type": "cuboid",
                                "occluded": False,
                                "z_order": 0,
                                "points": [0.106, 0.202, -0.268, 0, -0.149, 0, 4.843, 4.483, 4.125],
                                "frame": 0,
                                "label_id": None,
                                "group": 0,
                                "source": "manual",
                                "attributes": []
                            },
                        ],
                        "tracks": []
                    }
                    annotation = self._get_tmp_annotation(task, cuboid_example)
                    response = self._put_api_v1_task_id_annotations(task_id, annotation)
                    self.assertEqual(response.status_code, status.HTTP_200_OK)
                    task_ann_prev = TaskAnnotation(task_id)
                    task_ann_prev.init_from_db()
                    url = self._generate_url_dump_tasks_annotations(task_id)
                    file_name = osp.join(test_dir, f"{format_name}.zip")
                    data = {
                        "format": format_name,
                    }
                    response = self._dump_api_v1_tasks_id_annotations(url, data, self.admin)
                    self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
                    response = self._dump_api_v1_tasks_id_annotations(url, data, self.admin)
                    self.assertEqual(response.status_code, status.HTTP_201_CREATED)
                    data = {
                        "format": format_name,
                        "action": "download",
                    }
                    response = self._dump_api_v1_tasks_id_annotations(url, data, self.admin)
                    self.assertEqual(response.status_code, status.HTTP_200_OK)
                    if response.status_code == status.HTTP_200_OK:
                        content = io.BytesIO(b"".join(response.streaming_content))
                        with open(file_name, "wb") as f:
                            f.write(content.getvalue())
                    self.assertTrue(osp.exists(file_name))

                    self._remove_annotations(task_id)

                    file_name = osp.join(test_dir, f"{format_name}.zip")
                    url = self._generate_url_upload_tasks_annotations(task_id, format_name)

                    with open(file_name, 'rb') as binary_file:
                        response = self._upload_api_v1_tasks_id_annotations(url, {"annotation_file": binary_file},
                                                                            self.admin)
                        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
                        response = self._upload_api_v1_tasks_id_annotations(url, {}, self.admin)
                        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
                    task_ann = TaskAnnotation(task_id)
                    task_ann.init_from_db()
                    # self.assertEqual(task_ann_prev.data, task_ann.data)
                    response = self._get_request(f"/api/v1/tasks/{task_id}/annotations", self.admin)
                    #self.assertEqual(response.data["tags"], annotation["tags"])
                    self._remove_annotations(task_id)

    def test_api_v1_dump_and_upload_sevelral_jobs(self):
        job_test_cases = ["all", "first"]
        format_names = ["Point Cloud Format 1.0", "Velodyne Points Format 1.0"]
        with TestDir() as test_dir:
            task_data = self.copy_pcd_file_and_get_task_data(test_dir)
            task_copy = copy.deepcopy(self.task)
            task_copy["overlap"] = 3
            task_copy["segment_size"] = 1
            task = self._create_task(task_copy, task_data)
            task_id = task["id"]
            for job_test_case in job_test_cases:
                annotation = self._get_tmp_annotation(task, self.cuboid_example)
                for format_name in format_names:
                    with self.subTest(format=f"{format_names}"):
                        jobs = self._get_jobs(task_id)
                        print(len(jobs), job_test_case)
                        if job_test_case == "all":
                            for job in jobs:
                                response = self._put_api_v1_job_id_annotations(job["id"], annotation)
                                self.assertEqual(response.status_code, status.HTTP_200_OK)
                        else:
                            response = self._put_api_v1_job_id_annotations(jobs[0]["id"], annotation)
                            self.assertEqual(response.status_code, status.HTTP_200_OK)

                        url = self._generate_url_dump_tasks_annotations(task_id)
                        file_name = osp.join(test_dir, f"{format_name}.zip")
                        data = {
                            "format": format_name,
                        }
                        response = self._dump_api_v1_tasks_id_annotations(url, data, self.admin)
                        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
                        response = self._dump_api_v1_tasks_id_annotations(url, data, self.admin)
                        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
                        data = {
                            "format": format_name,
                            "action": "download",
                        }
                        response = self._dump_api_v1_tasks_id_annotations(url, data, self.admin)
                        self.assertEqual(response.status_code, status.HTTP_200_OK)
                        if response.status_code == status.HTTP_200_OK:
                            content = io.BytesIO(b"".join(response.streaming_content))
                            with open(file_name, "wb") as f:
                                f.write(content.getvalue())
                        self.assertTrue(osp.exists(file_name))

                        self._remove_annotations(task_id)

