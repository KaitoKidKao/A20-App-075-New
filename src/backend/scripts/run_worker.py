import os


def main():
    redis_url = os.getenv("REDIS_URL", "").strip()
    if not redis_url:
        raise RuntimeError("REDIS_URL is required to run RQ worker.")

    from redis import Redis
    from rq import Connection, Queue, Worker

    redis_conn = Redis.from_url(redis_url)
    with Connection(redis_conn):
        queues = [Queue("video-pipeline")]
        worker = Worker(queues)
        worker.work()


if __name__ == "__main__":
    main()
