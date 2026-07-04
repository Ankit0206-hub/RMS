import logging
import sys

def setup_logging():
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )
    # Customize standard uvicorn loggers if needed
    logging.getLogger("uvicorn.access").handlers = [logging.StreamHandler(sys.stdout)]
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)

setup_logging()
logger = logging.getLogger("dineops")
