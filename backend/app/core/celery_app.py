"""
Celery application instance.
Workers pick up scan and report generation tasks from Redis queues.
"""
from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "cyberinspect_worker",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["app.tasks.scan_tasks", "app.tasks.report_tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_routes={
        "app.tasks.scan_tasks.*": {"queue": "scans"},
        "app.tasks.report_tasks.*": {"queue": "reports"},
    },
    worker_prefetch_multiplier=1,
    task_acks_late=True,
)
