# Copyright (C) 2023 CVAT.ai Corporation
#
# SPDX-License-Identifier: MIT

import logging
from pathlib import Path
from time import time
from django.conf import settings

slogger = logging.getLogger('cvat.server')

def clear_import_cache(path: Path, creation_time: float) -> None:
    """
    This function checks and removes the import files if they have not been removed from rq import jobs.
    This means that for some reason file was uploaded to CVAT server but rq import job was not created.

    Args:
        path (Path): path to file
        creation_time (float): file creation time
    """
    if path.is_file() and (time() - creation_time + 1) >= settings.IMPORT_CACHE_CLEAN_DELAY.total_seconds():
        path.unlink()
        slogger.warning(f"The file {str(path)} was removed from cleaning job.")
