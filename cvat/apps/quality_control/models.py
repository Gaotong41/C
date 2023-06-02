# Copyright (C) 2023 CVAT.ai Corporation
#
# SPDX-License-Identifier: MIT

from __future__ import annotations
from copy import deepcopy

from enum import Enum
from typing import Any, Sequence

from django.core.exceptions import ValidationError
from django.db import models
from django.forms.models import model_to_dict

from cvat.apps.engine.models import Task, Job


class AnnotationConflictType(str, Enum):
    MISSING_ANNOTATION = 'missing_annotation'
    EXTRA_ANNOTATION = 'extra_annotation'
    MISMATCHING_LABEL = 'mismatching_label'
    LOW_OVERLAP = 'low_overlap'
    MISMATCHING_DIRECTION = 'mismatching_direction'
    MISMATCHING_ATTRIBUTES = 'mismatching_attributes'
    MISMATCHING_GROUPS = 'mismatching_groups'
    COVERED_ANNOTATION = 'covered_annotation'

    def __str__(self) -> str:
        return self.value

    @classmethod
    def choices(cls):
        return tuple((x.value, x.name) for x in cls)


class AnnotationConflictImportance(str, Enum):
    WARNING = 'warning'
    ERROR = 'error'

    def __str__(self) -> str:
        return self.value

    @classmethod
    def choices(cls):
        return tuple((x.value, x.name) for x in cls)


class MismatchingAnnotationKind(str, Enum):
    ATTRIBUTE = 'attribute'
    LABEL = 'label'

    def __str__(self) -> str:
        return self.value

    @classmethod
    def choices(cls):
        return tuple((x.value, x.name) for x in cls)


class QualityReportTarget(str, Enum):
    JOB = 'job'
    TASK = 'task'

    def __str__(self) -> str:
        return self.value

    @classmethod
    def choices(cls):
        return tuple((x.value, x.name) for x in cls)


class QualityReport(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE,
        related_name='quality_reports', null=True, blank=True)
    task = models.ForeignKey(Task, on_delete=models.CASCADE,
        related_name='quality_reports', null=True, blank=True)

    parent = models.ForeignKey('self', on_delete=models.CASCADE,
        related_name='children', null=True, blank=True)
    children: Sequence[QualityReport]

    created_date = models.DateTimeField(auto_now_add=True)
    target_last_updated = models.DateTimeField()
    gt_last_updated = models.DateTimeField()

    data = models.JSONField()

    conflicts: Sequence[AnnotationConflict]

    @property
    def target(self) -> QualityReportTarget:
        if self.job:
            return QualityReportTarget.JOB
        elif self.task:
            return QualityReportTarget.TASK
        else:
            assert False

    def _parse_report(self):
        from cvat.apps.quality_control.quality_reports import ComparisonReport
        return ComparisonReport.from_json(self.data)

    @property
    def parameters(self):
        report = self._parse_report()
        return report.parameters

    @property
    def summary(self):
        report = self._parse_report()
        return report.comparison_summary

    def get_task(self) -> Task:
        if self.task is not None:
            return self.task
        else:
            return self.job.segment.task

    def get_json_report(self) -> str:
        return self.data

    def clean(self):
        if not (self.job is not None) ^ (self.task is not None):
            raise ValidationError("One of the 'job' and 'task' fields must be set")

    @property
    def organization_id(self):
        if task := self.get_task():
            return getattr(task.organization, 'id', None)
        return None


class AnnotationConflict(models.Model):
    report = models.ForeignKey(QualityReport,
        on_delete=models.CASCADE, related_name='conflicts')
    frame = models.PositiveIntegerField()
    type = models.CharField(max_length=32, choices=AnnotationConflictType.choices())
    importance = models.CharField(max_length=32, choices=AnnotationConflictImportance.choices())

    annotation_ids: Sequence[AnnotationId]

    @property
    def organization_id(self):
        if report := self.report:
            return report.organization_id
        return None


class AnnotationType(str, Enum):
    TAG = 'tag'
    TRACK = 'track'
    RECTANGLE = 'rectangle'
    POLYGON = 'polygon'
    POLYLINE = 'polyline'
    POINTS = 'points'
    ELLIPSE = 'ellipse'
    CUBOID = 'cuboid'
    MASK = 'mask'
    SKELETON = 'skeleton'

    def __str__(self) -> str:
        return self.value

    @classmethod
    def choices(cls):
        return tuple((x.value, x.name) for x in cls)


class AnnotationId(models.Model):
    conflict = models.ForeignKey(AnnotationConflict,
        on_delete=models.CASCADE, related_name='annotation_ids')

    obj_id = models.PositiveIntegerField()
    job_id = models.PositiveIntegerField()
    type = models.CharField(max_length=32, choices=AnnotationType.choices())


class QualitySettings(models.Model):
    task = models.OneToOneField(Task,
        on_delete=models.CASCADE, related_name='quality_settings'
    )

    iou_threshold = models.FloatField()
    oks_sigma = models.FloatField()
    line_thickness = models.FloatField()

    low_overlap_threshold = models.FloatField()

    oriented_lines = models.BooleanField()
    line_orientation_threshold = models.FloatField()

    compare_groups = models.BooleanField()
    group_match_threshold = models.FloatField()

    check_covered_annotations = models.BooleanField()
    object_visibility_threshold = models.FloatField()

    panoptic_comparison = models.BooleanField()

    compare_attributes = models.BooleanField()

    def __init__(self, *args: Any, **kwargs: Any) -> None:
        defaults = deepcopy(self.get_defaults())
        for field in self._meta.fields:
            if field.name in defaults:
                field.default = defaults[field.name]

        super().__init__(*args, **kwargs)

    @classmethod
    def get_defaults(cls) -> dict:
        import cvat.apps.quality_control.quality_reports as qc
        default_settings = qc.DatasetComparator.DEFAULT_SETTINGS.to_dict()

        existing_fields = {f.name for f in cls._meta.fields}
        return {k: v for k, v in default_settings.items() if k in existing_fields}

    def to_dict(self):
        return model_to_dict(self)

    @property
    def organization_id(self):
        return getattr(self.task.organization, 'id', None)
